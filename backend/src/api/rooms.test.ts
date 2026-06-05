import supertest from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";

// Each test suite gets a fresh app instance (fresh in-memory store).
// Because roomStore is a module-level Map, we need isolation.
// Vitest runs each test file in its own worker so the module cache
// is fresh per file; within this file, we ensure isolation by using
// unique player names that don't collide.

const app = createApp();
const request = supertest(app);

describe("POST /rooms", () => {
  it("creates a room and returns participantId + room with hostId", async () => {
    const response = await request
      .post("/rooms")
      .send({ playerName: "Alice" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body.participantId).toBeDefined();
    expect(response.body.room.hostId).toBe(response.body.participantId);
    expect(response.body.room.status).toBe("lobby");
    expect(response.body.room.participants).toHaveLength(1);
    expect(response.body.room.participants[0].name).toBe("Alice");
  });

  it("rejects empty playerName with 400", async () => {
    const response = await request
      .post("/rooms")
      .send({ playerName: "" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });

  it("rejects whitespace-only playerName with 400", async () => {
    const response = await request
      .post("/rooms")
      .send({ playerName: "   " })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });

  it("rejects missing playerName with 400", async () => {
    const response = await request
      .post("/rooms")
      .send({})
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });
});

describe("POST /rooms/:code/join", () => {
  it("joins an existing room", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "Host" })
      .set("Content-Type", "application/json");

    const code: string = createResponse.body.room.code;

    const joinResponse = await request
      .post(`/rooms/${code}/join`)
      .send({ playerName: "Guest" })
      .set("Content-Type", "application/json");

    expect(joinResponse.status).toBe(200);
    expect(joinResponse.body.participantId).toBeDefined();
    expect(joinResponse.body.room.participants).toHaveLength(2);
    // hostId must not change when a second player joins
    expect(joinResponse.body.room.hostId).toBe(createResponse.body.participantId);
  });

  it("returns 404 for an unknown room code", async () => {
    const response = await request
      .post("/rooms/ZZZZ/join")
      .send({ playerName: "Nobody" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
  });

  it("rejects empty playerName with 400", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "Host2" })
      .set("Content-Type", "application/json");

    const code: string = createResponse.body.room.code;

    const response = await request
      .post(`/rooms/${code}/join`)
      .send({ playerName: "" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });
});

describe("GET /rooms/:code", () => {
  it("returns the room snapshot for a valid code", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "Alice" })
      .set("Content-Type", "application/json");

    const { participantId, room } = createResponse.body as {
      participantId: string;
      room: { code: string };
    };

    const getResponse = await request
      .get(`/rooms/${room.code}`)
      .query({ participantId });

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.room.code).toBe(room.code);
  });

  it("returns 404 for an unknown code", async () => {
    const response = await request.get("/rooms/XXXX");

    expect(response.status).toBe(404);
  });
});

describe("Room isolation", () => {
  it("two rooms maintain independent participant lists", async () => {
    const roomA = await request
      .post("/rooms")
      .send({ playerName: "PlayerA" })
      .set("Content-Type", "application/json");

    const roomB = await request
      .post("/rooms")
      .send({ playerName: "PlayerB" })
      .set("Content-Type", "application/json");

    const codeA: string = roomA.body.room.code;
    const codeB: string = roomB.body.room.code;

    // Join only room B
    await request
      .post(`/rooms/${codeB}/join`)
      .send({ playerName: "ExtraPlayer" })
      .set("Content-Type", "application/json");

    // Room A should still have only 1 participant
    const getA = await request
      .get(`/rooms/${codeA}`)
      .query({ participantId: roomA.body.participantId });

    expect(getA.body.room.participants).toHaveLength(1);
    expect(getA.body.room.participants[0].name).toBe("PlayerA");
  });
});

describe("POST /rooms/:code/start", () => {
  it("starts the game and assigns the host as drawer if >= 2 players", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "Host" })
      .set("Content-Type", "application/json");

    const code = createResponse.body.room.code;
    const hostId = createResponse.body.participantId;

    await request
      .post(`/rooms/${code}/join`)
      .send({ playerName: "Guest" })
      .set("Content-Type", "application/json");

    const startResponse = await request
      .post(`/rooms/${code}/start`)
      .send({ participantId: hostId })
      .set("Content-Type", "application/json");

    expect(startResponse.status).toBe(200);
    expect(startResponse.body.room.status).toBe("playing");
    expect(startResponse.body.room.drawerId).toBe(hostId);
    expect(startResponse.body.room.secretWord).toBeDefined();
  });

  it("returns 400 if less than 2 players are in the room", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "HostAlone" })
      .set("Content-Type", "application/json");

    const code = createResponse.body.room.code;
    const hostId = createResponse.body.participantId;

    const startResponse = await request
      .post(`/rooms/${code}/start`)
      .send({ participantId: hostId })
      .set("Content-Type", "application/json");

    expect(startResponse.status).toBe(400);
  });

  it("returns 403 if a non-host tries to start the game", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "Host" })
      .set("Content-Type", "application/json");

    const code = createResponse.body.room.code;

    const joinResponse = await request
      .post(`/rooms/${code}/join`)
      .send({ playerName: "Guest" })
      .set("Content-Type", "application/json");

    const guestId = joinResponse.body.participantId;

    const startResponse = await request
      .post(`/rooms/${code}/start`)
      .send({ participantId: guestId })
      .set("Content-Type", "application/json");

    expect(startResponse.status).toBe(403);
  });

  it("exposes the secretWord only to the drawer", async () => {
    const createResponse = await request
      .post("/rooms")
      .send({ playerName: "HostDrawer" })
      .set("Content-Type", "application/json");

    const code = createResponse.body.room.code;
    const hostId = createResponse.body.participantId;

    const joinResponse = await request
      .post(`/rooms/${code}/join`)
      .send({ playerName: "Guest" })
      .set("Content-Type", "application/json");

    const guestId = joinResponse.body.participantId;

    await request
      .post(`/rooms/${code}/start`)
      .send({ participantId: hostId })
      .set("Content-Type", "application/json");

    const getHostResponse = await request
      .get(`/rooms/${code}`)
      .query({ participantId: hostId });

    const getGuestResponse = await request
      .get(`/rooms/${code}`)
      .query({ participantId: guestId });

    expect(getHostResponse.body.room.secretWord).toBeDefined();
    expect(getGuestResponse.body.room.secretWord).toBeUndefined();
  });
});

// ── Shared helper: create a started 2-player room ────────────────────────
async function startedRoom() {
  const create = await request
    .post("/rooms")
    .send({ playerName: "Host" })
    .set("Content-Type", "application/json");

  const code: string = create.body.room.code;
  const hostId: string = create.body.participantId;

  const join = await request
    .post(`/rooms/${code}/join`)
    .send({ playerName: "Guest" })
    .set("Content-Type", "application/json");

  const guestId: string = join.body.participantId;

  await request
    .post(`/rooms/${code}/start`)
    .send({ participantId: hostId })
    .set("Content-Type", "application/json");

  return { code, hostId, guestId };
}

describe("POST /rooms/:code/guess", () => {
  it("accepts a correct guess and adds 100 to the guesser's score", async () => {
    const { code, guestId } = await startedRoom();

    // STARTER_WORDS[0] is "rocket"
    const response = await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "rocket" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.room.scores[guestId]).toBe(100);
    expect(response.body.room.guesses).toHaveLength(1);
    expect(response.body.room.guesses[0].correct).toBe(true);
  });

  it("is case-insensitive — 'ROCKET' still scores 100", async () => {
    const { code, guestId } = await startedRoom();

    const response = await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "ROCKET" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.room.scores[guestId]).toBe(100);
    expect(response.body.room.guesses[0].correct).toBe(true);
  });

  it("trims whitespace before comparison — '  rocket  ' scores 100", async () => {
    const { code, guestId } = await startedRoom();

    const response = await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "  rocket  " })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.room.scores[guestId]).toBe(100);
  });

  it("accepts an incorrect guess and adds 0 to the score", async () => {
    const { code, guestId } = await startedRoom();

    const response = await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "pizza" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.room.scores[guestId]).toBe(0);
    expect(response.body.room.guesses[0].correct).toBe(false);
  });

  it("returns 400 for an empty guess", async () => {
    const { code, guestId } = await startedRoom();

    const response = await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });

  it("returns 400 for a whitespace-only guess", async () => {
    const { code, guestId } = await startedRoom();

    const response = await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "   " })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });

  it("guess history is visible to all participants via polling", async () => {
    const { code, hostId, guestId } = await startedRoom();

    await request
      .post(`/rooms/${code}/guess`)
      .send({ participantId: guestId, guess: "rocket" })
      .set("Content-Type", "application/json");

    // Poll as the host — host should see the guess in history
    const poll = await request
      .get(`/rooms/${code}`)
      .query({ participantId: hostId });

    expect(poll.body.room.guesses).toHaveLength(1);
    expect(poll.body.room.guesses[0].participantName).toBe("Guest");
    expect(poll.body.room.guesses[0].text).toBe("rocket");
  });

  it("all scores initialised to 0 at game start", async () => {
    const { code, hostId, guestId } = await startedRoom();

    const poll = await request
      .get(`/rooms/${code}`)
      .query({ participantId: hostId });

    expect(poll.body.room.scores[hostId]).toBe(0);
    expect(poll.body.room.scores[guestId]).toBe(0);
  });
});


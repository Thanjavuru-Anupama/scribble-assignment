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

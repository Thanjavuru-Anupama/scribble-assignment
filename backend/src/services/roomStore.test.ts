import { describe, expect, it } from "vitest";
import { createRoom, joinRoom } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("createRoom sets hostId to the first participant's id", () => {
    const result = createRoom("Alice");

    expect(result.room.hostId).toBe(result.participantId);
  });

  it("createRoom assigns unique codes for different rooms", () => {
    const a = createRoom("Alice");
    const b = createRoom("Bob");

    expect(a.room.code).not.toBe(b.room.code);
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("joinRoom adds participant to an existing room", () => {
    const { room } = createRoom("Alice");
    const joinResult = joinRoom(room.code, "Bob");

    expect(joinResult).not.toBeNull();
    expect(joinResult!.room.participants).toHaveLength(2);
    expect(joinResult!.room.participants[1].name).toBe("Bob");
  });

  it("joinRoom does not change the hostId", () => {
    const { room, participantId: hostId } = createRoom("Alice");
    const joinResult = joinRoom(room.code, "Bob");

    expect(joinResult!.room.hostId).toBe(hostId);
  });

  it("two rooms are fully isolated", () => {
    const a = createRoom("Alice");
    const b = createRoom("Bob");

    joinRoom(b.room.code, "Charlie");

    // Join room A to inspect its state — Alice + Observer = 2
    const aResult = joinRoom(a.room.code, "Observer");
    expect(aResult!.room.participants).toHaveLength(2);
    expect(aResult!.room.hostId).toBe(a.participantId);

    // Room B has Bob(host) + Charlie; joining adds Observer2 → 3 total
    const bResult = joinRoom(b.room.code, "Observer2");
    expect(bResult!.room.participants).toHaveLength(3);
    expect(bResult!.room.hostId).toBe(b.participantId);
  });
});

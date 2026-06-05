import { describe, expect, it } from "vitest";
import { createRoomSchema, joinRoomSchema, roomCodeParamsSchema } from "./schemas.js";

describe("schemas", () => {
  describe("createRoomSchema", () => {
    it("accepts a valid body with playerName", () => {
      const result = createRoomSchema.parse({ playerName: "Alice" });
      expect(result.playerName).toBe("Alice");
    });

    it("trims whitespace from playerName", () => {
      const result = createRoomSchema.parse({ playerName: "  Alice  " });
      expect(result.playerName).toBe("Alice");
    });

    it("rejects missing playerName", () => {
      expect(() => createRoomSchema.parse({})).toThrow();
    });

    it("rejects empty playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "" })).toThrow();
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow();
    });
  });

  describe("joinRoomSchema", () => {
    it("accepts a valid body with playerName", () => {
      const result = joinRoomSchema.parse({ playerName: "Bob" });
      expect(result.playerName).toBe("Bob");
    });

    it("rejects empty playerName", () => {
      expect(() => joinRoomSchema.parse({ playerName: "" })).toThrow();
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => joinRoomSchema.parse({ playerName: "  " })).toThrow();
    });
  });

  describe("roomCodeParamsSchema", () => {
    it("accepts a valid code", () => {
      const result = roomCodeParamsSchema.parse({ code: "ABCD" });
      expect(result.code).toBe("ABCD");
    });

    it("rejects missing code", () => {
      expect(() => roomCodeParamsSchema.parse({})).toThrow();
    });
  });
});

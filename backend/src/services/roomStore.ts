import { randomUUID } from "node:crypto";
import type { Guess, Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    participants: [participant],
    scores: {},
    guesses: [],
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function startGame(code: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  if (room.participants.length < 2) {
    throw new Error("Need at least 2 players to start");
  }

  room.status = "playing";
  room.drawerId = room.hostId;
  room.secretWord = STARTER_WORDS[0];
  // Initialise every participant's score at 0
  room.scores = {};
  room.guesses = [];
  for (const p of room.participants) {
    room.scores[p.id] = 0;
  }
  room.updatedAt = now();
  rooms.set(room.code, room);

  return cloneRoom(room);
}

export function submitGuess(code: string, participantId: string, guessText: string) {
  const trimmed = guessText.trim();

  if (!trimmed) {
    throw new Error("Guess cannot be empty");
  }

  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  if (room.status !== "playing" || !room.secretWord) {
    throw new Error("Game is not active");
  }

  const participant = room.participants.find((p) => p.id === participantId);

  if (!participant) {
    throw new Error("Participant not found in room");
  }

  const isCorrect = trimmed.toLowerCase() === room.secretWord.toLowerCase();

  if (isCorrect) {
    room.scores[participantId] = (room.scores[participantId] ?? 0) + 100;
  }

  const guess: Guess = {
    id: randomUUID(),
    participantId,
    participantName: participant.name,
    text: trimmed,
    correct: isCorrect,
    submittedAt: now()
  };

  room.guesses.push(guess);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return cloneRoom(room);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const isDrawer = viewerParticipantId === room.drawerId;

  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    drawerId: room.drawerId,
    secretWord: isDrawer ? room.secretWord : undefined,
    participants: room.participants.map((participant) => ({ ...participant })),
    scores: { ...room.scores },
    guesses: room.guesses.map((g) => ({ ...g })),
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}

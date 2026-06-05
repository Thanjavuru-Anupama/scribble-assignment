export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing" | "result";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Guess {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  correct: boolean;
  submittedAt: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  drawerId?: string;
  secretWord?: string;
  participants: Participant[];
  scores: Record<string, number>;
  guesses: Guess[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  drawerId?: string;
  secretWord?: string;
  participants: Participant[];
  scores: Record<string, number>;
  guesses: Guess[];
  availableWords: string[];
  roles: ParticipantRole[];
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}

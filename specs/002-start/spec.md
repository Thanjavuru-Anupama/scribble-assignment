# Scenario 2 Specification: Game Start & Drawer Flow

## 1. Context and Problem Statement

When the lobby is ready and the game starts, the room needs to transition from a waiting state (`lobby`) into active play (`playing`). The transition must assign game roles, select the secret word, and enforce visibility controls over the word so only the designated drawer knows what to draw.

This specification details the startGame action, role assignment (assigning host as drawer), deterministic selection of the word, masking of the word from guessers, lobby redirection, and page layouts for drawer vs guesser.

---

## 2. Acceptance Criteria

### AC-12: Start Game Action
- **Given** the host is on the Lobby screen and at least 2 players are present,
  **When** the host clicks the "Start Game" button,
  **Then** a `POST /rooms/:code/start` request is dispatched, and the room status transitions to `"playing"`.

### AC-13: Drawer Assignment
- **Given** the room transitions to the `"playing"` status,
  **When** the first round begins,
  **Then** the host is assigned as the first drawer (`drawerId = room.hostId`).

### AC-14: Secret Word Selection
- **Given** a game transitions to `"playing"`,
  **When** the first round starts,
  **Then** a secret word is deterministically selected from the starter word list (e.g. the first word `rocket`).

### AC-15: Secret Word Visibility
- **Given** the secret word has been selected for the round,
  **When** a client polls for the room snapshot,
  **Then** the `secretWord` field is returned in the response **only** if the client's `participantId` matches the `drawerId`. For guessers, this field is `undefined` or excluded to prevent cheating.

### AC-16: Game Page Redirection
- **Given** players are waiting in the lobby,
  **When** the room status transitions to `"playing"`,
  **Then** all players in the room are automatically redirected to the Game Page (`/game`) via polling synchronization.

### AC-17: Game Page UI
- **Given** a player has been redirected to the Game Page,
  **When** the page renders,
  **Then**:
  - The drawer sees the canvas drawing area and the revealed secret word they must draw.
  - Guessers see the canvas drawing area with a placeholder message: `"Waiting for [drawer name] to draw..."` and do not see the secret word.

---

## 3. Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Host attempts to start game with 1 player directly via API | Backend returns `400 Bad Request` and throws error "Need at least 2 players to start". |
| Non-host attempts to start game via direct API call | Backend returns `403 Forbidden` with "Only the host can start the game". |
| Guest polls after game starts | Guest sees room status is `"playing"`, matches the redirect condition, and routes to `/game`. |

---

## 4. Out-of-Scope

- Freehand canvas drawing synchronization, clearing drawing, guess submission, guess validation, scoring.
- Timer limits or automatic round ending.
- Mid-game joiners or spectators.
- Changing drawers or multiple rounds.

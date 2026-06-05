# Scenario 4 Specification: Result, Restart & Final Validation

## 1. Context and Problem Statement

A game round needs a clean conclusion. When the round is ended, all players should be presented with the final results (the secret word revealed to everyone, final scoreboard, and full guess history). Guessing must be closed. Afterwards, the host must be able to restart the game, returning everyone back to the lobby with preserved participant lists but clean round states.

This specification details the transition to the result state (API endpoint), secret word reveal visibility rules, Results overlay/screen layout, restart game endpoint, game state clearing (resetting scores, guesses, drawerId, secretWord), and automatic redirection of guessers back to the lobby.

---

## 2. Acceptance Criteria

### AC-27: Room Status "result"
- **Given** a round is active (`playing`),
  **When** the round ends,
  **Then** the room status transitions to `"result"`.

### AC-28: End Round Action (Host-Only)
- **Given** the host is on the Game Page,
  **When** they click the "End Round" button,
  **Then** a `POST /rooms/:code/end` is sent, and the room status transitions to `"result"`.
- If a guest attempts to end the round directly, the backend returns a `403 Forbidden` response.

### AC-29: Secret Word Reveal
- **Given** the room status has transitioned to `"result"`,
  **When** any player gets the room state (e.g. via polling),
  **Then** the `secretWord` is exposed in the `RoomSnapshot` to all participants, regardless of their role.

### AC-30: Results Screen UI View
- **Given** the room status is `"result"`,
  **When** the Game Page renders,
  **Then**:
  - The guess submission form is completely hidden or disabled for all players, showing a "guessing closed" message.
  - The canvas area displays the round results and reveals the correct secret word.
  - The final scores remain visible on the scoreboard, and the full guess history remains visible.

### AC-31: Restart Game Action (Host-Only)
- **Given** the room status is `"result"`,
  **When** the host clicks the "Restart Game" button,
  **Then** a `POST /rooms/:code/restart` is sent:
  - The room status changes back to `"lobby"`.
  - All round state (scores, guesses, drawerId, secretWord) is completely cleared.
  - All participants currently in the room are preserved.
- If a guest attempts to restart the game, the backend returns `403 Forbidden`.

### AC-32: Auto-Redirect on Restart
- **Given** the room has been restarted by the host,
  **When** other players poll the room state,
  **Then** they are automatically redirected back to the Lobby page (`/lobby`).

---

## 3. Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Guess submission attempt after round has ended | Backend returns `409 Conflict` or `400 Bad Request` with "Game is not active". |
| Non-host attempts to end round or restart game via API | Backend returns `403 Forbidden` and denies action. |
| Participants list during results view | New players can join/leave, and the list updates via polling. Preserved on restart. |

---

## 4. Out-of-Scope

- Automatically starting another round with a new drawer.
- Rotating drawers automatically.
- Keeping cumulative scores across restarts (restarting resets scores to `{}`).

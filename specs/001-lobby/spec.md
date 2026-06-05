# Scenario 1 Specification: Room Setup & Lobby

## 1. Context and Problem Statement

A multiplayer game like Scribble requires a structured lobby system where players can create and join game rooms.
This specification details the room creation workflow, host assignment, input validation (both client-side and server-side), room isolation, real-time lobby list synchronization using polling, and access controls for starting the game.

The creator of a room is automatically assigned the role of "Host" and is the only person authorized to start the game. A minimum of 2 players must be present in the room before the game can begin.

---

## 2. Acceptance Criteria

### AC-1: Room Creation — Host Assignment
- **Given** a player submits the Create Room form with a valid, non-empty player name,  
  **When** the backend processes `POST /rooms`,  
  **Then** the response includes a generated `participantId` and a `room.hostId` equal to that `participantId`. The creator is permanently assigned as the host of the room.

### AC-2: Room Creation — Empty Name Rejection
- **Given** a player submits the Create Room form with a blank or whitespace-only player name,  
  **When** the form is submitted,  
  **Then** an inline error message is displayed in the UI, and no HTTP request is sent to the backend.

### AC-3: Join Room — Valid Code
- **Given** a player enters a valid 4-character room code and a non-empty player name,  
  **When** the frontend calls `POST /rooms/:code/join`,  
  **Then** the player is added to that room, and the response includes the updated list of participants.

### AC-4: Join Room — Empty Name Rejection
- **Given** a player submits the Join Room form with a blank or whitespace-only player name,  
  **When** the form is submitted,  
  **Then** an inline error is shown in the UI, and no HTTP request is sent.

### AC-5: Join Room — Invalid Code Format Rejection
- **Given** a player submits the Join Room form with a code that is empty, fewer than 4 characters, or contains invalid characters,  
  **When** the form is submitted,  
  **Then** an inline error is shown, and no HTTP request is sent.

### AC-6: Join Room — Unknown Code Rejection
- **Given** a player submits a correctly-formatted 4-character code that does not correspond to an active room,  
  **When** `POST /rooms/:code/join` returns a `404 Not Found` error,  
  **Then** the UI displays a clear error message (e.g., "Unable to join room") and the player remains on the Join Room page.

### AC-7: Room Isolation
- **Given** two rooms exist simultaneously (Room A and Room B),  
  **When** a player joins Room B,  
  **Then** Room A's participant list remains completely unchanged, and the two rooms share no in-memory state.

### AC-8: Lobby Polling
- **Given** a player is on the Lobby screen,  
  **When** another player joins the same room,  
  **Then** the participant list on the first player's Lobby screen updates automatically within approximately 2 seconds.
- The polling interval must be configured to 2000 ms.
- Polling starts when the Lobby page mounts and ceases when it unmounts.
- In-flight request overlap is prevented using a flag.
- Network polling failures are handled gracefully as non-blocking status logs.

### AC-9: Host-Only Start Game
- **Given** a player is on the Lobby screen and is not the host,  
  **When** the Lobby renders,  
  **Then** the "Start Game" button is not visible to that player, and they see a "Waiting for the host..." message instead.

### AC-10: 2-Player Minimum
- **Given** the host is on the Lobby screen and fewer than 2 players are present (i.e. only the host),  
  **When** the Lobby renders,  
  **Then** the "Start Game" button is visible but disabled, and a hint message is shown explaining the 2-player minimum requirement.

### AC-11: Start Game Enabled
- **Given** the host is on the Lobby screen and 2 or more players are present,  
  **When** the Lobby renders,  
  **Then** the "Start Game" button is enabled, allowing the host to click it.

---

## 3. Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Player name with leading/trailing whitespace | The name is trimmed before validation (e.g., `"  Bob  "` becomes `"Bob"`). |
| Room code typed in lowercase | Normalized to uppercase on submission (e.g., `"abcd"` becomes `"ABCD"`). |
| Polling failure (network disconnect) | Non-blocking status error shown; page does not crash; polling resumes on next tick. |

---

## 4. Out-of-Scope

- Actual drawing canvas gameplay, timers, and word selection.
- Host transfer, player kicking, and moderator tools.
- Databases and user authentication.

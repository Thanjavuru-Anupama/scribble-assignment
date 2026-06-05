# Scenario 4 Plan: Result, Restart & Final Validation

## 1. Findings & Data Model

### Data Models
- Enlarge `RoomStatus` type: `"lobby" | "playing" | "result"`.

### Endpoints Design
- `POST /rooms/:code/end`:
  - Body: `{ participantId }`
  - Validation: Requester is the host.
  - Action: Sets `room.status = "result"`.
- `POST /rooms/:code/restart`:
  - Body: `{ participantId }`
  - Validation: Requester is the host.
  - Action:
    - Sets `room.status = "lobby"`.
    - Resets `drawerId = undefined`, `secretWord = undefined`, `scores = {}`, `guesses = []`.
    - Preserves `participants` list.

### Word Reveal Visibility Rules
Update `toRoomSnapshot(room, viewerParticipantId)`:
- If `room.status === "result"`, expose the `secretWord` to all players (bypass the `isDrawer` check).

---

## 2. Implementation Steps

1. **Backend Service**:
   - Write `endRound(code)` and `restartGame(code)` service helpers.
   - Update `toRoomSnapshot` to expose secret word for `"result"` status.
2. **Backend API**:
   - Create Zod validation schemas for end round and restart actions.
   - Implement `POST /rooms/:code/end` and `POST /rooms/:code/restart` endpoint handlers.
3. **Backend Tests**:
   - Write integration tests validating end round (expose word), restart game (clean state, keep players), and permissions (block non-hosts).
4. **Frontend API & Store**:
   - Expose endpoints in client call list and state store actions.
5. **Frontend UI Components**:
   - Update redirect logic in `GamePage.tsx` to stay on results view and only route back on `"lobby"` status.
   - Build overlay results summary inside Game Page canvas area, showing word reveal and a "Restart Game" button for host, or waiting text for guests.
   - Render an "End Round" button for the host during play.
   - Disable/hide guess input in `GuessForm.tsx` when status is `"result"`.
6. **Frontend Tests**:
   - Add unit tests verifying end round host controls, results display details, guess restriction messages, and restart button behaviors.

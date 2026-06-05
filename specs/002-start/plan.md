# Scenario 2 Plan: Game Start & Drawer Flow

## 1. Findings & Design

### Models Update
We must update `RoomStatus` and add drawer tracking properties to the `Room` data types.
```ts
type RoomStatus = "lobby" | "playing";
```
We also require `drawerId?: string` and `secretWord?: string` on both the service `Room` model and the serialized `RoomSnapshot`.

### Endpoints Design
- `POST /rooms/:code/start`:
  - Body: `{ participantId }`
  - Validations:
    - Code matches active room.
    - Requester `participantId` matches `room.hostId` (returns `403 Forbidden` if it doesn't).
    - Room has at least 2 participants (returns `400 Bad Request` if it doesn't).
  - Actions:
    - Changes `room.status = "playing"`.
    - Assigns `room.drawerId = room.hostId`.
    - Selects `room.secretWord = STARTER_WORDS[0]`.

### Word Masking Design
In `toRoomSnapshot(room, viewerParticipantId)`:
- Evaluate `isDrawer = viewerParticipantId === room.drawerId`.
- If `isDrawer`, serialize `secretWord` as is.
- Otherwise, set `secretWord: undefined`.

---

## 2. Implementation Checklist

1. **Backend Types**: Update `RoomStatus` and interfaces in `backend/src/models/game.ts`.
2. **Backend Service**:
   - Write `startGame(code)` in `roomStore.ts`.
   - Update `toRoomSnapshot` to conditionally hide `secretWord`.
3. **Backend API**:
   - Write the `/rooms/:code/start` route.
   - Enforce host checks and participant counts.
4. **Backend Tests**:
   - Add integration tests verifying route constraints (errors for non-host and single player).
   - Test that the secret word is revealed only to the drawer.
5. **Frontend State & UI**:
   - Add API calls and actions to store.
   - Redirect to `/game` in Lobby Page.
   - Implement Game Page rendering and redirect.

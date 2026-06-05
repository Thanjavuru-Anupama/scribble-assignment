# Scenario 1 Plan: Room Setup & Lobby

## 1. Codebase Findings & Gaps

### Gaps Identified
1. **No `hostId` Property**: The initial `Room` and `RoomSnapshot` data models do not track the host.
2. **Missing Polling**: The React `LobbyPage` relies on a manual refresh button instead of automatic polling.
3. **No Validation**: Lobby name inputs allow blank spaces, and join code validation is absent on the frontend.
4. **Vite API base URL bug**: The API url suffix had a trailing `/bug` which caused request routing issues.

### Key Assumptions
- **Host Assignment**: The player creating the room is automatically the host.
- **Polling Setup**: Polling should stop immediately when the Lobby unmounts.
- **Overlap Protection**: Polling ticks should skip if a previous poll request is still in-flight.

---

## 2. Technical Implementation Detail

### State Models

#### Room Model
```ts
interface Room {
  code: string;
  status: "lobby";
  hostId: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}
```

#### RoomSnapshot
```ts
interface RoomSnapshot {
  code: string;
  status: "lobby";
  hostId: string;
  participants: Participant[];
  availableWords: string[];
  roles: ParticipantRole[];
}
```

---

## 3. Data Flow

1. **Create Room**:
   - Client sends name -> `POST /rooms`
   - Service creates Room, registers participant ID, sets `hostId = participant.id`.
   - Returns room session response containing `participantId` and `RoomSnapshot`.
2. **Join Room**:
   - Client sends code + name -> `POST /rooms/:code/join`
   - Service verifies room exists, appends participant, returns `participantId` and `RoomSnapshot`.
3. **Polling**:
   - Client sets up a 2s interval `setInterval`.
   - Fires `GET /rooms/:code?participantId=...` on each tick.
   - Refreshes local Zustand/ExternalStore.

---

## 4. Implementation Steps

1. Update `backend/src/models/game.ts` to include `hostId` in `Room` and `RoomSnapshot`.
2. Update `backend/src/services/roomStore.ts` to set `hostId` in `createRoom` and serialize it in `toRoomSnapshot`.
3. Improve backend schema validation in `backend/src/api/schemas.ts` using `z.string().trim().min(1)`.
4. Fix frontend API client `API_BASE_URL` by removing `/bug` in `frontend/src/services/api.ts`.
5. Implement client-side validation in `CreateRoomPage.tsx` and `JoinRoomPage.tsx`.
6. Implement `setInterval` polling in `LobbyPage.tsx` with interval clearing and in-flight guard.
7. Hide/disable "Start Game" button based on host state and participant count.

---

## 5. Testing Strategy

- **Backend Unit Tests**: Verify `roomStore` creates host properly.
- **Backend Integration Tests**: Test Express routes for valid/invalid joining and creation using `supertest`.
- **Frontend Component Tests**: Verify lobby displays start button only for host, disabled with 1 player, and enabled with 2+ players.

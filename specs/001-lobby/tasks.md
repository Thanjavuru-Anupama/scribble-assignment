# Scenario 1 Tasks: Room Setup & Lobby

## Implementation Checklist

### Phase 1: Backend State & Service
- [x] T1.1 Add `hostId: string` to `Room` interface in `backend/src/models/game.ts`
- [x] T1.2 Add `hostId: string` to `RoomSnapshot` interface in `backend/src/models/game.ts`
- [x] T1.3 Set `room.hostId = participant.id` in `createRoom` in `backend/src/services/roomStore.ts`
- [x] T1.4 Return `hostId` in `toRoomSnapshot` from `backend/src/services/roomStore.ts`
- [x] T1.5 Create unit test verifying `createRoom` registers first participant as the host

### Phase 2: Input Validation
- [x] T2.1 Change `playerName` to trimmed non-empty schema in `backend/src/api/schemas.ts`
- [x] T2.2 Add validation tests in `backend/src/api/schemas.test.ts`
- [x] T2.3 Add integration tests in `backend/src/api/rooms.test.ts`

### Phase 3: Frontend Client & Pages
- [x] T3.1 Remove `/bug` from base API url in `frontend/src/services/api.ts`
- [x] T3.2 Expose `hostId` in frontend `RoomSnapshot` interface
- [x] T3.3 Add client-side name/code validation on Create and Join pages

### Phase 4: Lobby Interface & Polling
- [x] T4.1 Set up 2000 ms polling in `LobbyPage.tsx`
- [x] T4.2 Add cleanup effect to clear polling interval
- [x] T4.3 Add guard against overlapping poll requests
- [x] T4.4 Conditionally render "Start Game" button only if user is the host
- [x] T4.5 Disable "Start Game" button if fewer than 2 players are present
- [x] T4.6 Implement unit/integration tests in `LobbyPage.test.tsx`

---

## Task Dependencies

```
T1.1, T1.2 -> T1.3, T1.4 -> T1.5
T2.1, T2.2 -> T2.3
T3.1, T3.2 -> T3.3
T1.1-T1.4 -> T3.2 -> T4.4 -> T4.6
```

---

## Verification checklist
- [x] Verify backend tests: `cd backend && npm test`
- [x] Verify frontend tests: `cd frontend && npm test`
- [x] Manual: Create room, verify host badge is present
- [x] Manual: Join room, verify list updates on polling within 2s
- [x] Manual: Start Game button is disabled for single host, enabled when guest joins

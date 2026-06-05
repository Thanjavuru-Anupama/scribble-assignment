# Scenario 2 Tasks: Game Start & Drawer Flow

## Implementation Checklist

### Phase 5: Backend Model & Service
- [x] T5.1 Update `RoomStatus` type to `"lobby" | "playing"` in `backend/src/models/game.ts`
- [x] T5.2 Add optional `drawerId` and `secretWord` to `Room` interface
- [x] T5.3 Add optional `drawerId` and `secretWord` to `RoomSnapshot` interface
- [x] T5.4 Write `startGame` in `backend/src/services/roomStore.ts`
- [x] T5.5 Mask `secretWord` in `toRoomSnapshot` for non-drawers

### Phase 6: Start Game Endpoint
- [x] T6.1 Implement `POST /rooms/:code/start` route handler in `backend/src/api/rooms.ts`
- [x] T6.2 Validate that request is made by the host
- [x] T6.3 Verify at least 2 participants exist in the room
- [x] T6.4 Add integration tests in `rooms.test.ts` for start route permissions and output shape

### Phase 7: Frontend Integration
- [x] T7.1 Update `RoomSnapshot` and status typings in `frontend/src/services/api.ts`
- [x] T7.2 Implement `startGame` API client call and RoomStore state action
- [x] T7.3 Bind "Start Game" button to dispatch restart action on Lobby Page
- [x] T7.4 Redirect to `/game` when status becomes `"playing"`
- [x] T7.5 Write 2s interval polling on Game Page to fetch snapshot
- [x] T7.6 Display secret word only to drawer, and show waiting message to guessers

---

## Verification checklist
- [x] Backend tests: all tests pass
- [x] Frontend tests: all tests pass
- [x] Manual: Host clicks start, both screens redirect to `/game` within 2s
- [x] Manual: Host sees correct word (e.g. `rocket`), guest sees "Waiting for Alice to draw..."

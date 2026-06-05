# Scenario 4 Tasks: Result, Restart & Final Validation

## Implementation Checklist

### Phase 11: Backend Models & Services
- [x] T11.1 Support `"result"` status in `RoomStatus` type
- [x] T11.2 Implement `endRound` and `restartGame` in `backend/src/services/roomStore.ts`
- [x] T11.3 Expose secret word in snapshot when status is `"result"`

### Phase 12: End Round & Restart Endpoints
- [x] T12.1 Define validation schemas in `backend/src/api/schemas.ts`
- [x] T12.2 Write `POST /rooms/:code/end` route handler with host authorization
- [x] T12.3 Write `POST /rooms/:code/restart` route handler with host authorization
- [x] T12.4 Add integration tests verifying end round, restart, and forbidden errors

### Phase 13: Frontend Client, Store & UI
- [x] T13.1 Update typings and implement API client calls in `frontend/src/services/api.ts`
- [x] T13.2 Implement store actions `endRound` and `restartGame`
- [x] T13.3 Modify redirect rule in `GamePage.tsx` to prevent redirecting during results display
- [x] T13.4 Add "End Round" button for the host on Game Page
- [x] T13.5 Render results card summary overlay on Game Page
- [x] T13.6 Render "Restart Game" button for the host in the results summary overlay
- [x] T13.7 Disable guess input card on results screen
- [x] T13.8 Write unit tests in `GamePage.test.tsx` for results/restart behaviors

---

## Verification checklist
- [x] Backend tests: all tests pass
- [x] Frontend tests: all tests pass
- [x] Manual: Host ends round -> results shown, secret word revealed
- [x] Manual: Guess input is replaced with "guessing is closed" message
- [x] Manual: Host restarts -> both screens return to lobby, all state cleared

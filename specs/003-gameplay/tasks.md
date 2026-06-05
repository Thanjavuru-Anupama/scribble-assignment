# Scenario 3 Tasks: Gameplay Interaction

## Implementation Checklist

### Phase 8: Backend Models & Services
- [x] T8.1 Add `Guess` interface to `backend/src/models/game.ts`
- [x] T8.2 Add `scores` and `guesses` properties to `Room` and `RoomSnapshot`
- [x] T8.3 Initialize scores and guesses on room creation and start game
- [x] T8.4 Implement `submitGuess` service helper in `backend/src/services/roomStore.ts`
- [x] T8.5 Include scores and guesses in `toRoomSnapshot` serialization

### Phase 9: Guess API Endpoint
- [x] T9.1 Add Zod schema `guessSchema` in `backend/src/api/schemas.ts`
- [x] T9.2 Add `POST /rooms/:code/guess` handler in `backend/src/api/rooms.ts`
- [x] T9.3 Add integration tests validating correct/incorrect guesses, scoring, and history visibility

### Phase 10: Frontend Integration & Components
- [x] T10.1 Add `Guess` type and client API call `submitGuess`
- [x] T10.2 Implement store action `submitGuess(text)`
- [x] T10.3 Refactor `GuessForm.tsx` to handle validations, loading, and drawer message
- [x] T10.4 Create HTML5 lines drawing `Canvas.tsx` component with touch support and clear canvas button
- [x] T10.5 Implement sorted scores rendering in `Scoreboard.tsx`
- [x] T10.6 Implement newest-first activity log rendering in `ResultPanel.tsx`
- [x] T10.7 Integrate new Canvas component in `GamePage.tsx`
- [x] T10.8 Write unit tests in `GamePage.test.tsx` verifying component interactions

---

## Verification checklist
- [x] Backend tests: all tests pass
- [x] Frontend tests: all tests pass
- [x] Manual: Guess is case-insensitive, updates scoreboard on success
- [x] Manual: Drawer is blocked from guessing, can draw on canvas

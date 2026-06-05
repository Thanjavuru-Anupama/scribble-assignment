# Scenario 3 Plan: Gameplay Interaction

## 1. Findings & Data Model

### Data Structures
We must track guesses and scores.
```ts
interface Guess {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  correct: boolean;
  submittedAt: string;
}

interface Room {
  // ... existing fields
  scores: Record<string, number>; // maps participantId -> score
  guesses: Guess[];
}
```

### Endpoints Design
- `POST /rooms/:code/guess`:
  - Request body: `{ participantId, guess }`
  - Validations:
    - Code is active.
    - Requester `participantId` exists in room.
    - Trimmed `guess` is not empty (throws `400 Bad Request` if empty).
  - Actions:
    - Match trimmed, lowercase `guess` against room `secretWord` (lowercase).
    - If correct, increment `scores[participantId]` by 100.
    - Push `Guess` record to `guesses`.
    - Return updated snapshot.

---

## 2. Implementation Steps

1. **Backend Model**: Define `Guess` type and add `scores` and `guesses` to `Room` and `RoomSnapshot`.
2. **Backend Service**:
   - Initialize `scores = {}` and `guesses = []` in `createRoom` and `startGame`.
   - Write `submitGuess` in `roomStore.ts`.
   - Serialize scores and guesses in `toRoomSnapshot`.
3. **Backend API**:
   - Write `guessSchema` in `schemas.ts`.
   - Write `/rooms/:code/guess` endpoint.
4. **Backend Tests**:
   - Verify score increments on correct guesses.
   - Verify scores do not change on incorrect guesses.
   - Verify empty/whitespace guesses return 400.
   - Verify history polling.
5. **Frontend Client & Store**:
   - Add types and API `submitGuess` client call.
   - Add store action `submitGuess`.
6. **Frontend UI Components**:
   - **Canvas**: Implement lines drawing canvas with Mouse and Touch event tracking. Include Clear Canvas button.
   - **GuessForm**: Wire form to store, show inline validation errors, block drawer.
   - **Scoreboard**: Retrieve scores from state, sort by points descending.
   - **ResultPanel**: Map guesses from state, reverse array to show newest first, highlight correct guesses.
7. **Frontend Unit Tests**:
   - Write tests in `GamePage.test.tsx` verifying components.

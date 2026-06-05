# Scenario 3 Specification: Gameplay Interaction

## 1. Context and Problem Statement

Once a round is active, guessers must be able to submit text guesses which are validated, evaluated against the secret word, and scored. Guess history and current scores must be shared with all participants via real-time polling.

This specification details the guess submission workflow (API endpoint), guess input validations (empty and whitespace checks), case-insensitive matching rules, scoring increments, rendering of the scoreboard (sorted highest score first), rendering of guess history (indicating correct vs incorrect), and drawer limitations (drawers cannot guess).

---

## 2. Acceptance Criteria

### AC-18: Initial Scores at Zero
- **Given** a game has just started and room status transitions to `"playing"`,
  **When** the Game Page renders,
  **Then** every participant's score in the scoreboard is displayed as `0`.

### AC-19: Drawer Canvas Control
- **Given** the viewer is the drawer,
  **When** they are on the Game Page,
  **Then** the canvas area is active, allowing freehand line drawing, and a "Clear Canvas" button is visible and clears the canvas client-side.

### AC-20: Empty Guess Rejection
- **Given** a guesser is on the Game Page,
  **When** they attempt to submit a blank or whitespace-only guess,
  **Then** an inline error message is displayed, and no HTTP request is sent to the backend.

### AC-21: Guess Submission
- **Given** a guesser enters a non-empty guess,
  **When** they click "Submit Guess",
  **Then** a `POST /rooms/:code/guess` request is dispatched containing the guess text and participant ID.

### AC-22: Correct Guess — Case-Insensitive Match
- **Given** the secret word for the round is `"rocket"`,
  **When** a guesser submits `"Rocket"`, `"ROCKET"`, or `"  rocket  "` (which contains leading/trailing spaces),
  **Then** the guess is evaluated as correct, and the guesser's score increases by `100` points.

### AC-23: Incorrect Guess — No Score Change
- **Given** a guesser submits a guess that does not match the secret word,
  **When** the guess is evaluated by the backend,
  **Then** the guess is stored as incorrect, and the guesser's score remains unchanged (0 points added).

### AC-24: Guess History Visibility
- **Given** guesses have been submitted,
  **When** other participants poll the room state,
  **Then** the full guess history (player name, guess text, and correct/incorrect flag) is included in the polled response and rendered in the activity feed.

### AC-25: Drawer Cannot Guess
- **Given** the viewer is the drawer,
  **When** they view the Game Page,
  **Then** the guess form is completely hidden or disabled, replaced with a message explaining they are the drawer.

### AC-26: Scores in Scoreboard
- **Given** players have earned points,
  **When** the Scoreboard renders,
  **Then** all participant rows are displayed, sorted highest-first (ties broken alphabetically by name).

---

## 3. Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Leading and trailing spaces in guess | Trimmed prior to evaluation (e.g., `"  pizza  "` evaluates as `"pizza"`). |
| Guess matches secret word case-insensitively | Evaluated as correct (e.g., `"ROCKET"` matches `"rocket"`). |
| Drawer tries to guess via direct API | Backend allows processing (no server-side block needed), but UI hides the option. |

---

## 4. Out-of-Scope

- WebSockets sync of drawing coordinates (real-time stroke sync is out of scope; client-side drawer drawing only).
- Round timers and auto-advancement.
- Multi-round drawer rotation.

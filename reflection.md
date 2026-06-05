# Reflection Report: Scribble multiplayer game implementation

## 1. What the Starter App Already Had

The starter codebase provided a basic skeleton for a web application using Express and React with TypeScript:
- **Backend structure**: Express setup, routing configurations, and an in-memory `Map` in `roomStore.ts` to hold game room state temporarily. Basic schema validation definitions were present but incomplete.
- **Frontend structure**: Simple pages for `StartPage`, `CreateRoomPage`, `JoinRoomPage`, `LobbyPage`, and `GamePage`. It contained mock layouts and visual placeholders for cards, buttons, scoreboard, and activity feeds.
- **Base Routing**: Basic client-side routing using `react-router-dom` to transition from Start -> Create/Join -> Lobby -> Game.

However, the starter app had several bugs and missing features:
- The backend had a base URL bug (the `/bug` suffix) preventing the frontend from communicating.
- There was no host tracking, lobby polling, or access controls.
- Canvas drawing, guessing, scoring, results display, and game restarts were entirely unimplemented.

---

## 2. What We Added

We implemented the complete room lifecycle and gameplay loop through Spec-Driven Development:

### Lobby and Room Lifecycle (Scenario 1)
- Added `hostId` to room structures, declaring the creator as the host.
- Programmed automatic 2s polling in the Lobby screen with in-flight debouncing to keep the participant list updated in real-time.
- Restricted the "Start Game" action to the host and enforced a 2-player minimum.
- Added thorough name trimming and input checks on both client-side and server-side.

### Game Start and Word Reveal (Scenario 2)
- Added room transition endpoints (`POST /rooms/:code/start`).
- Assigned the host as the drawer, deterministically chose the round word, and masked the word from guessers' snapshot views.
- Hooked up automatic lobby-to-game redirection via polling.

### Gameplay Interaction & Canvas (Scenario 3)
- Implemented a fully interactive freehand Canvas drawing component using HTML5 context.
- Implemented `POST /rooms/:code/guess` handling with input trimming, case-insensitivity, scoring increments (+100 on success), and activity logs.
- Renders scoreboard sorted descending by score.

### Results Overlay & Restart (Scenario 4)
- Programmed round-ending endpoints (`POST /rooms/:code/end`) exposing the secret word to all players and locking guessing.
- Programmed host-led restarts (`POST /rooms/:code/restart`) clearing round data while preserving the participants.
- Added comprehensive unit and integration tests across the backend and frontend.

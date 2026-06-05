import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useRoomStore } from "../state/roomStore";

const ROOM_CODE_PATTERN = /^[A-Z0-9]{4}$/;

export function JoinRoomPage() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const roomStore = useRoomStore();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let valid = true;

    if (playerName.trim().length === 0) {
      setNameError("Player name is required.");
      valid = false;
    } else {
      setNameError(null);
    }

    const normalizedCode = roomCode.toUpperCase().trim();
    if (!ROOM_CODE_PATTERN.test(normalizedCode)) {
      setCodeError("Room code must be exactly 4 letters or digits (A–Z, 0–9).");
      valid = false;
    } else {
      setCodeError(null);
    }

    if (!valid) {
      return;
    }

    try {
      setServerError(null);
      await roomStore.joinRoom(normalizedCode, playerName.trim());
      navigate("/lobby");
    } catch (caughtError) {
      setServerError(caughtError instanceof Error ? caughtError.message : "Unable to join room");
    }
  }

  return (
    <section className="panel panel--narrow placeholder-page">
      <PageHeader
        kicker="Existing lobby"
        title="Join Room"
        description="Enter your player name and the room code to join an existing lobby."
      />
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          <span>Player name</span>
          <input
            id="join-room-player-name"
            className="form__input"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Second pencil"
            autoComplete="off"
          />
        </label>
        {nameError ? <p id="join-room-name-error" className="form__error">{nameError}</p> : null}

        <label className="form__field">
          <span>Room code</span>
          <input
            id="join-room-code"
            className="form__input form__input--code"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="ABCD"
            maxLength={4}
            autoComplete="off"
          />
        </label>
        {codeError ? <p id="join-room-code-error" className="form__error">{codeError}</p> : null}
        {serverError ? <p id="join-room-server-error" className="form__error">{serverError}</p> : null}

        <div className="button-row">
          <button id="join-room-submit" className="button button--primary" type="submit">
            Join Lobby
          </button>
          <button className="button button--secondary" type="button" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </form>
    </section>
  );
}

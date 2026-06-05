import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;
const MIN_PLAYERS_TO_START = 2;

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, isLoading } = useRoomState();
  const [pollError, setPollError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Redirect to home if no room session exists
  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    } else if (room.status === "playing") {
      navigate("/game", { replace: true });
    }
  }, [navigate, room]);

  // Start polling on mount; clean up on unmount
  useEffect(() => {
    if (!room) return;

    async function poll() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        await roomStore.fetchRoom();
        setPollError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Poll failed";
        setPollError(message);
      } finally {
        isFetchingRef.current = false;
      }
    }

    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!room) {
    return null;
  }

  const isHost = room.hostId === participantId;
  const canStart = isHost && room.participants.length >= MIN_PLAYERS_TO_START;

  async function handleStartGame() {
    try {
      await roomStore.startGame();
      // Navigation happens automatically via the useEffect above when room status changes
    } catch (error) {
      // In a real app we might show a toast, but for now log to console
      console.error("Failed to start game:", error);
    }
  }

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {participant.id === room.hostId ? " 👑" : ""}
                  </span>
                  <span className="player-list__meta">
                    {participant.id === participantId ? "you" : "joined"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p
            className="status-line"
            style={{
              backgroundColor: isLoading ? "#fef3c7" : "#e0e7ff",
              color: isLoading ? "#b45309" : "#3730a3"
            }}
          >
            {isLoading ? "Refreshing players..." : "Ready to play"}
          </p>
          {pollError ? (
            <p id="lobby-poll-error" style={{ marginTop: "8px", color: "#b91c1c" }}>
              {pollError}
            </p>
          ) : null}
          <p style={{ marginTop: "8px" }}>
            {isHost
              ? room.participants.length < MIN_PLAYERS_TO_START
                ? `Waiting for at least ${MIN_PLAYERS_TO_START} players to join before starting.`
                : "You can start the game now."
              : "Waiting for the host to start the game."}
          </p>
        </Card>
      </div>

      {isHost ? (
        <div className="button-row button-row--spread">
          <button
            id="lobby-start-game"
            className="button button--primary"
            onClick={handleStartGame}
            disabled={!canStart}
            title={
              !canStart
                ? `Need at least ${MIN_PLAYERS_TO_START} players to start`
                : "Start the game"
            }
          >
            Start Game
          </button>
        </div>
      ) : (
        <p id="lobby-waiting-message" style={{ textAlign: "center", color: "#6b7280", marginTop: "16px" }}>
          Waiting for the host to start the game…
        </p>
      )}
    </section>
  );
}

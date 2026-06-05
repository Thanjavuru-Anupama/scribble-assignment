import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Canvas } from "../components/Canvas";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

const POLL_INTERVAL_MS = 2000;

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    } else if (room.status === "lobby") {
      navigate("/lobby", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (!room) return;

    async function poll() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        await roomStore.fetchRoom();
      } catch (error) {
        console.error("Game poll failed", error);
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

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const drawer = room.participants.find((participant) => participant.id === room.drawerId);
  const isDrawer = room.drawerId === participantId;
  const isHost = room.hostId === participantId;
  const isResult = room.status === "result";

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">
            {isResult ? "Round Results" : isDrawer ? `Draw: ${room.secretWord}` : "Guess the Word!"}
          </h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <Card title={isResult ? "Round Over" : isDrawer ? "Your Canvas" : "Canvas"}>
            {isResult ? (
              <div
                id="results-view"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "24px",
                  minHeight: "450px",
                  textAlign: "center",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "2rem"
                }}
              >
                <div style={{ fontSize: "3rem" }}>🏁</div>
                <div>
                  <h2 style={{ fontSize: "1.5rem", margin: "0 0 8px", color: "#111827" }}>Round Ended!</h2>
                  <p style={{ fontSize: "1.125rem", color: "#4b5563", margin: 0 }}>
                    The correct word was: <strong style={{ fontSize: "1.25rem", color: "#2563eb" }}>{room.secretWord}</strong>
                  </p>
                </div>

                {isHost ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                    <button
                      id="results-restart-btn"
                      className="button button--primary"
                      onClick={() => roomStore.restartGame()}
                    >
                      Restart Game
                    </button>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
                      Only you (the host) can restart the game.
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <p id="results-waiting-message" style={{ fontSize: "1rem", color: "#4b5563", fontWeight: 500, margin: 0 }}>
                      Waiting for the host to restart the game...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Canvas
                isDrawer={isDrawer}
                drawerName={drawer?.name}
                secretWord={room.secretWord}
              />
            )}
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{isResult ? "Round Ended" : isDrawer ? "Drawing" : "Guessing"}</dd>
              </div>
            </dl>
          </Card>

          <Card title={isResult ? "Guessing Closed" : "Your Guess"}>
            <GuessForm />
          </Card>
        </aside>
      </div>

      <div className="button-row" style={{ marginTop: "24px", justifyContent: "space-between", width: "100%" }}>
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
        {isHost && !isResult && (
          <button
            id="end-round-btn"
            className="button button--primary"
            style={{ backgroundColor: "#dc2626" }}
            onClick={() => roomStore.endRound()}
          >
            End Round
          </button>
        )}
      </div>
    </section>
  );
}

import { useRoomState } from "../state/roomStore";
import { Card } from "./Card";

export function ResultPanel() {
  const { room } = useRoomState();
  const guesses = room?.guesses ?? [];

  return (
    <Card title="Activity">
      <div
        id="guess-history"
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        {guesses.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
            Game activity and guesses will appear here.
          </p>
        ) : (
          [...guesses].reverse().map((guess) => (
            <div
              key={guess.id}
              className="guess-item"
              style={{
                fontSize: "0.875rem",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: guess.correct ? "#bbf7d0" : "#e5e7eb",
                backgroundColor: guess.correct ? "#f0fdf4" : "#f9fafb",
                color: guess.correct ? "#16a34a" : "#374151",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>
                <strong>{guess.participantName}</strong>: {guess.text}
              </span>
              {guess.correct ? (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: "#dcfce7",
                    padding: "2px 6px",
                    borderRadius: "4px"
                  }}
                >
                  Correct
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

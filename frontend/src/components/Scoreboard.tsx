import { useRoomState } from "../state/roomStore";
import { Card } from "./Card";

export function Scoreboard() {
  const { room } = useRoomState();

  if (!room) {
    return (
      <Card title="Scoreboard">
        <div className="placeholder-block" style={{ backgroundColor: "#f9fafb" }}>
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      </Card>
    );
  }

  const scores = room.scores ?? {};
  const sortedParticipants = [...room.participants].sort((a, b) => {
    const scoreA = scores[a.id] ?? 0;
    const scoreB = scores[b.id] ?? 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <Card title="Scoreboard">
      <div
        id="scoreboard-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        {sortedParticipants.map((p) => {
          const score = scores[p.id] ?? 0;
          const isDrawer = room.drawerId === p.id;
          return (
            <div
              key={p.id}
              className="scoreboard-player-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <strong>{p.name}</strong>
                {isDrawer ? (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      backgroundColor: "#e0e7ff",
                      color: "#1d4ed8",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: 600
                    }}
                  >
                    Drawer
                  </span>
                ) : null}
              </span>
              <strong style={{ fontSize: "1.125rem", color: "#111827" }}>
                {score} pts
              </strong>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

import { useEffect, useRef, useState } from "react";

interface CanvasProps {
  isDrawer: boolean;
  drawerName?: string;
  secretWord?: string;
}

export function Canvas({ isDrawer, drawerName, secretWord }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 450;

    ctx.strokeStyle = "#1e2937";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isDrawer]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    lastPos.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastPos.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!isDrawer) {
    return (
      <div
        id="canvas-guesser-view"
        className="canvas-placeholder"
        style={{
          minHeight: "450px",
          backgroundColor: "#f9fafb",
          border: "2px dashed #d1d5db",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "2rem",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "3rem" }}>🎨</div>
        <p style={{ color: "#4b5563", fontSize: "1.125rem", fontWeight: 500, margin: 0 }}>
          Waiting for <strong>{drawerName ?? "the drawer"}</strong> to draw...
        </p>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
          Keep an eye on the activity feed and make your guesses!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div
        id="canvas-drawer-container"
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: "#ffffff",
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
        }}
      >
        <canvas
          id="drawing-canvas"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            display: "block",
            width: "100%",
            height: "450px",
            cursor: "crosshair",
            touchAction: "none"
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "rgba(17, 24, 39, 0.8)",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 600,
            backdropFilter: "blur(4px)"
          }}
        >
          Secret Word: <strong style={{ color: "#fbbf24" }}>{secretWord}</strong>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          id="clear-canvas-btn"
          className="button button--secondary"
          type="button"
          onClick={handleClear}
          style={{ minHeight: "40px", padding: "0 16px" }}
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}

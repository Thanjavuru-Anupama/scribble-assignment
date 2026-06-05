import { useState } from "react";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GuessForm() {
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();
  const [guessText, setGuessText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDrawer = room?.drawerId === participantId;

  if (isDrawer) {
    return (
      <p id="guess-form-drawer-message" style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
        You are the drawer — focus on drawing, not guessing!
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = guessText.trim();

    if (!trimmed) {
      setError("Guess cannot be empty.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await roomStore.submitGuess(trimmed);
      setGuessText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit guess.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          id="guess-input"
          className="form__input"
          value={guessText}
          onChange={(event) => {
            setGuessText(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Type your guess here..."
          disabled={isSubmitting}
          autoComplete="off"
        />
      </label>
      {error ? (
        <p id="guess-error" style={{ color: "#b91c1c", fontSize: "0.8rem", marginTop: "4px" }}>
          {error}
        </p>
      ) : null}
      <div className="button-row button-row--compact">
        <button
          id="guess-submit"
          className="button button--primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}

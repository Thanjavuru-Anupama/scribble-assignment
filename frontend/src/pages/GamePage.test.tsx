import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomSnapshot } from "../services/api";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockFetchRoom = vi.fn().mockResolvedValue(null);
const mockSubmitGuess = vi.fn().mockResolvedValue(null);
const mockEndRound = vi.fn().mockResolvedValue(null);
const mockRestartGame = vi.fn().mockResolvedValue(null);

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
});

vi.mock("../state/roomStore", () => ({
  useRoomStore: () => ({
    fetchRoom: mockFetchRoom,
    submitGuess: mockSubmitGuess,
    endRound: mockEndRound,
    restartGame: mockRestartGame,
  }),
  useRoomState: () => mockRoomStateValue,
}));

let mockRoomStateValue: {
  room: any;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
} = {
  room: null,
  participantId: null,
  error: null,
  isLoading: false,
};

function makePlayingRoom(extraParticipants: { id: string; name: string }[] = []): RoomSnapshot {
  return {
    code: "ABCD",
    status: "playing",
    hostId: "host-id",
    drawerId: "host-id",
    secretWord: "rocket",
    participants: [
      { id: "host-id", name: "Alice", joinedAt: "" },
      ...extraParticipants.map((p) => ({ ...p, joinedAt: "" })),
    ],
    scores: {
      "host-id": 0,
      ...extraParticipants.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
    } as Record<string, number>,
    guesses: [] as any[],
    availableWords: [],
    roles: [],
  };
}

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.useFakeTimers();
  mockFetchRoom.mockClear();
  mockSubmitGuess.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  document.body.removeChild(container);
  vi.useRealTimers();
});

async function renderGamePage() {
  const { GamePage } = await import("./GamePage");
  await act(async () => {
    root.render(createElement(GamePage));
  });
}

describe("GamePage — as Drawer", () => {
  beforeEach(() => {
    mockRoomStateValue = {
      room: makePlayingRoom([{ id: "guest-id", name: "Bob" }]),
      participantId: "host-id",
      error: null,
      isLoading: false,
    };
  });

  it("renders drawer canvas instructions and secret word", async () => {
    await renderGamePage();

    const h1 = container.querySelector(".game-page__title");
    expect(h1?.textContent).toContain("Draw: rocket");

    const clearBtn = container.querySelector("#clear-canvas-btn");
    expect(clearBtn).not.toBeNull();

    expect(container.textContent).toContain("Drawing");
  });

  it("shows the drawer helper message in place of guess form", async () => {
    await renderGamePage();
    const drawerMsg = container.querySelector("#guess-form-drawer-message");
    expect(drawerMsg).not.toBeNull();
    expect(drawerMsg?.textContent).toContain("You are the drawer");
  });
});

describe("GamePage — as Guesser", () => {
  beforeEach(() => {
    mockRoomStateValue = {
      room: makePlayingRoom([{ id: "guest-id", name: "Bob" }]),
      participantId: "guest-id",
      error: null,
      isLoading: false,
    };
  });

  it("renders guesser canvas instructions", async () => {
    await renderGamePage();

    const h1 = container.querySelector(".game-page__title");
    expect(h1?.textContent).toContain("Guess the Word!");

    const waitingMsg = container.querySelector("#canvas-guesser-view");
    expect(waitingMsg).not.toBeNull();
    expect(waitingMsg?.textContent).toContain("Waiting for Alice to draw...");

    expect(container.textContent).toContain("Guessing");
  });

  it("renders the guess form and handles empty submissions", async () => {
    await renderGamePage();

    const input = container.querySelector<HTMLInputElement>("#guess-input");
    const submitBtn = container.querySelector<HTMLButtonElement>("#guess-submit");
    const form = container.querySelector<HTMLFormElement>("form");

    expect(input).not.toBeNull();
    expect(submitBtn).not.toBeNull();

    await act(async () => {
      form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });

    const errorMsg = container.querySelector("#guess-error");
    expect(errorMsg?.textContent).toContain("Guess cannot be empty.");
    expect(mockSubmitGuess).not.toHaveBeenCalled();
  });
});

describe("GamePage — Scoreboard and Guesses", () => {
  beforeEach(() => {
    const room = makePlayingRoom([{ id: "guest-id", name: "Bob" }]);
    room.scores["host-id"] = 100;
    room.scores["guest-id"] = 200;
    room.guesses = [
      {
        id: "g1",
        participantId: "guest-id",
        participantName: "Bob",
        text: "banana",
        correct: false,
        submittedAt: "",
      },
      {
        id: "g2",
        participantId: "host-id",
        participantName: "Alice",
        text: "rocket",
        correct: true,
        submittedAt: "",
      },
    ];

    mockRoomStateValue = {
      room,
      participantId: "host-id",
      error: null,
      isLoading: false,
    };
  });

  it("renders scoreboard sorted descending by score", async () => {
    await renderGamePage();

    const rows = container.querySelectorAll(".scoreboard-player-row");
    expect(rows).toHaveLength(2);

    expect(rows[0].textContent).toContain("Bob");
    expect(rows[0].textContent).toContain("200 pts");

    expect(rows[1].textContent).toContain("Alice");
    expect(rows[1].textContent).toContain("100 pts");
  });

  it("renders guesses inside guess history", async () => {
    await renderGamePage();

    const historyItems = container.querySelectorAll(".guess-item");
    expect(historyItems).toHaveLength(2);

    expect(historyItems[0].textContent).toContain("Alice: rocket");
    expect(historyItems[0].textContent).toContain("Correct");

    expect(historyItems[1].textContent).toContain("Bob: banana");
    expect(historyItems[1].textContent).not.toContain("Correct");
  });
});

describe("GamePage — Scenario 4 (Result & Restart)", () => {
  it("renders end round button during active play if the viewer is the host", async () => {
    mockRoomStateValue = {
      room: {
        code: "ABCD",
        status: "playing",
        hostId: "host-id",
        drawerId: "host-id",
        secretWord: "rocket",
        participants: [
          { id: "host-id", name: "Alice", joinedAt: "" },
          { id: "guest-id", name: "Bob", joinedAt: "" },
        ],
        scores: { "host-id": 0, "guest-id": 0 },
        guesses: [],
        availableWords: [],
        roles: [],
      },
      participantId: "host-id",
      error: null,
      isLoading: false,
    };

    await renderGamePage();

    const endBtn = container.querySelector("#end-round-btn");
    expect(endBtn).not.toBeNull();

    await act(async () => {
      endBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });

    expect(mockEndRound).toHaveBeenCalled();
  });

  it("does not render end round button if the viewer is not the host", async () => {
    mockRoomStateValue = {
      room: {
        code: "ABCD",
        status: "playing",
        hostId: "host-id",
        drawerId: "host-id",
        secretWord: "rocket",
        participants: [
          { id: "host-id", name: "Alice", joinedAt: "" },
          { id: "guest-id", name: "Bob", joinedAt: "" },
        ],
        scores: { "host-id": 0, "guest-id": 0 },
        guesses: [],
        availableWords: [],
        roles: [],
      },
      participantId: "guest-id",
      error: null,
      isLoading: false,
    };

    await renderGamePage();

    const endBtn = container.querySelector("#end-round-btn");
    expect(endBtn).toBeNull();
  });

  it("renders results view when status is result and shows restart button to host", async () => {
    mockRoomStateValue = {
      room: {
        code: "ABCD",
        status: "result",
        hostId: "host-id",
        drawerId: "host-id",
        secretWord: "rocket",
        participants: [
          { id: "host-id", name: "Alice", joinedAt: "" },
          { id: "guest-id", name: "Bob", joinedAt: "" },
        ],
        scores: { "host-id": 0, "guest-id": 0 },
        guesses: [],
        availableWords: [],
        roles: [],
      },
      participantId: "host-id",
      error: null,
      isLoading: false,
    };

    await renderGamePage();

    const resultsView = container.querySelector("#results-view");
    expect(resultsView).not.toBeNull();
    expect(resultsView?.textContent).toContain("The correct word was: rocket");

    const guessFormMsg = container.querySelector("#guess-form-result-message");
    expect(guessFormMsg).not.toBeNull();
    expect(guessFormMsg?.textContent).toContain("Guessing is closed");

    const restartBtn = container.querySelector("#results-restart-btn");
    expect(restartBtn).not.toBeNull();

    await act(async () => {
      restartBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });

    expect(mockRestartGame).toHaveBeenCalled();
  });

  it("renders results view without restart button and shows waiting message to non-host", async () => {
    mockRoomStateValue = {
      room: {
        code: "ABCD",
        status: "result",
        hostId: "host-id",
        drawerId: "host-id",
        secretWord: "rocket",
        participants: [
          { id: "host-id", name: "Alice", joinedAt: "" },
          { id: "guest-id", name: "Bob", joinedAt: "" },
        ],
        scores: { "host-id": 0, "guest-id": 0 },
        guesses: [],
        availableWords: [],
        roles: [],
      },
      participantId: "guest-id",
      error: null,
      isLoading: false,
    };

    await renderGamePage();

    const waitingMsg = container.querySelector("#results-waiting-message");
    expect(waitingMsg).not.toBeNull();
    expect(waitingMsg?.textContent).toContain("Waiting for the host to restart");

    const restartBtn = container.querySelector("#results-restart-btn");
    expect(restartBtn).toBeNull();
  });
});


/**
 * LobbyPage unit tests
 *
 * Uses raw React DOM rendering (react-dom/client) since @testing-library/react
 * is not installed. DOM is available via vitest's jsdom environment (vitest.config.ts).
 */
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockFetchRoom = vi.fn().mockResolvedValue(null);

vi.mock("../state/roomStore", () => ({
  useRoomStore: () => ({ fetchRoom: mockFetchRoom }),
  useRoomState: () => mockRoomStateValue,
}));

// Mutable state that tests can overwrite before each render
let mockRoomStateValue: {
  room: unknown;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
} = {
  room: null,
  participantId: null,
  error: null,
  isLoading: false,
};

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRoom(extraParticipants: { id: string; name: string }[] = []) {
  return {
    code: "ABCD",
    status: "lobby" as const,
    hostId: "host-id",
    participants: [
      { id: "host-id", name: "Alice", joinedAt: "" },
      ...extraParticipants.map((p) => ({ ...p, joinedAt: "" })),
    ],
    availableWords: [],
    roles: [],
  };
}

// ── Test setup ─────────────────────────────────────────────────────────────

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.useFakeTimers();
  mockFetchRoom.mockClear();
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

async function renderLobby() {
  const { LobbyPage } = await import("./LobbyPage");
  await act(async () => {
    root.render(createElement(LobbyPage));
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("LobbyPage — host with 1 player (self only)", () => {
  beforeEach(() => {
    mockRoomStateValue = {
      room: makeRoom(),
      participantId: "host-id",
      error: null,
      isLoading: false,
    };
  });

  it("shows Start Game button that is disabled", async () => {
    await renderLobby();
    const btn = container.querySelector<HTMLButtonElement>("#lobby-start-game");
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(true);
  });

  it("shows a hint about minimum players", async () => {
    await renderLobby();
    expect(container.textContent).toContain("at least 2 players");
  });
});

describe("LobbyPage — host with 2+ players", () => {
  beforeEach(() => {
    mockRoomStateValue = {
      room: makeRoom([{ id: "guest-id", name: "Bob" }]),
      participantId: "host-id",
      error: null,
      isLoading: false,
    };
  });

  it("shows Start Game button that is enabled", async () => {
    await renderLobby();
    const btn = container.querySelector<HTMLButtonElement>("#lobby-start-game");
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(false);
  });
});

describe("LobbyPage — non-host player", () => {
  beforeEach(() => {
    mockRoomStateValue = {
      room: makeRoom([{ id: "guest-id", name: "Bob" }]),
      participantId: "guest-id",
      error: null,
      isLoading: false,
    };
  });

  it("does not show Start Game button", async () => {
    await renderLobby();
    const btn = container.querySelector("#lobby-start-game");
    expect(btn).toBeNull();
  });

  it("shows a waiting-for-host message", async () => {
    await renderLobby();
    const msg = container.querySelector("#lobby-waiting-message");
    expect(msg).not.toBeNull();
    expect(msg!.textContent).toMatch(/waiting for the host/i);
  });
});

describe("LobbyPage — polling", () => {
  beforeEach(() => {
    mockRoomStateValue = {
      room: makeRoom([{ id: "guest-id", name: "Bob" }]),
      participantId: "host-id",
      error: null,
      isLoading: false,
    };
  });

  it("calls fetchRoom after each 2 s interval", async () => {
    await renderLobby();

    // Tick past the first 2 s interval
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    // Drain any pending async microtasks from the first poll
    await act(async () => {});

    // Tick past the second 2 s interval
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    await act(async () => {});

    // At least two polls should have fired
    expect(mockFetchRoom.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("stops polling when the component unmounts", async () => {
    await renderLobby();

    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    const callsBeforeUnmount = mockFetchRoom.mock.calls.length;

    act(() => {
      root.unmount();
    });
    // Re-create root so afterEach doesn't double-unmount
    root = createRoot(container);

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    // No additional calls after unmount
    expect(mockFetchRoom.mock.calls.length).toBe(callsBeforeUnmount);
  });
});

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CellState, DAYS, HABIT_ROWS, SCORE_ROWS } from "@/components/core/tracker/constants";

export type TrackerSnapshot = {
  name: string;
  month: string;
  habits: string[];
  trackerMarks: CellState[][];
  scoreMarks: CellState[][];
};

type TrackerState = {
  snapshot: TrackerSnapshot;
  clientId: string;
  hasLoadedRemote: boolean;
  isLoading: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const CLIENT_ID_KEY = "habit-tracker-client-id";

function createMatrix(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0 as CellState));
}

function createEmptySnapshot(): TrackerSnapshot {
  return {
    name: "",
    month: "",
    habits: Array.from({ length: HABIT_ROWS }, () => ""),
    trackerMarks: createMatrix(HABIT_ROWS, DAYS),
    scoreMarks: createMatrix(SCORE_ROWS, DAYS),
  };
}

function normalizeCellState(value: unknown): CellState {
  if (value === 1 || value === 2 || value === 3) return value;
  return 0;
}

function normalizeMatrix(raw: unknown, rows: number, cols: number): CellState[][] {
  const source = Array.isArray(raw) ? raw : [];

  return Array.from({ length: rows }, (_, rowIndex) => {
    const row = Array.isArray(source[rowIndex]) ? source[rowIndex] : [];
    return Array.from({ length: cols }, (_, colIndex) => normalizeCellState(row[colIndex]));
  });
}

function normalizeSnapshot(raw: Partial<TrackerSnapshot> | null | undefined): TrackerSnapshot {
  const parsed = raw || {};

  return {
    name: typeof parsed.name === "string" ? parsed.name : "",
    month: typeof parsed.month === "string" ? parsed.month : "",
    habits: Array.from({ length: HABIT_ROWS }, (_, index) => {
      const value = parsed.habits?.[index];
      return typeof value === "string" ? value : "";
    }),
    trackerMarks: normalizeMatrix(parsed.trackerMarks, HABIT_ROWS, DAYS),
    scoreMarks: normalizeMatrix(parsed.scoreMarks, SCORE_ROWS, DAYS),
  };
}

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(CLIENT_ID_KEY, generated);
  return generated;
}

export const initializeTracker = createAsyncThunk(
  "tracker/initialize",
  async () => {
    const clientId = getOrCreateClientId();
    if (!clientId) {
      return { clientId: "", snapshot: null as TrackerSnapshot | null };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/progress/${clientId}`);
      if (!response.ok) {
        throw new Error(`Failed to load progress: ${response.status}`);
      }

      const payload = (await response.json()) as { snapshot: Partial<TrackerSnapshot> | null };
      return {
        clientId,
        snapshot: payload.snapshot ? normalizeSnapshot(payload.snapshot) : null,
      };
    } catch (error) {
      console.error("Failed to fetch saved tracker progress", error);
      return { clientId, snapshot: null as TrackerSnapshot | null };
    }
  }
);

export const saveTrackerSnapshot = createAsyncThunk(
  "tracker/save",
  async (_, thunkApi) => {
    const state = thunkApi.getState() as { tracker: TrackerState };
    const { snapshot, clientId, hasLoadedRemote } = state.tracker;

    if (!clientId || !hasLoadedRemote) return;

    const response = await fetch(`${API_BASE_URL}/api/progress/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save progress: ${response.status}`);
    }
  }
);

const initialState: TrackerState = {
  snapshot: createEmptySnapshot(),
  clientId: "",
  hasLoadedRemote: false,
  isLoading: false,
};

const trackerSlice = createSlice({
  name: "tracker",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.snapshot.name = action.payload;
    },
    setMonth(state, action: PayloadAction<string>) {
      state.snapshot.month = action.payload;
    },
    clearAll(state) {
      state.snapshot = createEmptySnapshot();
    },
    setHabit(state, action: PayloadAction<{ index: number; value: string }>) {
      const { index, value } = action.payload;
      state.snapshot.habits[index] = value;
    },
    toggleTrackerCell(state, action: PayloadAction<{ rowIndex: number; dayIndex: number }>) {
      const { rowIndex, dayIndex } = action.payload;
      const current = state.snapshot.trackerMarks[rowIndex][dayIndex];
      state.snapshot.trackerMarks[rowIndex][dayIndex] = ((current + 1) % 4) as CellState;
    },
    toggleScoreCell(state, action: PayloadAction<{ rowIndex: number; dayIndex: number }>) {
      const { rowIndex, dayIndex } = action.payload;
      const current = state.snapshot.scoreMarks[rowIndex][dayIndex];
      const nextValue = ((current + 1) % 4) as CellState;

      if (nextValue === 3) {
        for (let row = 0; row < SCORE_ROWS; row += 1) {
          if (row !== rowIndex && state.snapshot.scoreMarks[row][dayIndex] === 3) {
            state.snapshot.scoreMarks[row][dayIndex] = 0;
          }
        }
      }

      state.snapshot.scoreMarks[rowIndex][dayIndex] = nextValue;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeTracker.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeTracker.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientId = action.payload.clientId;
        if (action.payload.snapshot) {
          state.snapshot = action.payload.snapshot;
        }
        state.hasLoadedRemote = true;
      })
      .addCase(initializeTracker.rejected, (state) => {
        state.isLoading = false;
        state.hasLoadedRemote = true;
      });
  },
});

export const { setName, setMonth, clearAll, setHabit, toggleTrackerCell, toggleScoreCell } = trackerSlice.actions;

export default trackerSlice.reducer;

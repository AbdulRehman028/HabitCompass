import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CellState, DAYS, HABIT_CATEGORIES, HABIT_ROWS, SCORE_ROWS } from "@/components/core/tracker/constants";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { enqueueToast } from "@/store/uiSlice";

export type TrackerSnapshot = {
  name: string;
  month: string;
  habits: string[];
  habitTargets: number[];
  habitCategories: string[];
  habitTags: string[][];
  trackerMarks: CellState[][];
  scoreMarks: CellState[][];
  // Optional custom range stored as ISO date strings when user selects custom ranges
  rangeStartISO?: string;
  rangeEndISO?: string;
  // User notes for the tracker session
  notes?: string;
};

type TrackerState = {
  snapshot: TrackerSnapshot;
  clientId: string;
  hasLoadedRemote: boolean;
  // when true, skip the next automatic save (protects against overwriting remote data
  // immediately after initialize when no snapshot was returned)
  skipAutosaveAfterInit: boolean;
  isLoading: boolean;
};

type TrackerCacheEntry = {
  snapshot: TrackerSnapshot;
  updatedAt: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const TRACKER_CACHE_PREFIX = "habitcompass:tracker-cache:";

function getTrackerCacheKey(userId: string) {
  return `${TRACKER_CACHE_PREFIX}${userId}`;
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readTrackerCache(userId: string): TrackerCacheEntry | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(getTrackerCacheKey(userId));
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<TrackerCacheEntry>;
    if (!parsed.snapshot) return null;

    return {
      snapshot: normalizeSnapshot(parsed.snapshot),
      updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt.trim() ? parsed.updatedAt : null,
    };
  } catch {
    return null;
  }
}

function writeTrackerCache(userId: string, snapshot: TrackerSnapshot, updatedAt: string | null) {
  if (!canUseBrowserStorage()) return;

  try {
    window.localStorage.setItem(
      getTrackerCacheKey(userId),
      JSON.stringify({ snapshot, updatedAt })
    );
  } catch {
    // Ignore storage errors so tracker sync still works.
  }
}

function isRemoteSnapshotNewer(remoteUpdatedAt: string | null | undefined, cachedUpdatedAt: string | null | undefined) {
  if (!cachedUpdatedAt) return true;
  if (!remoteUpdatedAt) return false;

  const remoteTime = Date.parse(remoteUpdatedAt);
  const cachedTime = Date.parse(cachedUpdatedAt);

  if (Number.isNaN(remoteTime)) return false;
  if (Number.isNaN(cachedTime)) return true;

  return remoteTime >= cachedTime;
}

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const { data, error } = await supabaseBrowser.auth.refreshSession();
  if (error) {
    return null;
  }

  return data.session?.access_token ?? null;
}

async function fetchWithAuthRetry(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return new Response(null, { status: 401 });
  }

  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(input, { ...init, headers });
  if (response.status !== 401) {
    return response;
  }

  const { data, error } = await supabaseBrowser.auth.refreshSession();
  const refreshedToken = error ? null : data.session?.access_token;
  if (!refreshedToken) {
    return response;
  }

  response = await fetch(input, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${refreshedToken}`,
    },
  });

  return response;
}

function createMatrix(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0 as CellState));
}

function createEmptySnapshot(): TrackerSnapshot {
  return {
    name: "",
    month: "",
    habits: Array.from({ length: HABIT_ROWS }, () => ""),
    habitTargets: Array.from({ length: HABIT_ROWS }, () => 5),
    habitCategories: Array.from({ length: HABIT_ROWS }, () => "General"),
    habitTags: Array.from({ length: HABIT_ROWS }, () => [] as string[]),
    trackerMarks: createMatrix(HABIT_ROWS, DAYS),
    scoreMarks: createMatrix(SCORE_ROWS, DAYS),
    rangeStartISO: "",
    rangeEndISO: "",
    notes: "",
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
    habitTargets: Array.from({ length: HABIT_ROWS }, (_, index) => {
      const rawValue = parsed.habitTargets?.[index];
      if (typeof rawValue !== "number" || Number.isNaN(rawValue)) return 5;
      return Math.min(7, Math.max(1, Math.round(rawValue)));
    }),
    habitCategories: Array.from({ length: HABIT_ROWS }, (_, index) => {
      const value = parsed.habitCategories?.[index];
      if (typeof value !== "string") return "General";
      return HABIT_CATEGORIES.includes(value as (typeof HABIT_CATEGORIES)[number]) ? value : "General";
    }),
    habitTags: Array.from({ length: HABIT_ROWS }, (_, index) => {
      const rawTags = parsed.habitTags?.[index];
      if (!Array.isArray(rawTags)) return [];

      const normalized = rawTags
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item, itemIndex, list) => item.length > 0 && list.indexOf(item) === itemIndex);

      return normalized;
    }),
    trackerMarks: normalizeMatrix(parsed.trackerMarks, HABIT_ROWS, DAYS),
    scoreMarks: normalizeMatrix(parsed.scoreMarks, SCORE_ROWS, DAYS),
    rangeStartISO: typeof parsed.rangeStartISO === "string" ? parsed.rangeStartISO : "",
    rangeEndISO: typeof parsed.rangeEndISO === "string" ? parsed.rangeEndISO : "",
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
  };
}

export const initializeTracker = createAsyncThunk(
  "tracker/initialize",
  async (_, thunkApi) => {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    const userId = session?.user?.id || "";
    if (!userId) {
      thunkApi.dispatch(
        enqueueToast({
          tone: "info",
          message: "Please log in to load your progress.",
        })
      );
      return { clientId: "", snapshot: null as TrackerSnapshot | null, hasLocalCache: false, shouldSkipAutosaveAfterInit: true };
    }

    const cachedEntry = readTrackerCache(userId);
    if (cachedEntry) {
      thunkApi.dispatch(
        hydrateTrackerCache({
          clientId: userId,
          snapshot: cachedEntry.snapshot,
        })
      );
    }

    try {
      const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/progress/me`);
      if (!response.ok) {
        if (response.status === 401) {
          thunkApi.dispatch(
            enqueueToast({
              tone: "error",
              message: "Your session expired. Please log in again.",
            })
          );
        } else {
          thunkApi.dispatch(
            enqueueToast({
              tone: "error",
              message: "We could not load your saved progress.",
            })
          );
        }
        throw new Error(`Failed to load progress: ${response.status}`);
      }

      const payload = (await response.json()) as { snapshot: Partial<TrackerSnapshot> | null; updatedAt?: string | null };
      const remoteSnapshot = payload.snapshot ? normalizeSnapshot(payload.snapshot) : null;
      const shouldUseRemote = Boolean(remoteSnapshot) && isRemoteSnapshotNewer(payload.updatedAt ?? null, cachedEntry?.updatedAt ?? null);

      if (remoteSnapshot && shouldUseRemote) {
        writeTrackerCache(userId, remoteSnapshot, payload.updatedAt ?? new Date().toISOString());
        return {
          clientId: userId,
          snapshot: remoteSnapshot,
          hasLocalCache: Boolean(cachedEntry),
          shouldSkipAutosaveAfterInit: false,
        };
      }

      return {
        clientId: userId,
        snapshot: null as TrackerSnapshot | null,
        hasLocalCache: Boolean(cachedEntry),
        shouldSkipAutosaveAfterInit: !cachedEntry && !remoteSnapshot,
      };
    } catch (error) {
      console.error("Failed to fetch saved tracker progress", error);
      thunkApi.dispatch(
        enqueueToast({
          tone: "error",
          message: "Could not load progress. Check connection and try again.",
        })
      );
      return {
        clientId: userId,
        snapshot: null as TrackerSnapshot | null,
        hasLocalCache: Boolean(cachedEntry),
        shouldSkipAutosaveAfterInit: !cachedEntry,
      };
    }
  }
);

export const saveTrackerSnapshot = createAsyncThunk(
  "tracker/save",
  async (_, thunkApi) => {
    const state = thunkApi.getState() as { tracker: TrackerState };
    const { snapshot, hasLoadedRemote } = state.tracker;

    if (!hasLoadedRemote) return;

    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/progress/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ snapshot }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        thunkApi.dispatch(
          enqueueToast({
            tone: "error",
            message: "Your session expired. Please log in again.",
          })
        );
      } else {
        thunkApi.dispatch(
          enqueueToast({
            tone: "error",
            message: "Auto-save failed. Your latest changes are not in cloud yet.",
          })
        );
      }
      throw new Error(`Failed to save progress: ${response.status}`);
    }

    const payload = (await response.json().catch(() => null)) as { updatedAt?: string | null } | null;
    if (state.tracker.clientId) {
      writeTrackerCache(state.tracker.clientId, snapshot, payload?.updatedAt ?? new Date().toISOString());
    }
  }
);

const initialState: TrackerState = {
  snapshot: createEmptySnapshot(),
  clientId: "",
  hasLoadedRemote: false,
  skipAutosaveAfterInit: false,
  isLoading: false,
};

const trackerSlice = createSlice({
  name: "tracker",
  initialState,
  reducers: {
    hydrateTrackerCache(state, action: PayloadAction<{ clientId: string; snapshot: TrackerSnapshot }>) {
      state.clientId = action.payload.clientId;
      state.snapshot = action.payload.snapshot;
      state.skipAutosaveAfterInit = false;
    },
    setName(state, action: PayloadAction<string>) {
      state.snapshot.name = action.payload;
    },
    setMonth(state, action: PayloadAction<string>) {
      state.snapshot.month = action.payload;
    },
    setCustomRange(state, action: PayloadAction<{ startISO: string; endISO: string }>) {
      state.snapshot.rangeStartISO = action.payload.startISO;
      state.snapshot.rangeEndISO = action.payload.endISO;
    },
    setNotes(state, action: PayloadAction<string>) {
      state.snapshot.notes = action.payload;
    },
    clearAll(state) {
      state.snapshot = createEmptySnapshot();
    },
    setHabit(state, action: PayloadAction<{ index: number; value: string }>) {
      const { index, value } = action.payload;
      state.snapshot.habits[index] = value;
    },
    setHabitTarget(state, action: PayloadAction<{ index: number; value: number }>) {
      const { index, value } = action.payload;
      state.snapshot.habitTargets[index] = Math.min(7, Math.max(1, Math.round(value)));
    },
    setHabitCategory(state, action: PayloadAction<{ index: number; value: string }>) {
      const { index, value } = action.payload;
      state.snapshot.habitCategories[index] = HABIT_CATEGORIES.includes(value as (typeof HABIT_CATEGORIES)[number])
        ? value
        : "General";
    },
    setHabitTags(state, action: PayloadAction<{ index: number; value: string }>) {
      const { index, value } = action.payload;
      const tags = value
        .split(",")
        .map((item) => item.trim())
        .filter((item, itemIndex, list) => item.length > 0 && list.indexOf(item) === itemIndex);

      state.snapshot.habitTags[index] = tags;
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
    // acknowledge and clear the single autosave skip flag
    acknowledgeAutosaveSkip(state) {
      state.skipAutosaveAfterInit = false;
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
        state.skipAutosaveAfterInit = action.payload.shouldSkipAutosaveAfterInit;
        state.hasLoadedRemote = true;
      })
      .addCase(initializeTracker.rejected, (state) => {
        state.isLoading = false;
        state.hasLoadedRemote = true;
      });
  },
});

export const {
  hydrateTrackerCache,
  setName,
  setMonth,
  setCustomRange,
  setNotes,
  clearAll,
  setHabit,
  setHabitTarget,
  setHabitCategory,
  setHabitTags,
  toggleTrackerCell,
  toggleScoreCell,
  acknowledgeAutosaveSkip,
} = trackerSlice.actions;

export default trackerSlice.reducer;

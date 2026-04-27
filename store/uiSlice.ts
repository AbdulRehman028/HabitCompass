import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastTone = "error" | "success" | "info";

export type Toast = {
  id: string;
  tone: ToastTone;
  message: string;
};

type UiState = {
  toasts: Toast[];
};

type EnqueueToastPayload = {
  tone?: ToastTone;
  message: string;
};

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    enqueueToast(state, action: PayloadAction<EnqueueToastPayload>) {
      const tone = action.payload.tone || "info";
      const message = action.payload.message.trim();
      if (!message) return;

      // Prevent noisy repeats of the same toast while an existing one is visible.
      if (state.toasts.some((toast) => toast.message === message && toast.tone === tone)) {
        return;
      }

      state.toasts.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        tone,
        message,
      });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { enqueueToast, dismissToast, clearToasts } = uiSlice.actions;

export default uiSlice.reducer;

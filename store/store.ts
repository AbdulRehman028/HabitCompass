import { configureStore } from "@reduxjs/toolkit";
import trackerReducer from "./trackerSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    tracker: trackerReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

"use client";

import { useEffect } from "react";
import { dismissToast } from "@/store/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const toneClasses: Record<string, string> = {
  error: "border-rose-300 bg-rose-50 text-rose-800",
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  info: "border-slate-300 bg-white text-slate-800",
};

export default function ToastViewport() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dispatch(dismissToast(toast.id));
      }, 3800)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dispatch, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,420px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-[0_12px_35px_rgba(15,23,42,0.18)] ${toneClasses[toast.tone] || toneClasses.info}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              onClick={() => dispatch(dismissToast(toast.id))}
              className="rounded-md px-1 text-xs font-bold opacity-70 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

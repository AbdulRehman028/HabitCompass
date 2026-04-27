"use client";

import { useEffect } from "react";
import { dismissToast } from "@/store/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const toneClasses: Record<string, string> = {
  error: "border-rose-300/80 bg-gradient-to-br from-rose-50 to-white text-rose-900",
  success: "border-emerald-300/80 bg-gradient-to-br from-emerald-50 to-white text-emerald-900",
  info: "border-sky-300/80 bg-gradient-to-br from-sky-50 to-white text-sky-900",
};

const toneBadge: Record<string, string> = {
  error: "!",
  success: "OK",
  info: "i",
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
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[120] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[min(92vw,420px)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-3 py-3 text-sm font-semibold shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm animate-[toast-in_260ms_ease-out] ${toneClasses[toast.tone] || toneClasses.info}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/30 bg-white/70 text-[10px] font-black uppercase tracking-wide">
                {toneBadge[toast.tone] || toneBadge.info}
              </span>
              <p className="leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(dismissToast(toast.id))}
              className="rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide opacity-70 transition hover:bg-white/60 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes toast-in {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

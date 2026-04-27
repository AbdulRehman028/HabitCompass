"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrackerApp from "@/app/weekly-tracker-app";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAppDispatch } from "@/store/hooks";
import { enqueueToast } from "@/store/uiSlice";

export default function HabitTrackerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseBrowser.auth.getSession();

      if (error) {
        dispatch(
          enqueueToast({
            tone: "error",
            message: "Could not verify your session. Please log in again.",
          })
        );
      }

      if (!active) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setIsCheckingSession(false);
    };

    void verifySession();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dispatch, router]);

  if (!isSupabaseConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-6">
        <p className="max-w-xl text-center font-semibold text-slate-900">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart the app.
        </p>
      </main>
    );
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-6">
        <p className="font-brand-display text-3xl text-slate-900">Loading habit tracker...</p>
      </main>
    );
  }

  return <TrackerApp />;
}

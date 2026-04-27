"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { enqueueToast } from "@/store/uiSlice";
import { toggleTrackerCell } from "@/store/trackerSlice";
import { computeHabitStreakSummary } from "@/components/core/tracker/streakEngine";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const snapshot = useAppSelector((state) => state.tracker.snapshot);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const todayDateStr = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Get today's column index in tracker (0-6 = Mon-Sun)
  const todayColIndex = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert JS day (0=Sun) to our tracker format (0=Mon)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }, []);

  // Calculate completion stats for today
  const todayStats = useMemo(() => {
    if (!snapshot?.habits || !snapshot.trackerMarks) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    snapshot.habits.forEach((habitName, habitIdx) => {
      if (!habitName || habitName.trim() === "") return;
      const target = snapshot.habitTargets?.[habitIdx] || 1;
      const dayOfWeek = new Date().getDay();
      const daysInWeek = [0, 1, 2, 3, 4, 5, 6];
      const isTrackingToday = target > 0 && daysInWeek.slice(0, target).includes(dayOfWeek === 0 ? 6 : dayOfWeek - 1);

      if (isTrackingToday) {
        total += 1;
        const mark = snapshot.trackerMarks[habitIdx]?.[todayColIndex];
        if (mark === 1 || mark === 2 || mark === 3) {
          completed += 1;
        }
      }
    });

    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [snapshot, todayColIndex]);

  // Get today's habits list
  const todayHabits = useMemo(() => {
    if (!snapshot?.habits) return [];

    return snapshot.habits
      .map((habitName, habitIdx) => {
        if (!habitName || habitName.trim() === "") return null;

        const target = snapshot.habitTargets?.[habitIdx] || 1;
        const dayOfWeek = new Date().getDay();
        const daysInWeek = [0, 1, 2, 3, 4, 5, 6];
        const isTrackingToday = target > 0 && daysInWeek.slice(0, target).includes(dayOfWeek === 0 ? 6 : dayOfWeek - 1);

        if (!isTrackingToday) return null;

        const mark = snapshot.trackerMarks?.[habitIdx]?.[todayColIndex];
        const streak = computeHabitStreakSummary(snapshot.trackerMarks[habitIdx] || []);
        const category = snapshot.habitCategories?.[habitIdx] || "General";

        return {
          index: habitIdx,
          name: habitName,
          mark: mark || 0,
          category,
          streak: streak.currentStreak,
          isCompleted: mark === 1 || mark === 2 || mark === 3,
        };
      })
      .filter((h) => h !== null) as Array<{
      index: number;
      name: string;
      mark: number;
      category: string;
      streak: number;
      isCompleted: boolean;
    }>;
  }, [snapshot, todayColIndex]);

  const handleToggleHabit = (habitIdx: number) => {
    dispatch(toggleTrackerCell({ rowIndex: habitIdx, dayIndex: todayColIndex }));
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const { error } = await supabaseBrowser.auth.signOut({ scope: "local" });
    if (error) {
      dispatch(enqueueToast({ tone: "error", message: "Could not sign out. Please try again." }));
      setIsSigningOut(false);
      return;
    }

    dispatch(enqueueToast({ tone: "info", message: "Signed out successfully." }));
    router.replace("/");
    router.refresh();
  };

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

      setUserEmail(session.user.email || null);
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
      <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-6 text-slate-950">
        <p className="max-w-xl text-center font-semibold">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart the app.
        </p>
      </main>
    );
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-6 text-slate-950">
        <p className="font-brand-display text-3xl">Loading today...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-3xl space-y-6">
        {/* Header with date and greeting */}
        <header className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Today</p>
          <p className="mt-2 text-sm text-slate-600">{todayDateStr}</p>
          <h1 className="mt-3 font-brand-display text-4xl leading-none tracking-tight text-slate-900">
            {userEmail ? `What's up, ${userEmail.split("@")[0]}?` : "Let's check in."}
          </h1>
        </header>

        {/* Daily completion progress */}
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Today&apos;s Progress</p>
              <p className="mt-2 font-brand-display text-3xl text-slate-900">
                {todayStats.completed}/{todayStats.total}
              </p>
            </div>

            {/* Progress Ring */}
            <div className="relative h-24 w-24">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="8"
                  strokeDasharray={`${(todayStats.percentage / 100) * 283} 283`}
                  strokeLinecap="round"
                  className="origin-center -rotate-90 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-bold text-slate-900">{todayStats.percentage}%</p>
              </div>
            </div>
          </div>

          {todayStats.total === 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No habits scheduled for today. Check your targets in the full tracker.
              </p>
            </div>
          )}
        </div>

        {/* Today's habits list */}
        {todayHabits.length > 0 && (
          <section className="space-y-3">
            <h2 className="px-2 font-brand-display text-2xl text-slate-900">Your habits today</h2>

            {todayHabits.map((habit) => (
              <article
                key={habit.index}
                className={`flex items-center justify-between rounded-3xl border-2 p-4 transition ${
                  habit.isCompleted
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{habit.name}</h3>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                      {habit.category}
                    </span>
                  </div>
                  {habit.streak > 0 && (
                    <p className="mt-1 text-xs text-slate-600">
                      🔥 {habit.streak}-day streak
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleHabit(habit.index)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition ${
                    habit.isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {habit.isCompleted ? "✓" : "+"}
                </button>
              </article>
            ))}
          </section>
        )}

        {/* Account & Navigation Footer */}
        <div className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Account</p>
              <p className="mt-1 font-semibold text-slate-900">{userEmail}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-full border-2 border-slate-900 bg-slate-900 px-4 py-2 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/overview"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-900 bg-slate-900 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Monthly Tracker
            </Link>
            <Link
              href="/habit-tracker"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Weekly Goals
            </Link>
            <Link
              href="/insights"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Insights
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


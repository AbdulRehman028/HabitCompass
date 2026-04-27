"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { enqueueToast } from "@/store/uiSlice";
import { computeHabitStreakSummary } from "@/components/core/tracker/streakEngine";
import AppShell from "@/components/common/AppShell";

export default function InsightsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const snapshot = useAppSelector((state) => state.tracker.snapshot);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const weekDays = useMemo(() => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], []);

  // Calculate weekly completion by day of week
  const weeklyCompletionByDay = useMemo(() => {
    if (!snapshot?.habits || !snapshot.trackerMarks) return weekDays.map(() => ({ completed: 0, total: 0 }));

    const dayStats = weekDays.map(() => ({ completed: 0, total: 0 }));

    snapshot.habits.forEach((habitName, habitIdx) => {
      if (!habitName || habitName.trim() === "") return;

      const target = snapshot.habitTargets?.[habitIdx] || 1;
      const marks = snapshot.trackerMarks[habitIdx] || [];

      for (let dayIdx = 0; dayIdx < Math.min(7, marks.length); dayIdx++) {
        const daysInWeek = Array.from({ length: target }, (_, i) => i);
        if (daysInWeek.includes(dayIdx)) {
          dayStats[dayIdx].total += 1;
          const mark = marks[dayIdx];
          if (mark === 1 || mark === 2 || mark === 3) {
            dayStats[dayIdx].completed += 1;
          }
        }
      }
    });

    return dayStats;
  }, [snapshot, weekDays]);

  // Find best and worst habits
  const habitStats = useMemo(() => {
    if (!snapshot?.habits) return { best: null, atRisk: null, allStats: [] };

    const stats = snapshot.habits
      .map((habitName, habitIdx) => {
        if (!habitName || habitName.trim() === "") return null;

        const marks = snapshot.trackerMarks?.[habitIdx] || [];
        const streak = computeHabitStreakSummary(marks);
        let completed = 0;
        marks.forEach((mark) => {
          if (mark === 1 || mark === 2 || mark === 3) completed += 1;
        });

        return {
          name: habitName,
          index: habitIdx,
          streak: streak.currentStreak,
          completed,
          total: marks.length,
          percentage: marks.length > 0 ? Math.round((completed / marks.length) * 100) : 0,
        };
      })
      .filter((s) => s !== null) as Array<{
      name: string;
      index: number;
      streak: number;
      completed: number;
      total: number;
      percentage: number;
    }>;

    stats.sort((a, b) => b.percentage - a.percentage);

    return {
      best: stats[0] || null,
      atRisk: stats[stats.length - 1] || null,
      allStats: stats,
    };
  }, [snapshot]);

  // Best day of week
  const bestDay = useMemo(() => {
    const stats = weeklyCompletionByDay.map((day, idx) => ({
      day: weekDays[idx],
      percentage: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
    }));
    return stats.reduce((best, current) => (current.percentage > best.percentage ? current : best), stats[0]);
  }, [weeklyCompletionByDay, weekDays]);

  // Weekly summary
  const weeklySummary = useMemo(() => {
    let totalCompleted = 0;
    let totalTracked = 0;
    weeklyCompletionByDay.forEach((day) => {
      totalCompleted += day.completed;
      totalTracked += day.total;
    });
    return {
      completed: totalCompleted,
      total: totalTracked,
      percentage: totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : 0,
    };
  }, [weeklyCompletionByDay]);

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
        <p className="font-brand-display text-3xl">Loading insights...</p>
      </main>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Insights</p>
          <h1 className="mt-3 font-brand-display text-4xl leading-none tracking-tight text-slate-900">
            Your weekly breakdown
          </h1>
        </header>

        {/* Weekly Summary */}
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">This week</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-brand-display text-3xl text-slate-900">
                {weeklySummary.completed}/{weeklySummary.total}
              </p>
              <p className="mt-1 text-sm text-slate-600">habits logged this week</p>
            </div>
            <div>
              <p className="font-brand-display text-3xl text-slate-900">{weeklySummary.percentage}%</p>
              <p className="mt-1 text-sm text-slate-600">overall completion rate</p>
            </div>
          </div>
        </div>

        {/* Best Habit, At-Risk Habit, Best Day */}
        <div className="grid gap-4 sm:grid-cols-3">
          {habitStats.best && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Best Habit</p>
              <p className="mt-3 font-bold text-slate-900">{habitStats.best.name}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-brand-display text-2xl text-slate-900">{habitStats.best.percentage}%</p>
                <p className="text-sm text-slate-600">completion</p>
              </div>
              {habitStats.best.streak > 0 && (
                <p className="mt-2 text-sm text-emerald-600">
                  🔥 {habitStats.best.streak}-day streak
                </p>
              )}
            </div>
          )}

          {habitStats.atRisk && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">At Risk</p>
              <p className="mt-3 font-bold text-slate-900">{habitStats.atRisk.name}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-brand-display text-2xl text-slate-900">{habitStats.atRisk.percentage}%</p>
                <p className="text-sm text-slate-600">completion</p>
              </div>
              {habitStats.atRisk.streak === 0 && (
                <p className="mt-2 text-sm text-amber-600">Needs attention</p>
              )}
            </div>
          )}

          {bestDay && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Best Day</p>
              <p className="mt-3 font-bold text-slate-900">{bestDay.day}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="font-brand-display text-2xl text-slate-900">{bestDay.percentage}%</p>
                <p className="text-sm text-slate-600">completion</p>
              </div>
            </div>
          )}
        </div>

        {/* Daily Breakdown */}
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Daily Completion</p>
          <div className="mt-4 space-y-3">
            {weekDays.map((day, idx) => {
              const dayData = weeklyCompletionByDay[idx];
              const percentage = dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0;

              return (
                <div key={day} className="flex items-center gap-4">
                  <p className="w-20 text-sm font-semibold text-slate-700">{day}</p>
                  <div className="flex-1">
                    <div className="relative h-2 rounded-full bg-slate-200">
                      <div
                        className="absolute h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="w-12 text-right text-sm font-bold text-slate-900">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

      </section>
    </AppShell>
  );
}


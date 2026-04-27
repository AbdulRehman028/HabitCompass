"use client";

import Link from "next/link";
import { useEffect } from "react";
import BasicHabitTrackerTable from "@/components/core/tracker/BasicHabitTrackerTable";
import ScoreGraphTable from "@/components/core/tracker/ScoreGraphTable";
import ScorePreview from "@/components/core/tracker/ScorePreview";
import TrackerFooter from "@/components/core/tracker/TrackerFooter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeTracker, saveTrackerSnapshot } from "@/store/trackerSlice";

export default function TrackerApp() {
  const dispatch = useAppDispatch();
  const snapshot = useAppSelector((state) => state.tracker.snapshot);
  const clientId = useAppSelector((state) => state.tracker.clientId);
  const hasLoadedRemote = useAppSelector((state) => state.tracker.hasLoadedRemote);

  useEffect(() => {
    void dispatch(initializeTracker());
  }, [dispatch]);

  useEffect(() => {
    if (!clientId || !hasLoadedRemote) return;

    const timeout = window.setTimeout(async () => {
      try {
        await dispatch(saveTrackerSnapshot()).unwrap();
      } catch {
        // User-facing error messaging is dispatched from the thunk.
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, snapshot, clientId, hasLoadedRemote]);

  const completedToday = snapshot?.trackerMarks
    ? snapshot.trackerMarks.reduce((sum, marks) => {
        const todayMark = marks[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
        return sum + (todayMark === 1 ? 1 : 0);
      }, 0)
    : 0;

  const activeHabits = snapshot?.habits?.filter((h) => h && h.trim() !== "").length || 0;

  return (
    <main className="min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <p className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
                Monthly View
              </p>
              <h1 className="mt-4 font-brand-display text-4xl leading-none tracking-tight text-slate-900 sm:text-5xl">
                Your Habits
              </h1>
              <p className="mt-3 text-slate-600">
                Track daily completions across the full month. Click any habit to see details.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:flex-col">
              <Link
                href="/habit-tracker"
                className="rounded-full border-2 border-slate-900 bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Weekly Goals
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Active Habits</p>
              <p className="mt-2 font-brand-display text-2xl text-slate-900">{activeHabits}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Completed Today</p>
              <p className="mt-2 font-brand-display text-2xl text-slate-900">{completedToday}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Today&apos;s Date</p>
              <p className="mt-2 font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Main Tracker */}
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <BasicHabitTrackerTable />
        </div>

        {/* Score Section */}
        <section className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="font-brand-display text-2xl text-slate-900">Monthly Trend</h2>
          <p className="text-sm text-slate-600">Your completion score across the month</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-start">
            <ScorePreview />
            <ScoreGraphTable />
          </div>
        </section>

        {/* Footer */}
        <TrackerFooter />
      </section>
    </main>
  );
}


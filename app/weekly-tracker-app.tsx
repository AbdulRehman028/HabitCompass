"use client";

import { useEffect, useState } from "react";
import HabitAddHeader from "@/components/core/tracker/HabitAddHeader";
import DateRangeSelector, { type DateRange } from "@/components/core/tracker/DateRangeSelector";
import SimpleDynamicHabitTable from "@/components/core/tracker/SimpleDynamicHabitTable";
import ScoreGraphTable from "@/components/core/tracker/ScoreGraphTable";
import NotesSection from "@/components/core/tracker/NotesSection";
import TrackerFooter from "@/components/core/tracker/TrackerFooter";
import AppShell from "@/components/common/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeTracker, saveTrackerSnapshot, setCustomRange, acknowledgeAutosaveSkip } from "@/store/trackerSlice";

export default function WeeklyTrackerApp() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const [selectedRange, setSelectedRange] = useState<DateRange>("7");
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();

  useEffect(() => {
    void dispatch(initializeTracker());
  }, [dispatch]);

  // When snapshot loads from remote, hydrate custom range UI
  const snapshot = useAppSelector((s) => s.tracker.snapshot);
  const skipAutosaveAfterInit = useAppSelector((s) => s.tracker.skipAutosaveAfterInit);
  const clientId = useAppSelector((s) => s.tracker.clientId);
  const hasLoadedRemote = useAppSelector((s) => s.tracker.hasLoadedRemote);
  useEffect(() => {
    if (snapshot.rangeStartISO && snapshot.rangeEndISO) {
      try {
        const start = new Date(snapshot.rangeStartISO);
        const end = new Date(snapshot.rangeEndISO);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= end) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedRange("custom");
          setCustomStart(start);
          setCustomEnd(end);
        }
      } catch {
        // ignore
      }
    }
  }, [snapshot.rangeStartISO, snapshot.rangeEndISO]);

  useEffect(() => {
    if (!clientId || !hasLoadedRemote) return;

    if (skipAutosaveAfterInit) {
      dispatch(acknowledgeAutosaveSkip());
      return;
    }

    const debounceTimer = setTimeout(() => {
      void dispatch(saveTrackerSnapshot());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [dispatch, snapshot, clientId, hasLoadedRemote, skipAutosaveAfterInit]);

  const activeHabits = habits.filter((h) => h && h.trim() !== "").length;

  const getDaysToShow = (): number => {
    if (selectedRange === "7") return 7;
    if (selectedRange === "30") return 30;
    if (selectedRange === "31") return 31;
    if (selectedRange === "custom" && customStart && customEnd) {
      const diffTime = Math.abs(customEnd.getTime() - customStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 7;
  };

  const getRangeLabel = () => {
    if (selectedRange === "7") return "Last 7 Days";
    if (selectedRange === "30") return "Last 30 Days";
    if (selectedRange === "31") return "Full Month";
    if (selectedRange === "custom" && customStart && customEnd) {
      return `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`;
    }
    return "All Time";
  };

  const daysToShow = getDaysToShow();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div>
            <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
              Habit Tracker
            </p>
            <h1 className="mt-4 font-brand-display text-4xl leading-none tracking-tight text-slate-900 sm:text-5xl">
              Build Your Tracking Window
            </h1>
            <p className="mt-3 text-slate-600">
              Add habits, choose a custom date range, and mark daily status in one focused table.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Active Habits</p>
              <p className="mt-2 font-brand-display text-2xl text-slate-900">{activeHabits}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Date Range</p>
              <p className="mt-2 font-semibold text-slate-900 text-sm">{getRangeLabel()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Days Tracked</p>
              <p className="mt-2 font-brand-display text-2xl text-slate-900">{daysToShow}</p>
            </div>
          </div>
        </div>

        {/* Add Habit Section */}
        <HabitAddHeader />

        {/* Date Range Selector */}
        <DateRangeSelector
          selectedRange={selectedRange}
          onRangeChange={(r) => {
            setSelectedRange(r);
            // clear custom selection if switching away
            if (r !== "custom") {
              setCustomStart(undefined);
              setCustomEnd(undefined);
              // also clear persisted custom range metadata
              void dispatch(setCustomRange({ startISO: "", endISO: "" }));
            }
          }}
          customStart={customStart}
          customEnd={customEnd}
          onCustomRangeChange={(start, end) => {
            setCustomStart(start);
            setCustomEnd(end);
            // persist custom range ISO to snapshot and save
            void dispatch(setCustomRange({ startISO: start.toISOString(), endISO: end.toISOString() }));
            void dispatch(saveTrackerSnapshot());
          }}
        />

        {/* Simple Habit Tracker Table */}
        <div>
          <SimpleDynamicHabitTable daysToShow={daysToShow} />
        </div>

        {/* Notes Section */}
        <NotesSection />

        {/* Score Section */}
        <section className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="font-brand-display text-2xl text-slate-900">Progress Trend</h2>
          <p className="text-sm text-slate-600">Your completion score over the selected period</p>
          <div className="mt-4">
            <ScoreGraphTable />
          </div>
        </section>

        {/* Footer */}
        <TrackerFooter />
      </section>
    </AppShell>
  );
}
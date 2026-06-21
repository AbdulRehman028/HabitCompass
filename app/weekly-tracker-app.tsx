"use client";

import { useEffect, useRef, useState } from "react";
import HabitAddHeader from "@/components/core/tracker/HabitAddHeader";
import DateRangeSelector, {
  type DateRange,
} from "@/components/core/tracker/DateRangeSelector";
import SimpleDynamicHabitTable from "@/components/core/tracker/SimpleDynamicHabitTable";
import ScoreGraphTable from "@/components/core/tracker/ScoreGraphTable";
import NotesSection from "@/components/core/tracker/NotesSection";
import TrackerFooter from "@/components/core/tracker/TrackerFooter";
import AppShell from "@/components/common/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  initializeTracker,
  saveTrackerSnapshot,
  setCustomRange,
  acknowledgeAutosaveSkip,
} from "@/store/trackerSlice";

export default function WeeklyTrackerApp() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const snapshot = useAppSelector((s) => s.tracker.snapshot);
  const [selectedRange, setSelectedRange] = useState<DateRange>("30");
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();
  const hasHydratedCustomRange = useRef(false);

  useEffect(() => {
    void dispatch(initializeTracker());
  }, [dispatch]);

  const skipAutosaveAfterInit = useAppSelector(
    (s) => s.tracker.skipAutosaveAfterInit,
  );
  const clientId = useAppSelector((s) => s.tracker.clientId);
  const hasLoadedRemote = useAppSelector((s) => s.tracker.hasLoadedRemote);

  const persistedCustomRange = (() => {
    if (!snapshot.rangeStartISO || !snapshot.rangeEndISO) return null;

    const start = new Date(snapshot.rangeStartISO);
    const end = new Date(snapshot.rangeEndISO);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;

    return { start, end };
  })();

  useEffect(() => {
    if (hasHydratedCustomRange.current || !persistedCustomRange) return;

    hasHydratedCustomRange.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedRange("custom");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomStart(persistedCustomRange.start);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomEnd(persistedCustomRange.end);
  }, [persistedCustomRange]);

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

  const effectiveCustomStart = customStart;
  const effectiveCustomEnd = customEnd;

  const getDaysToShow = (): number => {
    if (selectedRange === "7") return 7;
    if (selectedRange === "30") return 30;
    if (selectedRange === "31") return 31;
    if (selectedRange === "custom" && effectiveCustomStart && effectiveCustomEnd) {
      const diffTime = Math.abs(effectiveCustomEnd.getTime() - effectiveCustomStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 7;
  };

  const getRangeLabel = () => {
    if (selectedRange === "7") return "Last 7 Days";
    if (selectedRange === "30") return "Last 30 Days";
    if (selectedRange === "31") return "Full Month";
    if (selectedRange === "custom" && effectiveCustomStart && effectiveCustomEnd) {
      return `${effectiveCustomStart.toLocaleDateString()} - ${effectiveCustomEnd.toLocaleDateString()}`;
    }
    return "All Time";
  };

  const daysToShow = getDaysToShow();

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl space-y-6">
        {/* Quick Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Active Habits
            </p>
            <p className="mt-2 font-brand-display text-2xl text-slate-900">
              {activeHabits}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Date Range
            </p>
            <p className="mt-2 font-semibold text-slate-900 text-sm">
              {getRangeLabel()}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Days Tracked
            </p>
            <p className="mt-2 font-brand-display text-2xl text-slate-900">
              {daysToShow}
            </p>
          </div>
        </div>

        {/* Add Habit Section */}
        <HabitAddHeader />

        {/* Date Range Selector */}
        <DateRangeSelector
          selectedRange={selectedRange}
          onRangeChange={(r) => {
            setSelectedRange(r);
          }}
          customStart={effectiveCustomStart}
          customEnd={effectiveCustomEnd}
          onCustomRangeChange={(start, end) => {
            setCustomStart(start);
            setCustomEnd(end);
            hasHydratedCustomRange.current = true;
            // persist custom range ISO to snapshot and save
            void dispatch(
              setCustomRange({
                startISO: start.toISOString(),
                endISO: end.toISOString(),
              }),
            );
            void dispatch(saveTrackerSnapshot());
          }}
        />

        {/* Simple Habit Tracker Table */}
        <div>
          <SimpleDynamicHabitTable
            daysToShow={daysToShow}
            customStart={customStart}
            customEnd={customEnd}
          />
        </div>

        {/* Notes Section */}
        <NotesSection />

        {/* Score Section */}
        <section className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="font-brand-display text-2xl text-slate-900">
            Progress Trend
          </h2>
          <p className="text-sm text-slate-600">
            Your completion score over the selected period
          </p>
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

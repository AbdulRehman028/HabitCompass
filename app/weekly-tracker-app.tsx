"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HabitAddHeader from "@/components/core/tracker/HabitAddHeader";
import DateRangeSelector, { type DateRange } from "@/components/core/tracker/DateRangeSelector";
import HabitTrackerTable from "@/components/core/tracker/HabitTrackerTable";
import ScoreGraphTable from "@/components/core/tracker/ScoreGraphTable";
import TrackerFooter from "@/components/core/tracker/TrackerFooter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeTracker, saveTrackerSnapshot } from "@/store/trackerSlice";

export default function WeeklyTrackerApp() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const [selectedRange, setSelectedRange] = useState<DateRange>("7");
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();

  useEffect(() => {
    void dispatch(initializeTracker());
  }, [dispatch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      void dispatch(saveTrackerSnapshot());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [dispatch]);

  const activeHabits = habits.filter((h) => h && h.trim() !== "").length;

  const getRangeLabel = () => {
    if (selectedRange === "7") return "Last 7 Days";
    if (selectedRange === "30") return "Last 30 Days";
    if (selectedRange === "31") return "Full Month";
    if (selectedRange === "custom" && customStart && customEnd) {
      return `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`;
    }
    return "All Time";
  };

  return (
    <main className="min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
                Habit Tracker
              </p>
              <h1 className="mt-4 font-brand-display text-4xl leading-none tracking-tight text-slate-900 sm:text-5xl">
                Your Habits
              </h1>
              <p className="mt-3 text-slate-600">
                Manage your habits with custom date ranges and flexible tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:flex-col">
              <Link
                href="/overview"
                className="rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Overview
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
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Date Range</p>
              <p className="mt-2 font-semibold text-slate-900 text-sm">{getRangeLabel()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Today</p>
              <p className="mt-2 font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Add Habit Section */}
        <HabitAddHeader />

        {/* Date Range Selector */}
        <DateRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomRangeChange={(start, end) => {
            setCustomStart(start);
            setCustomEnd(end);
          }}
        />

        {/* Tracker Table */}
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <HabitTrackerTable />
        </div>

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
    </main>
  );
}
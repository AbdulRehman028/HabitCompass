"use client";

import { useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { CellState, DAYS } from "./constants";
import { computeHabitStreakSummary } from "./streakEngine";

const metricCards = [
  {
    label: "Current streak",
    description: "Most recent completed run",
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Longest streak",
    description: "Best run in this month",
    accent: "from-slate-700 to-slate-900",
  },
  {
    label: "Weekly streak",
    description: "5+ completed days per week",
    accent: "from-amber-400 to-amber-500",
  },
  {
    label: "Monthly chain",
    description: "Perfect days from month start",
    accent: "from-slate-900 to-slate-700",
  },
] as const;

export default function StreakEnginePanel() {
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const trackerMarks = useAppSelector((state) => state.tracker.snapshot.trackerMarks);
  const [manualSelection, setManualSelection] = useState<number | null>(null);

  const preferredHabitIndex = useMemo(
    () =>
      habits.findIndex(
        (habit, index) => habit.trim().length > 0 || trackerMarks[index].some((cell) => cell !== 0)
      ),
    [habits, trackerMarks]
  );

  const selectedHabitIndex = manualSelection ?? (preferredHabitIndex >= 0 ? preferredHabitIndex : 0);
  const selectedHabitLabel = habits[selectedHabitIndex]?.trim() || `Habit ${selectedHabitIndex + 1}`;
  const selectedMarks = trackerMarks[selectedHabitIndex] || Array.from({ length: DAYS }, () => 0 as CellState);
  const summary = useMemo(() => computeHabitStreakSummary(selectedMarks), [selectedMarks]);
  const currentStreakStart = summary.currentStreakStartIndex;
  const currentStreakEnd = summary.lastTrackedIndex;

  return (
    <section className="mt-6 rounded-[28px] border border-amber-200 bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_50%,#fffdf8_100%)] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
            Streak Engine
          </p>
          <h2 className="mt-4 font-brand-display text-3xl leading-none tracking-tight sm:text-4xl">
            Don&apos;t break the chain.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Track the selected habit with current, weekly, monthly, and longest streaks. The panel is derived from
            your existing monthly tracker data, so no new backend schema is required.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[520px] lg:justify-end">
          {habits.map((habit, index) => {
            const label = habit.trim().length > 0 ? habit.trim() : `Habit ${index + 1}`;
            const active = index === selectedHabitIndex;

            return (
              <button
                key={`${label}-${index}`}
                type="button"
                onClick={() => setManualSelection(index)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "border-zinc-900 bg-zinc-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-950"
                }`}
              >
                <span className="mr-2 rounded-full bg-white/15 px-2 py-0.5 text-xs font-black">{index + 1}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, index) => {
          const value =
            index === 0
              ? summary.currentStreak
              : index === 1
                ? summary.longestStreak
                : index === 2
                  ? summary.weeklyStreak
                  : summary.monthlyChain;

          return (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
            >
              <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
              <p className="mt-2 font-brand-display text-4xl leading-none text-slate-900">{value}</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{card.description}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Selected habit</p>
            <h3 className="font-brand-display text-2xl text-slate-900 sm:text-3xl">{selectedHabitLabel}</h3>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {summary.completedDays} completed • {Math.round(summary.completionRate * 100)}% month completion
          </p>
        </div>

        <div className="mt-4 overflow-x-auto pb-2">
          <div className="min-w-[860px]">
            <div className="relative pt-10">
              <div className="absolute left-4 right-4 top-[38px] h-px bg-slate-200" />
              <div className="grid grid-cols-[repeat(31,minmax(0,1fr))] gap-2">
                {selectedMarks.map((cell, index) => {
                  const completed = cell === 1;
                  const missed = cell === 2;
                  const inCurrentStreak =
                    currentStreakStart >= 0 && index >= currentStreakStart && index <= currentStreakEnd;
                  const inMonthlyChain = index < summary.monthlyChain;
                  const isSelected = index === currentStreakEnd;

                  return (
                    <div key={`${selectedHabitIndex}-${index}`} className="flex flex-col items-center gap-2">
                      <div
                        title={`Day ${index + 1}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-extrabold transition sm:h-10 sm:w-10 ${
                          completed
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : missed
                              ? "border-slate-300 bg-white text-slate-400"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                        } ${inMonthlyChain && !completed ? "border-amber-300 bg-amber-50 text-amber-700" : ""} ${
                          inCurrentStreak ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white" : ""
                        } ${isSelected ? "shadow-[0_0_0_4px_rgba(245,158,11,0.14)]" : ""}`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Completed
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" /> Missed / Empty
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-amber-400 bg-amber-50" /> Current streak
          </span>
        </div>
      </div>
    </section>
  );
}

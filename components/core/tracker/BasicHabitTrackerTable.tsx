"use client";

import { useMemo, useState } from "react";
import MarkSymbol from "@/components/common/MarkSymbol";
import { HABIT_ROWS } from "./constants";
import { setHabit, toggleTrackerCell } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const MONTH_DAYS = 31;
const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function BasicHabitTrackerTable() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const trackerMarks = useAppSelector((state) => state.tracker.snapshot.trackerMarks);
  const [expandedHabit, setExpandedHabit] = useState<number | null>(null);

  const habitRows = useMemo(
    () =>
      Array.from({ length: HABIT_ROWS }, (_, rowIndex) => {
        const name = habits[rowIndex]?.trim() || "";
        const marks = trackerMarks[rowIndex] || [];
        const completed = marks.filter((m) => m === 1).length;
        const percentage = marks.length > 0 ? Math.round((completed / marks.length) * 100) : 0;
        return { rowIndex, name, completed, total: marks.length, percentage };
      }),
    [habits, trackerMarks]
  );

  const handleCellClick = (rowIndex: number, dayIndex: number) => {
    dispatch(toggleTrackerCell({ rowIndex, dayIndex }));
  };

  const handleHabitNameChange = (rowIndex: number, value: string) => {
    dispatch(setHabit({ index: rowIndex, value }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Habit Cards with Progress */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Your Habits This Month</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {habitRows.map((row) => (
            <button
              key={row.rowIndex}
              type="button"
              onClick={() => setExpandedHabit(expandedHabit === row.rowIndex ? null : row.rowIndex)}
              className={`text-left rounded-3xl border-2 transition ${
                expandedHabit === row.rowIndex
                  ? "border-slate-900 bg-slate-900 text-white shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="space-y-3 p-4">
                <div className="line-clamp-2 font-bold leading-snug">
                  {row.name || `Habit ${row.rowIndex + 1}`}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${expandedHabit === row.rowIndex ? "text-slate-200" : "text-slate-600"}`}>
                      Completed
                    </span>
                    <span className={`text-xs font-bold ${expandedHabit === row.rowIndex ? "text-slate-100" : "text-slate-900"}`}>
                      {row.completed}/{row.total}
                    </span>
                  </div>
                  <div className={`h-2 w-full rounded-full ${expandedHabit === row.rowIndex ? "bg-slate-700" : "bg-slate-200"}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        expandedHabit === row.rowIndex ? "bg-emerald-400" : "bg-emerald-600"
                      }`}
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <div className={`text-right text-xs font-semibold ${expandedHabit === row.rowIndex ? "text-slate-200" : "text-slate-500"}`}>
                    {row.percentage}%
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Month View */}
      {expandedHabit !== null && (
        <div className="space-y-6 rounded-4xl border-2 border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-brand-display text-3xl leading-none text-slate-900">
                {habitRows[expandedHabit].name || `Habit ${expandedHabit + 1}`}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Tap days to mark complete • <span className="font-semibold text-emerald-600">{habitRows[expandedHabit].completed} completed</span> this month
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandedHabit(null)}
              className="rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS_SHORT.map((day, index) => (
                <div key={index} className="text-center text-xs font-bold uppercase text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: MONTH_DAYS }, (_, dayIdx) => {
                const mark = trackerMarks[expandedHabit]?.[dayIdx] || 0;
                const dayNum = dayIdx + 1;

                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => handleCellClick(expandedHabit, dayIdx)}
                    className={`aspect-square rounded-2xl border-2 font-bold text-sm transition ${
                      mark === 1
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_4px_12px_rgba(5,150,105,0.15)] hover:bg-emerald-100"
                        : mark === 2
                          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : mark === 3
                            ? "border-slate-400 bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-full flex-col items-center justify-between p-1">
                      <span className="text-xs">{dayNum}</span>
                      {mark > 0 && <MarkSymbol state={mark} className="text-base" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-4 w-4 rounded border-2 border-emerald-500 bg-emerald-50" />
                <span className="font-medium text-slate-700">Completed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-4 w-4 rounded border-2 border-rose-300 bg-rose-50" />
                <span className="font-medium text-slate-700">Missed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-4 w-4 rounded border-2 border-slate-400 bg-slate-100" />
                <span className="font-medium text-slate-700">Partial</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-4 w-4 rounded border-2 border-slate-200 bg-white" />
                <span className="font-medium text-slate-700">Empty</span>
              </div>
            </div>

            {/* Edit Mode */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                Edit Habit Name
              </label>
              <input
                type="text"
                value={habitRows[expandedHabit].name}
                onChange={(e) => handleHabitNameChange(expandedHabit, e.target.value)}
                placeholder={`Habit ${expandedHabit + 1}`}
                className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import MarkSymbol from "@/components/common/MarkSymbol";
import { HABIT_ROWS } from "./constants";
import { toggleTrackerCell } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface SimpleDynamicHabitTableProps {
  daysToShow: number; // 7, 15, 20, 30, 31, or custom
}

export default function SimpleDynamicHabitTable({ daysToShow }: SimpleDynamicHabitTableProps) {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const trackerMarks = useAppSelector((state) => state.tracker.snapshot.trackerMarks);

  const habitRows = useMemo(
    () =>
      Array.from({ length: HABIT_ROWS }, (_, rowIndex) => {
        const name = habits[rowIndex]?.trim() || `Habit ${rowIndex + 1}`;
        return { rowIndex, name };
      }),
    [habits]
  );

  const handleCellClick = (rowIndex: number, dayIndex: number) => {
    dispatch(toggleTrackerCell({ rowIndex, dayIndex }));
  };

  return (
    <div className="w-full overflow-x-auto rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 min-w-[120px] bg-slate-900 px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-white">
              Habits
            </th>
            {Array.from({ length: daysToShow }, (_, idx) => (
              <th
                key={idx}
                className="border border-slate-200 bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-600"
              >
                {idx + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habitRows.map((row) => (
            <tr key={row.rowIndex} className="hover:bg-slate-50">
              <td className="sticky left-0 z-10 min-w-[120px] border border-slate-200 bg-white px-3 py-3 font-semibold text-slate-900">
                {row.name}
              </td>
              {Array.from({ length: daysToShow }, (_, dayIdx) => {
                return (
                  <td
                    key={`${row.rowIndex}-${dayIdx}`}
                    className="border border-slate-200 px-1 py-2 text-center hover:bg-slate-100 cursor-pointer transition"
                    onClick={() => handleCellClick(row.rowIndex, dayIdx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleCellClick(row.rowIndex, dayIdx);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <MarkSymbol state={trackerMarks[row.rowIndex]?.[dayIdx] || 0} className="text-lg" />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="text-emerald-600 text-lg">✓</span>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="text-rose-600 text-lg">✗</span>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="text-slate-600 text-lg">•</span>
          <span>Partial</span>
        </div>
      </div>
    </div>
  );
}


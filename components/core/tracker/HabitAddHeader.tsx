"use client";

import { useState } from "react";
import { setHabit } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface HabitAddHeaderProps {
  onHabitAdded?: () => void;
}

const HABIT_COLORS = [
  { name: "Emerald", class: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  { name: "Sky", class: "bg-sky-100 border-sky-300 text-sky-700" },
  { name: "Violet", class: "bg-violet-100 border-violet-300 text-violet-700" },
  { name: "Amber", class: "bg-amber-100 border-amber-300 text-amber-700" },
  { name: "Rose", class: "bg-rose-100 border-rose-300 text-rose-700" },
  { name: "Slate", class: "bg-slate-100 border-slate-300 text-slate-700" },
];

export default function HabitAddHeader({ onHabitAdded }: HabitAddHeaderProps) {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const [habitName, setHabitName] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const firstEmptyIndex = habits.findIndex((h) => !h || h.trim() === "");

  const handleAddHabit = () => {
    if (habitName.trim() && firstEmptyIndex !== -1) {
      dispatch(setHabit({ index: firstEmptyIndex, value: habitName.trim() }));
      setHabitName("");
      setSelectedColor(0);
      setIsExpanded(false);
      onHabitAdded?.();
    }
  };

  return (
    <div className="space-y-3 rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-brand-display text-2xl text-white">Add New Habit</h3>
          <p className="mt-1 text-sm text-slate-200">
            {firstEmptyIndex !== -1
              ? `You can add ${10 - habits.filter((h) => h && h.trim() !== "").length} more habit${10 - habits.filter((h) => h && h.trim() !== "").length !== 1 ? "s" : ""}`
              : "All 10 habit slots are full"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
        >
          {isExpanded ? "Cancel" : "Add"}
        </button>
      </div>

      {isExpanded && firstEmptyIndex !== -1 && (
        <div className="space-y-4 border-t border-slate-700 pt-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-200">
              Habit Name
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddHabit();
                }
              }}
              placeholder="e.g., Morning Exercise, Read, Meditate..."
              className="mt-2 w-full rounded-xl border-2 border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-400 outline-none transition focus:border-white"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-200">
              Optional Color
            </label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {HABIT_COLORS.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(idx)}
                  className={`rounded-lg border-2 py-2 px-1 text-xs font-bold transition ${
                    selectedColor === idx
                      ? `${color.class} border-2 border-current shadow-[0_4px_12px_rgba(15,23,42,0.16)]`
                      : "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {color.name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddHabit}
            disabled={!habitName.trim()}
            className="w-full rounded-xl bg-white py-2 font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Habit
          </button>
        </div>
      )}
    </div>
  );
}

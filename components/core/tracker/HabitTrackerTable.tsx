"use client";

import { useMemo, useState } from "react";
import MarkSymbol from "@/components/common/MarkSymbol";
import { DAYS, HABIT_CATEGORIES, HABIT_ROWS } from "./constants";
import { setHabit, setHabitCategory, setHabitTags, setHabitTarget, toggleTrackerCell } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type SortMode = "index" | "progress" | "gap";

function categoryClasses(category: string): string {
  if (category === "Health") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (category === "Work") return "border-sky-200 bg-sky-50 text-sky-700";
  if (category === "Learning") return "border-violet-200 bg-violet-50 text-violet-700";
  if (category === "Mindfulness") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function HabitTrackerTable() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const habitTargets = useAppSelector((state) => state.tracker.snapshot.habitTargets);
  const habitCategories = useAppSelector((state) => state.tracker.snapshot.habitCategories);
  const habitTags = useAppSelector((state) => state.tracker.snapshot.habitTags);
  const trackerMarks = useAppSelector((state) => state.tracker.snapshot.trackerMarks);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("index");

  const habitRows = useMemo(
    () =>
      Array.from({ length: HABIT_ROWS }, (_, rowIndex) => {
        const completedDays = trackerMarks[rowIndex].filter((mark) => mark === 1).length;
        const target = habitTargets[rowIndex] || 5;
        const progress = target > 0 ? Math.min(1, completedDays / target) : 0;
        const gap = Math.max(0, target - completedDays);
        const name = habits[rowIndex]?.trim() || `Habit ${rowIndex + 1}`;
        const tags = habitTags[rowIndex] || [];

        return {
          rowIndex,
          name,
          target,
          completedDays,
          progress,
          gap,
          category: habitCategories[rowIndex] || "General",
          tags,
        };
      }),
    [habitCategories, habitTags, habitTargets, habits, trackerMarks]
  );

  const visibleRows = useMemo(() => {
    const loweredTagFilter = tagFilter.trim().toLowerCase();

    const filtered = habitRows.filter((row) => {
      const matchesCategory = categoryFilter === "All" || row.category === categoryFilter;
      const matchesTag =
        loweredTagFilter.length === 0 ||
        row.tags.some((tag) => tag.toLowerCase().includes(loweredTagFilter)) ||
        row.name.toLowerCase().includes(loweredTagFilter);

      return matchesCategory && matchesTag;
    });

    if (sortMode === "progress") {
      return [...filtered].sort((a, b) => b.progress - a.progress || a.rowIndex - b.rowIndex);
    }

    if (sortMode === "gap") {
      return [...filtered].sort((a, b) => b.gap - a.gap || a.rowIndex - b.rowIndex);
    }

    return filtered;
  }, [categoryFilter, habitRows, sortMode, tagFilter]);

  const achievedTargets = habitRows.filter((row) => row.completedDays >= row.target).length;

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Goals and Targets</p>
            <h2 className="mt-1 font-brand-display text-3xl text-slate-900">Weekly goals by habit</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {achievedTargets} of {HABIT_ROWS} habits met their weekly target.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Category
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-1 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
              >
                <option value="All">All</option>
                {HABIT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Search Tag
              <input
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="focus, cardio..."
                className="mt-1 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
              />
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Sort
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="mt-1 block h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
              >
                <option value="index">Default order</option>
                <option value="progress">Highest progress</option>
                <option value="gap">Biggest gap</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRows.map((row) => (
            <article key={row.rowIndex} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-slate-900">{row.name}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${categoryClasses(row.category)}`}>
                  {row.category}
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(row.progress * 100)}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>
                  {row.completedDays}/{row.target} days
                </span>
                <span>{Math.round(row.progress * 100)}%</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-none border-2 border-zinc-900">
        <table className="w-max min-w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th className="w-105 min-w-105 border border-zinc-900 px-3 py-0 text-left text-[15px] font-bold">
                HABITS / CATEGORY / TAGS / TARGET
              </th>
              {Array.from({ length: DAYS }, (_, index) => (
                <th
                  key={index + 1}
                  className="w-7 min-w-7 border border-zinc-900 px-0 py-0 text-[13px] font-bold"
                >
                  {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const rowIndex = row.rowIndex;

              return (
                <tr key={rowIndex}>
                  <td className="border border-zinc-900 px-0 py-0 text-left align-middle">
                    <div className="grid gap-2 px-3 py-2">
                      <div className="flex items-center gap-2 text-[15px] font-bold">
                        <span className="w-6 shrink-0">{rowIndex + 1}.</span>
                        <input
                          value={habits[rowIndex] || ""}
                          onChange={(event) => dispatch(setHabit({ index: rowIndex, value: event.target.value }))}
                          aria-label={`Habit ${rowIndex + 1}`}
                          className="w-full min-w-0 border-0 bg-transparent px-0 py-0 outline-none focus:ring-0"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <select
                          value={habitCategories[rowIndex] || "General"}
                          onChange={(event) =>
                            dispatch(setHabitCategory({ index: rowIndex, value: event.target.value }))
                          }
                          aria-label={`Habit ${rowIndex + 1} category`}
                          className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700"
                        >
                          {HABIT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>

                        <input
                          value={(habitTags[rowIndex] || []).join(", ")}
                          onChange={(event) => dispatch(setHabitTags({ index: rowIndex, value: event.target.value }))}
                          placeholder="tags: morning, deep-work"
                          aria-label={`Habit ${rowIndex + 1} tags`}
                          className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700"
                        />

                        <label className="flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700">
                          <span>Weekly target</span>
                          <select
                            value={habitTargets[rowIndex] || 5}
                            onChange={(event) =>
                              dispatch(setHabitTarget({ index: rowIndex, value: Number(event.target.value) }))
                            }
                            aria-label={`Habit ${rowIndex + 1} weekly target`}
                            className="h-7 border-0 bg-transparent px-0 text-xs font-bold text-slate-900 outline-none"
                          >
                            {Array.from({ length: 7 }, (_, index) => (
                              <option key={index + 1} value={index + 1}>
                                {index + 1}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: DAYS }, (_, dayIndex) => (
                    <td
                      key={dayIndex}
                      className="h-7.5 border border-zinc-900 text-center text-[18px] font-bold leading-none select-none"
                      onClick={() => dispatch(toggleTrackerCell({ rowIndex, dayIndex }))}
                    >
                      <MarkSymbol state={trackerMarks[rowIndex][dayIndex]} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

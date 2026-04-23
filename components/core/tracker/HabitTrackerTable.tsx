"use client";

import MarkSymbol from "@/components/common/MarkSymbol";
import { DAYS, HABIT_ROWS } from "./constants";
import { setHabit, toggleTrackerCell } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function HabitTrackerTable() {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.tracker.snapshot.habits);
  const trackerMarks = useAppSelector((state) => state.tracker.snapshot.trackerMarks);

  return (
    <section className="overflow-x-auto rounded-none border-2 border-zinc-900">
      <table className="w-max min-w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="w-[320px] min-w-[320px] border border-zinc-900 px-3 py-0 text-left text-[15px] font-bold">
              HABITS/PROTOCOLS
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
          {Array.from({ length: HABIT_ROWS }, (_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="border border-zinc-900 px-0 py-0 text-left align-middle">
                <div className="flex min-h-[30px] items-center gap-2 px-3 text-[15px] font-bold">
                  <span className="w-6 shrink-0">{rowIndex + 1}.</span>
                  <input
                    value={habits[rowIndex] || ""}
                    onChange={(event) => dispatch(setHabit({ index: rowIndex, value: event.target.value }))}
                    aria-label={`Habit ${rowIndex + 1}`}
                    className="w-full min-w-0 border-0 bg-transparent px-0 py-0 outline-none focus:ring-0"
                  />
                </div>
              </td>
              {Array.from({ length: DAYS }, (_, dayIndex) => (
                <td
                  key={dayIndex}
                  className="h-[30px] border border-zinc-900 text-center text-[18px] font-bold leading-none select-none"
                  onClick={() => dispatch(toggleTrackerCell({ rowIndex, dayIndex }))}
                >
                  <MarkSymbol state={trackerMarks[rowIndex][dayIndex]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

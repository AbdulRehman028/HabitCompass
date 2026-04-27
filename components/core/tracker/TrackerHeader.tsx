"use client";

import { clearAll, setMonth, setName } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function TrackerHeader() {
  const dispatch = useAppDispatch();
  const name = useAppSelector((state) => state.tracker.snapshot.name);
  const month = useAppSelector((state) => state.tracker.snapshot.month);

  return (
    <section className="mb-5 rounded-3xl border border-zinc-200 bg-linear-to-r from-white to-zinc-50 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:gap-6">
          <div className="text-[17px] font-bold whitespace-nowrap">
            Name:
            <input
              value={name}
              onChange={(event) => dispatch(setName(event.target.value))}
              aria-label="Name"
              className="ml-2 inline-block min-w-55 border-b-2 border-dotted border-zinc-900 bg-transparent px-1 py-0.5 font-inherit outline-none focus:border-solid"
            />
          </div>
          <h1 className="text-center font-serif text-4xl leading-none tracking-tight sm:text-5xl lg:text-[60px]">
            Monthly Habit Tracker
          </h1>
          <div className="text-[17px] font-bold whitespace-nowrap lg:text-right">
            Month:
            <input
              value={month}
              onChange={(event) => dispatch(setMonth(event.target.value))}
              aria-label="Month"
              className="ml-2 inline-block min-w-40 border-b-2 border-dotted border-zinc-900 bg-transparent px-1 py-0.5 font-inherit outline-none focus:border-solid"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => dispatch(clearAll())}
            className="rounded-full border-2 border-zinc-900 bg-zinc-950 px-4 py-2 font-bold text-white transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Clear All
          </button>
        </div>
      </div>
    </section>
  );
}

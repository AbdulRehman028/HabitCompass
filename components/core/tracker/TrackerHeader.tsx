"use client";

import { clearAll, setMonth, setName } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function TrackerHeader() {
  const dispatch = useAppDispatch();
  const name = useAppSelector((state) => state.tracker.snapshot.name);
  const month = useAppSelector((state) => state.tracker.snapshot.month);

  return (
    <section className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
      <div className="text-[17px] font-bold whitespace-nowrap">
        Name:
        <input
          value={name}
          onChange={(event) => dispatch(setName(event.target.value))}
          aria-label="Name"
          className="ml-2 inline-block min-w-[220px] border-b-2 border-dotted border-zinc-900 bg-transparent px-1 py-0.5 font-inherit outline-none focus:border-solid"
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
          className="ml-2 inline-block min-w-[160px] border-b-2 border-dotted border-zinc-900 bg-transparent px-1 py-0.5 font-inherit outline-none focus:border-solid"
        />
      </div>
      <button
        type="button"
        onClick={() => dispatch(clearAll())}
        className="justify-self-start rounded-full border-2 border-zinc-900 bg-zinc-950 px-4 py-2 font-bold text-white transition hover:-translate-y-0.5 hover:opacity-95 lg:justify-self-end"
      >
        Clear All
      </button>
    </section>
  );
}

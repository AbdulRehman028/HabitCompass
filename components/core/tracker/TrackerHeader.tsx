"use client";

import { useRouter } from "next/navigation";
import { clearAll, setMonth, setName } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { enqueueToast } from "@/store/uiSlice";

export default function TrackerHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const name = useAppSelector((state) => state.tracker.snapshot.name);
  const month = useAppSelector((state) => state.tracker.snapshot.month);

  const handleSignOut = async () => {
    const { error } = await supabaseBrowser.auth.signOut({ scope: "local" });
    if (error) {
      dispatch(enqueueToast({ tone: "error", message: "Could not sign out. Please try again." }));
      return;
    }

    dispatch(enqueueToast({ tone: "info", message: "Signed out successfully." }));
    router.replace("/");
  };

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
      <div className="flex items-center gap-2 justify-self-start lg:justify-self-end">
        <button
          type="button"
          onClick={() => dispatch(clearAll())}
          className="rounded-full border-2 border-zinc-900 bg-zinc-950 px-4 py-2 font-bold text-white transition hover:-translate-y-0.5 hover:opacity-95"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border-2 border-zinc-900 bg-white px-4 py-2 font-bold text-zinc-900 transition hover:-translate-y-0.5 hover:bg-zinc-100"
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}

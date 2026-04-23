"use client";

import { useEffect } from "react";
import HabitTrackerTable from "@/components/core/tracker/HabitTrackerTable";
import ScoreGraphTable from "@/components/core/tracker/ScoreGraphTable";
import ScorePreview from "@/components/core/tracker/ScorePreview";
import TrackerFooter from "@/components/core/tracker/TrackerFooter";
import TrackerHeader from "@/components/core/tracker/TrackerHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeTracker, saveTrackerSnapshot } from "@/store/trackerSlice";

export default function TrackerApp() {
  const dispatch = useAppDispatch();
  const snapshot = useAppSelector((state) => state.tracker.snapshot);
  const clientId = useAppSelector((state) => state.tracker.clientId);
  const hasLoadedRemote = useAppSelector((state) => state.tracker.hasLoadedRemote);

  useEffect(() => {
    void dispatch(initializeTracker());
  }, [dispatch]);

  useEffect(() => {
    if (!clientId || !hasLoadedRemote) return;

    const timeout = window.setTimeout(async () => {
      try {
        await dispatch(saveTrackerSnapshot()).unwrap();
      } catch (error) {
        console.error("Failed to save tracker progress", error);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [dispatch, snapshot, clientId, hasLoadedRemote]);

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-950">
      <div className="mx-auto max-w-[1280px] rounded-[28px] border border-zinc-300 bg-white p-4 shadow-[0_16px_60px_rgba(0,0,0,0.08)] sm:p-6">
        <TrackerHeader />

        <HabitTrackerTable />

        <section className="mt-6 grid gap-4 lg:grid-cols-[210px_1fr] lg:items-start">
          <ScorePreview />
          <ScoreGraphTable />
        </section>

        <TrackerFooter />
      </div>
    </main>
  );
}

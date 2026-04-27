"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setNotes, saveTrackerSnapshot } from "@/store/trackerSlice";

export default function NotesSection() {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.tracker.snapshot.notes || "");
  const [localNotes, setLocalNotes] = useState(notes);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalNotes(notes);
  }, [notes]);

  const handleSave = async () => {
    setIsSaving(true);
    dispatch(setNotes(localNotes));
    try {
      await dispatch(saveTrackerSnapshot()).unwrap();
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setLocalNotes(notes);
    setIsEditing(false);
  };

  return (
    <section className="space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-brand-display text-2xl text-slate-900">Notes</h3>
          <p className="mt-1 text-sm text-slate-600">Add personal notes, reflections, or action items.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-slate-700 break-words">
            {localNotes || <span className="italic text-slate-400">No notes yet. Click Edit to add some.</span>}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Write your notes here... what's working? what needs adjustment?"
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-black transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

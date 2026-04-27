"use client";

import { useMemo } from "react";

export type DateRange = "7" | "30" | "31" | "custom";

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  customStart?: Date;
  customEnd?: Date;
  onCustomRangeChange?: (start: Date, end: Date) => void;
}

export default function DateRangeSelector({
  selectedRange,
  onRangeChange,
  customStart,
  customEnd,
  onCustomRangeChange,
}: DateRangeSelectorProps) {
  const rangeOptions: Array<{ label: string; value: DateRange; days: number }> = useMemo(
    () => [
      { label: "Last 7 Days", value: "7", days: 7 },
      { label: "Last 30 Days", value: "30", days: 30 },
      { label: "Full Month (31)", value: "31", days: 31 },
      { label: "Custom Range", value: "custom", days: 0 },
    ],
    []
  );

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
        Date Range
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rangeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onRangeChange(option.value)}
            className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
              selectedRange === option.value
                ? "border-slate-900 bg-white text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.12)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedRange === "custom" && onCustomRangeChange && (
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Start Date</label>
            <input
              type="date"
              value={customStart?.toISOString().split("T")[0] || ""}
              onChange={(e) => {
                const start = new Date(e.target.value);
                const end = customEnd || new Date();
                if (start <= end) {
                  onCustomRangeChange(start, end);
                }
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">End Date</label>
            <input
              type="date"
              value={customEnd?.toISOString().split("T")[0] || ""}
              onChange={(e) => {
                const end = new Date(e.target.value);
                const start = customStart || new Date();
                if (start <= end) {
                  onCustomRangeChange(start, end);
                }
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}

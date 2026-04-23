"use client";

import { CellState } from "@/components/core/tracker/constants";

type MarkSymbolProps = {
  state: CellState;
  className?: string;
};

export default function MarkSymbol({ state, className = "" }: MarkSymbolProps) {
  if (state === 1) {
    return <span className={`text-emerald-700 ${className}`.trim()}>✓</span>;
  }

  if (state === 2) {
    return <span className={`text-rose-700 ${className}`.trim()}>✗</span>;
  }

  if (state === 3) {
    return <span className={`text-zinc-900 ${className}`.trim()}>•</span>;
  }

  return <span className={className}>&nbsp;</span>;
}

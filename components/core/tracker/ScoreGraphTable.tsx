"use client";

import { useEffect, useRef } from "react";
import MarkSymbol from "@/components/common/MarkSymbol";
import { DAYS, SCORE_ROW_LABELS } from "./constants";
import { toggleScoreCell } from "@/store/trackerSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function ScoreGraphTable() {
  const dispatch = useAppDispatch();
  const scoreMarks = useAppSelector((state) => state.tracker.snapshot.scoreMarks);
  const scoreWrapRef = useRef<HTMLDivElement | null>(null);
  const scoreSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const wrap = scoreWrapRef.current;
    const svg = scoreSvgRef.current;
    if (!wrap || !svg) return;

    const draw = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const pointsByDay = new Map<number, { x: number; y: number }>();
      const wrapRect = wrap.getBoundingClientRect();
      const width = wrap.scrollWidth;
      const height = wrap.scrollHeight;

      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      wrap.querySelectorAll<HTMLElement>("[data-score-mark='true']").forEach((cell) => {
        if (cell.dataset.state !== "3") return;
        const day = Number(cell.dataset.day);
        if (!day || pointsByDay.has(day)) return;

        const rect = cell.getBoundingClientRect();
        const x = rect.left - wrapRect.left + wrap.scrollLeft + rect.width / 2;
        const y = rect.top - wrapRect.top + wrap.scrollTop + rect.height / 2;
        pointsByDay.set(day, { x, y });
      });

      const points = Array.from(pointsByDay.entries())
        .sort(([a], [b]) => a - b)
        .map(([, value]) => value);

      if (points.length >= 2) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = points
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
          .join(" ");

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#000");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        svg.appendChild(path);
      }

      points.forEach((point) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute("r", "4.5");
        circle.setAttribute("fill", "#000");
        svg.appendChild(circle);
      });
    };

    draw();
    window.addEventListener("resize", draw);
    wrap.addEventListener("scroll", draw);

    const observer = new ResizeObserver(draw);
    observer.observe(wrap);

    return () => {
      window.removeEventListener("resize", draw);
      wrap.removeEventListener("scroll", draw);
      observer.disconnect();
    };
  }, [scoreMarks]);

  return (
    <div ref={scoreWrapRef} className="relative overflow-auto rounded-none border-2 border-zinc-900 bg-white">
      <svg ref={scoreSvgRef} className="pointer-events-none absolute left-0 top-0 z-10" aria-hidden="true" />
      <table className="relative z-[1] w-max min-w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="w-20 min-w-20 border border-zinc-900 px-0 py-0 text-[15px] font-bold">Done!</th>
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
          {SCORE_ROW_LABELS.map((label, rowIndex) => (
            <tr key={label}>
              <td className="border border-zinc-900 px-0 py-0 text-center text-[15px] font-bold">{label}</td>
              {Array.from({ length: DAYS }, (_, dayIndex) => (
                <td
                  key={dayIndex}
                  data-score-mark="true"
                  data-day={dayIndex + 1}
                  data-state={scoreMarks[rowIndex][dayIndex]}
                  className="h-[30px] border border-zinc-900 text-center text-[18px] font-bold leading-none select-none cursor-pointer"
                  onClick={() => dispatch(toggleScoreCell({ rowIndex, dayIndex }))}
                >
                  {scoreMarks[rowIndex][dayIndex] === 3 ? null : (
                    <MarkSymbol state={scoreMarks[rowIndex][dayIndex]} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

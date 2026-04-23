"use client";

export default function ScorePreview() {
  return (
    <div>
      <h2 className="font-serif text-[36px] leading-none">Score Graph:</h2>
      <p className="mb-3 text-[15px] font-semibold text-zinc-600">Daily habits</p>
      <div className="relative mt-2 h-[120px] w-[150px] border-b-2 border-l-2 border-zinc-900 bg-[repeating-linear-gradient(to_right,rgba(0,0,0,0.12),rgba(0,0,0,0.12)_1px,transparent_1px,transparent_18px),repeating-linear-gradient(to_top,rgba(0,0,0,0.12),rgba(0,0,0,0.12)_1px,transparent_1px,transparent_18px)]">
        <svg viewBox="0 0 150 120" className="absolute inset-0 overflow-visible">
          <polyline
            fill="none"
            stroke="#111"
            strokeWidth="3"
            points="6,96 22,84 36,56 52,102 72,30 90,72 108,50 124,66 146,46"
          />
          <g fill="#111">
            <circle cx="6" cy="96" r="3" />
            <circle cx="22" cy="84" r="3" />
            <circle cx="36" cy="56" r="3" />
            <circle cx="52" cy="102" r="3" />
            <circle cx="72" cy="30" r="3" />
            <circle cx="90" cy="72" r="3" />
            <circle cx="108" cy="50" r="3" />
            <circle cx="124" cy="66" r="3" />
            <circle cx="146" cy="46" r="3" />
          </g>
          <text x="64" y="18" fontSize="10" fill="#222" fontFamily="Segoe UI, Tahoma, sans-serif">
            max
          </text>
          <text x="45" y="116" fontSize="10" fill="#222" fontFamily="Segoe UI, Tahoma, sans-serif">
            min
          </text>
        </svg>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
};

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  if (isVisible) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
      <path d="M9.9 5.2A9.9 9.9 0 0 1 12 5c6 0 9.5 7 9.5 7a18.6 18.6 0 0 1-3.2 4.2" />
      <path d="M6.3 6.3C3.8 8 2.5 12 2.5 12s3.5 7 9.5 7a10 10 0 0 0 3-.5" />
    </svg>
  );
}

export default function PasswordInput({ id, label, value, onChange, autoComplete }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm font-bold text-zinc-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete={autoComplete}
          className="w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 pr-12 text-sm font-semibold outline-none transition focus:border-zinc-900"
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 transition hover:text-zinc-900"
        >
          <EyeIcon isVisible={isVisible} />
        </button>
      </div>
    </div>
  );
}
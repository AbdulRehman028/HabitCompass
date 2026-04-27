"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAppDispatch } from "@/store/hooks";
import { enqueueToast } from "@/store/uiSlice";
import { setHabit, setHabitCategory, setHabitTarget } from "@/store/trackerSlice";

type OnboardingStep = 1 | 2 | 3 | 4;

const interestAreas = [
  { label: "Health", icon: "💪", color: "from-emerald-400 to-emerald-600" },
  { label: "Learning", icon: "🧠", color: "from-violet-400 to-violet-600" },
  { label: "Productivity", icon: "⚡", color: "from-amber-400 to-amber-600" },
  { label: "Mindfulness", icon: "🧘", color: "from-sky-400 to-sky-600" },
] as const;

const habitTemplates: Record<string, { name: string; category: string; target: number }[]> = {
  Health: [
    { name: "Drink water (8 glasses)", category: "Health", target: 7 },
    { name: "Exercise 30 mins", category: "Health", target: 5 },
    { name: "Sleep 8 hours", category: "Health", target: 7 },
  ],
  Learning: [
    { name: "Read 20 minutes", category: "Learning", target: 5 },
    { name: "Online course", category: "Learning", target: 3 },
    { name: "Practice new skill", category: "Learning", target: 4 },
  ],
  Productivity: [
    { name: "Clear inbox", category: "Work", target: 5 },
    { name: "Deep work (2 hours)", category: "Work", target: 4 },
    { name: "Plan tomorrow", category: "Work", target: 5 },
  ],
  Mindfulness: [
    { name: "Meditate 10 mins", category: "Mindfulness", target: 6 },
    { name: "Journal", category: "Mindfulness", target: 4 },
    { name: "Gratitude practice", category: "Mindfulness", target: 5 },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseBrowser.auth.getSession();

      if (error || !session) {
        router.replace("/login");
        return;
      }

      setIsLoading(false);
    };

    void verifySession();
  }, [router]);

  const handleSelectInterest = (interest: string) => {
    setSelectedInterest(interest);
  };

  const handleToggleHabit = (template: (typeof habitTemplates)[keyof typeof habitTemplates][0]) => {
    const key = template.name;
    setSelectedHabits((prev) => (prev.includes(key) ? prev.filter((h) => h !== key) : [...prev, key]));
  };

  const handleCompleteOnboarding = async () => {
    if (selectedHabits.length === 0) {
      dispatch(enqueueToast({ tone: "error", message: "Please select at least one habit." }));
      return;
    }

    setIsCompleting(true);

    try {
      const templates = habitTemplates[selectedInterest || "Health"] || [];
      let habitIndex = 0;

      for (const habitName of selectedHabits) {
        const template = templates.find((t) => t.name === habitName);
        if (template && habitIndex < 10) {
          dispatch(setHabit({ index: habitIndex, value: template.name }));
          dispatch(setHabitCategory({ index: habitIndex, value: template.category }));
          dispatch(setHabitTarget({ index: habitIndex, value: template.target }));
          habitIndex += 1;
        }
      }

      dispatch(
        enqueueToast({ tone: "success", message: "Your compass is set. Let&apos;s log your first habit!" })
      );

      router.replace("/overview");
    } catch (error) {
      console.error("Onboarding error:", error);
      dispatch(enqueueToast({ tone: "error", message: "Something went wrong. Try again." }));
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-6">
        <p className="font-brand-display text-3xl text-slate-900">Loading your compass...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Step {step} of 4
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i + 1}
                className={`h-2 w-2 rounded-full transition ${
                  i + 1 <= step ? "bg-slate-900" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Welcome
              </p>
              <h1 className="font-brand-display text-5xl leading-none tracking-tight text-slate-900">
                Let&apos;s build your compass.
              </h1>
              <p className="text-lg leading-7 text-slate-600">
                In 3 minutes, we&apos;ll set up your first habits and get you to your first win. No complexity, just clarity.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-700">What to expect:</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="text-base">1️⃣</span>
                  <span>Pick what you want to improve</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-base">2️⃣</span>
                  <span>Choose 3 starter habits</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-base">3️⃣</span>
                  <span>Set your targets</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-base">4️⃣</span>
                  <span>Log your first habit today</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-full border-2 border-slate-900 bg-slate-900 px-6 py-3 text-center font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Let&apos;s Begin
            </button>
          </div>
        )}

        {/* Step 2: Choose Interest */}
        {step === 2 && (
          <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div>
              <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
                Step 1
              </p>
              <h2 className="mt-4 font-brand-display text-4xl leading-none tracking-tight text-slate-900">
                What do you want to improve?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {interestAreas.map((interest) => (
                <button
                  key={interest.label}
                  type="button"
                  onClick={() => handleSelectInterest(interest.label)}
                  className={`rounded-3xl border-2 p-6 transition ${
                    selectedInterest === interest.label
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <p className="text-3xl">{interest.icon}</p>
                  <p className="mt-3 font-bold">{interest.label}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-900 transition hover:border-slate-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => selectedInterest && setStep(3)}
                disabled={!selectedInterest}
                className="flex-1 rounded-full border-2 border-slate-900 bg-slate-900 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Habits */}
        {step === 3 && selectedInterest && (
          <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div>
              <p className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-800">
                Step 2
              </p>
              <h2 className="mt-4 font-brand-display text-4xl leading-none tracking-tight text-slate-900">
                Choose 3 starter habits
              </h2>
              <p className="mt-2 text-slate-600">
                Pick from suggested habits or add your own. You can always change these later.
              </p>
            </div>

            <div className="space-y-3">
              {habitTemplates[selectedInterest]?.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => handleToggleHabit(template)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                    selectedHabits.includes(template.name)
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{template.name}</p>
                    <span className="rounded-full border px-2 py-1 text-xs font-bold">
                      {template.target}x/week
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Selected: {selectedHabits.length}/3
              </p>
              {selectedHabits.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {selectedHabits.map((habit) => (
                    <li key={habit}>✓ {habit}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-900 transition hover:border-slate-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={selectedHabits.length === 0}
                className="flex-1 rounded-full border-2 border-slate-900 bg-slate-900 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm & Complete */}
        {step === 4 && (
          <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div>
              <p className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Step 3
              </p>
              <h2 className="mt-4 font-brand-display text-4xl leading-none tracking-tight text-slate-900">
                Your compass is ready.
              </h2>
              <p className="mt-2 text-slate-600">
                Ready to log your first habits and break the chain?
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Your habits:</p>
              <ul className="mt-4 space-y-2">
                {selectedHabits.map((habit) => (
                  <li key={habit} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
                    <span className="text-emerald-600">✓</span>
                    <span className="font-semibold text-slate-900">{habit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Pro tip:</p>
              <p className="mt-1 text-sm text-amber-800">
                The most important part is logging today. It takes 30 seconds, and it builds your first streak.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-full border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-900 transition hover:border-slate-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={isCompleting}
                className="flex-1 rounded-full border-2 border-slate-900 bg-slate-900 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompleting ? "Setting up..." : "Start Tracking"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}


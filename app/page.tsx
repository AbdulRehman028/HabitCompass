import Link from "next/link";

const stats = [
  { label: "Daily consistency", value: "31-day grid" },
  { label: "Score visibility", value: "Live graph" },
  { label: "Cloud synced", value: "Per-account" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_12%_15%,#fef3c7_0,#fff7ed_26%,#f8fafc_62%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-brand-display text-2xl tracking-tight sm:text-3xl">
            HabitCompass
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-slate-900/20 bg-white/80 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black"
            >
              Start Free
            </Link>
          </div>
        </header>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
              Built for focused humans
            </p>
            <h1 className="mt-5 max-w-2xl font-brand-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Build habits that survive busy weeks.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
              HabitCompass helps you track daily actions, visualize momentum, and keep progress safe in your own
              account across devices.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:bg-black"
              >
                Create account
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-900"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="relative rounded-[28px] border border-slate-900/15 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.14)] sm:p-5">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl" />
            <div className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-900/10 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-brand-display text-2xl">Monthly Snapshot</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  On Track
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 rounded-xl bg-white p-2">
                {Array.from({ length: 28 }, (_, index) => {
                  const active = [1, 2, 4, 6, 7, 9, 10, 13, 15, 17, 19, 20, 22, 24, 26].includes(index);
                  return (
                    <div
                      key={index}
                      className={`h-6 rounded-md border ${
                        active
                          ? "border-emerald-700 bg-emerald-600"
                          : "border-slate-200 bg-white"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="mt-4 h-24 rounded-xl border border-slate-200 bg-[linear-gradient(to_top,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:100%_18px,28px_100%] p-2">
                <svg viewBox="0 0 260 80" className="h-full w-full">
                  <polyline
                    points="8,64 34,58 60,62 86,48 112,52 138,38 164,42 190,30 216,34 252,20"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
              <p className="mt-2 font-brand-display text-3xl text-slate-900">{item.value}</p>
            </article>
          ))}
        </div>

        {/* Features */}
        <section className="mt-20 space-y-6">
          <h2 className="font-brand-display text-3xl text-slate-900">Why HabitCompass</h2>
          <p className="max-w-2xl text-base text-slate-600">Small daily wins compound. HabitCompass gives you clarity, momentum, and low-friction tracking to keep habits alive.</p>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Simple Tracking</h3>
              <p className="mt-2 text-sm text-slate-600">Tap days to mark complete, missed or partial. Fast, keyboard-friendly, and mobile-first.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Visual Momentum</h3>
              <p className="mt-2 text-sm text-slate-600">See trends, streaks and score graphs so you know what’s working and when to adjust.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Cloud Sync</h3>
              <p className="mt-2 text-sm text-slate-600">Your progress saves to your Supabase account — sign in and access it across devices.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-12 space-y-6">
          <h2 className="font-brand-display text-3xl text-slate-900">How it Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-bold uppercase text-slate-500">1. Create</p>
              <p className="mt-2 text-sm text-slate-600">Add the habits you care about and set weekly targets.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-bold uppercase text-slate-500">2. Track</p>
              <p className="mt-2 text-sm text-slate-600">Tap each day as you complete the habit — the grid updates instantly.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-bold uppercase text-slate-500">3. Improve</p>
              <p className="mt-2 text-sm text-slate-600">Use insights to spot your best days and keep the chain unbroken.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-12 space-y-6">
          <h2 className="font-brand-display text-3xl text-slate-900">Trusted by focused humans</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <blockquote className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-700">“HabitCompass helped me build a morning ritual — seeing the chain made all the difference.”</p>
              <footer className="mt-3 text-xs font-bold text-slate-500">— Alex, Product Manager</footer>
            </blockquote>
            <blockquote className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-700">“The weekly insights are actionable — now I plan my week around my best days.”</p>
              <footer className="mt-3 text-xs font-bold text-slate-500">— Priya, Designer</footer>
            </blockquote>
            <blockquote className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-700">“Saved me from losing progress when I switched devices — syncing worked flawlessly.”</p>
              <footer className="mt-3 text-xs font-bold text-slate-500">— Jamal, Developer</footer>
            </blockquote>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center text-white">
          <h3 className="font-brand-display text-2xl">Start your month with momentum</h3>
          <p className="mt-2 text-sm max-w-2xl mx-auto text-slate-200">Create an account and see your progress build day by day.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/signup" className="rounded-full bg-amber-400 px-6 py-3 font-bold text-slate-900">Create account</Link>
            <Link href="/dashboard" className="rounded-full border border-white/20 px-6 py-3 font-bold">Open dashboard</Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between">
            <p className="font-brand-display text-lg">HabitCompass</p>
            <div className="text-sm text-slate-600">© {new Date().getFullYear()} HabitCompass</div>
          </div>
        </footer>
      </section>
    </main>
  );
}

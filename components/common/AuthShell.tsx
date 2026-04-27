"use client";

import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#fde68a_0,#fef3c7_28%,#f4f4f5_65%),radial-gradient(circle_at_85%_10%,#86efac_0,#d9f99d_20%,transparent_55%)] px-4 py-8 text-zinc-950 sm:px-6">
      <div className="pointer-events-none absolute left-[-120px] top-[-80px] h-72 w-72 rounded-full bg-black/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-120px] h-80 w-80 rounded-full bg-black/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-zinc-900/20 bg-white/90 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur sm:grid-cols-[1.1fr_1fr]">
          <div className="hidden bg-[linear-gradient(160deg,#18181b,#3f3f46)] p-10 text-white sm:block">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Habit Compass</p>
            <h1 className="mt-4 font-serif text-5xl leading-tight">Build the month that builds your life.</h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-zinc-300">
              Daily consistency, visual score tracking, and progress that stays with your account.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <h2 className="font-serif text-4xl leading-tight">{title}</h2>
            <p className="mt-2 text-sm font-semibold text-zinc-600">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-6 text-sm font-semibold text-zinc-600">
              {footerText}{" "}
              <Link href={footerLinkHref} className="font-bold text-zinc-900 underline decoration-2 underline-offset-4">
                {footerLinkText}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeTracker } from "@/store/trackerSlice";
import { enqueueToast } from "@/store/uiSlice";

type AppShellProps = {
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Today" },
  { href: "/overview", label: "Overview" },
  { href: "/habit-tracker", label: "Habit Tracker" },
  { href: "/insights", label: "Insights" },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const hasLoadedRemote = useAppSelector((state) => state.tracker.hasLoadedRemote);
  const isTrackerLoading = useAppSelector((state) => state.tracker.isLoading);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let active = true;

    const loadSessionUser = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!active || !session) return;

      const metadataName = session.user.user_metadata?.full_name;
      const email = session.user.email || "";
      setUserEmail(email);
      setUserName(typeof metadataName === "string" && metadataName.trim() ? metadataName.trim() : email.split("@")[0] || "Explorer");
    };

    void loadSessionUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoadedRemote || isTrackerLoading) return;

    let active = true;

    const bootstrapTracker = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!active || !session) return;
      void dispatch(initializeTracker());
    };

    void bootstrapTracker();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_IN" && session && !hasLoadedRemote && !isTrackerLoading) {
        void dispatch(initializeTracker());
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dispatch, hasLoadedRemote, isTrackerLoading]);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const { error } = await supabaseBrowser.auth.signOut({ scope: "local" });
    if (error) {
      dispatch(enqueueToast({ tone: "error", message: "Could not sign out. Please try again." }));
      setIsSigningOut(false);
      return;
    }

    dispatch(enqueueToast({ tone: "info", message: "Signed out successfully." }));
    window.location.replace("/login");
  };

  const greeting = useMemo(() => {
    if (!userName) return "Welcome";
    return `Welcome, ${userName}`;
  }, [userName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-20 lg:pb-0">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.09)] lg:flex lg:flex-col">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">HabitCompass</p>
            <h2 className="mt-2 font-brand-display text-3xl leading-none text-slate-900">{greeting}</h2>
            {userEmail && <p className="mt-2 truncate text-sm font-semibold text-slate-600">{userEmail}</p>}
          </div>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "border border-slate-900 bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full rounded-2xl border-2 border-slate-900 bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </aside>

        <div className="w-full min-w-0">{children}</div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-2 py-2 text-center text-[11px] font-bold transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

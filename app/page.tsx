"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrackerApp from "./tracker-app";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabaseBrowser";

export default function Home() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!active) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setIsCheckingSession(false);
    };

    void verifySession();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!isSupabaseConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100 px-4 py-6 text-zinc-950">
        <p className="max-w-xl text-center font-semibold">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart the app.
        </p>
      </main>
    );
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100 px-4 py-6 text-zinc-950">
        <p className="font-serif text-3xl">Loading your tracker...</p>
      </main>
    );
  }

  return <TrackerApp />;
}

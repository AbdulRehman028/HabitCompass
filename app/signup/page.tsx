"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/common/AuthShell";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabaseBrowser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (active && data.session) {
        router.replace("/");
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!isSupabaseConfigured) {
    return (
      <AuthShell
        title="Setup required"
        subtitle="Supabase keys are missing in your environment"
        footerText="Already have keys?"
        footerLinkText="Go to login"
        footerLinkHref="/login"
      >
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart Next.js.
        </p>
      </AuthShell>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: signupError } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setMessage("Account created. Please verify your email, then log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start your own habit tracker workspace"
      footerText="Already registered?"
      footerLinkText="Log in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-bold text-zinc-700" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-zinc-900"
        />

        <label className="block text-sm font-bold text-zinc-700" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-zinc-900"
        />

        <label className="block text-sm font-bold text-zinc-700" htmlFor="signup-confirm-password">
          Confirm Password
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-zinc-900"
        />

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>
        ) : null}

        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full border-2 border-zinc-900 bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </AuthShell>
  );
}

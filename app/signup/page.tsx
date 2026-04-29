"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/common/AuthShell";
import PasswordInput from "@/components/common/PasswordInput";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAppDispatch } from "@/store/hooks";
import { enqueueToast } from "@/store/uiSlice";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState("");
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
        router.replace("/dashboard");
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

    if (!fullName.trim()) {
      dispatch(enqueueToast({ tone: "error", message: "Please enter your name." }));
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      dispatch(enqueueToast({ tone: "error", message: "Password must be at least 6 characters." }));
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      dispatch(enqueueToast({ tone: "error", message: "Passwords do not match." }));
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: signupError } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signupError) {
        dispatch(enqueueToast({ tone: "error", message: signupError.message }));
        setError(signupError.message);
        return;
      }

      if (data.session) {
        dispatch(enqueueToast({ tone: "success", message: "Account created. You are now signed in." }));
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      dispatch(
        enqueueToast({
          tone: "info",
          message: "Account created. Verify your email, then log in.",
        })
      );
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
        <label className="block text-sm font-bold text-zinc-700" htmlFor="signup-fullname">
          Full Name
        </label>
        <input
          id="signup-fullname"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          autoComplete="name"
          className="w-full rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-zinc-900"
        />

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

        <PasswordInput
          id="signup-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        <PasswordInput
          id="signup-confirm-password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
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

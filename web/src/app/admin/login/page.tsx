"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { setAdminToken } from "@/lib/admin-api";
import { getApiBaseUrl } from "@/lib/api-url";

export default function AdminLoginPage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") || "").trim(),
          password: String(formData.get("password") || ""),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Sign-in failed.");
      if (result?.profile?.role !== "admin") throw new Error("This account does not have admin access.");
      if (!result?.session?.access_token) throw new Error("Authentication did not return a valid session.");
      setAdminToken(result.session.access_token);
      router.replace("/admin");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-shell flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md border border-cyan-400/20 bg-slate-950/80 p-8 shadow-[0_30px_100px_-30px_rgba(86,212,255,0.5)] backdrop-blur-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">Admin Portal</p>
          <h1 className="mt-3 text-3xl font-black text-white">Sign in</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end text-sm text-slate-400">
            <span className="text-slate-500">Admin access only</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-cyan-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <LockKeyhole className="h-4 w-4" />
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          {message && <p role="alert" className="border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-xs leading-5 text-amber-100">{message}</p>}
        </form>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-5 border-t border-slate-700 pt-5 text-center">
            <p className="text-xs text-slate-400">Need to preview the admin interface locally?</p>
            <Link href="/admin" className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 border border-slate-600 px-4 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200">
              Open local dashboard preview <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

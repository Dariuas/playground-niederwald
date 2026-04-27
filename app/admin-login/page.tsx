"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const REASON_TEXT: Record<string, string> = {
  nocookie:   "No session cookie was sent on the next request — try a different browser or disable extensions.",
  badformat:  "Session cookie format invalid — clear cookies and try again.",
  badsig:     "Session signature mismatch — NEXTAUTH_SECRET likely differs between requests or is unset.",
  expired:    "Session expired — sign in again.",
  nosecret:   "NEXTAUTH_SECRET is not set in Netlify env (or is 'dev-secret'). Add it and redeploy.",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const why = new URLSearchParams(window.location.search).get("why");
    if (why && REASON_TEXT[why]) setError(`[${why}] ${REASON_TEXT[why]}`);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-teal-600 px-8 py-8 text-center">
            <span className="text-amber-400 text-3xl select-none">★</span>
            <h1 className="text-white font-black text-xl mt-2 leading-tight">
              The Playground @niederwald
            </h1>
            <p className="text-teal-100 text-sm font-semibold tracking-widest uppercase mt-1">
              Admin Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-10">
            <h2 className="text-stone-800 font-black text-2xl mb-1 text-center">Admin Login</h2>
            <p className="text-stone-400 text-sm text-center mb-8">Enter your admin password to continue.</p>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-teal-600 hover:text-teal-700 text-sm font-semibold transition-colors">
            ← Back to The Playground website
          </a>
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("pluvino:user");
    if (raw) router.replace("/");
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      alert("Enter a valid email");
      return;
    }
    const u = { email: email.trim() };
    localStorage.setItem("pluvino:user", JSON.stringify(u));
    router.replace("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Pluvino</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl py-3 px-4 bg-slate-900 text-white font-medium hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-6 text-center">
          Mock login — stored locally for now.
        </p>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";

export default function Page() {
  // ---- State ----
  const [balance, setBalance] = useState<number>(0);

  // Fund
  const [fundOpen, setFundOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");

  // P2P
  const [transferOpen, setTransferOpen] = useState(false);
  const [to, setTo] = useState<string>("");
  const [tAmount, setTAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [pin, setPin] = useState<string>("");

  // ---- Helpers ----
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

  // ---- Handlers ----
  const handleFund = () => {
    const value = Number(amount.replace(/,/g, ""));
    if (!value || value <= 0) return alert("Enter a valid amount");
    setBalance((b) => b + value);
    setAmount("");
    setFundOpen(false);
  };

  const handleTransfer = () => {
    const value = Number(tAmount.replace(/,/g, ""));
    if (!to.trim()) return alert("Enter recipient email/username");
    if (!value || value <= 0) return alert("Enter a valid amount");
    if (value > balance) return alert("Insufficient balance");
    if (!/^\d{4}$/.test(pin)) return alert("Enter a 4-digit PIN");

    setBalance((b) => b - value);
    setTo("");
    setTAmount("");
    setNote("");
    setPin("");
    setTransferOpen(false);
  };

  // ---- UI ----
  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Pluvino — Payment Dashboard</h1>
          <div className="text-sm text-slate-600">
            Balance: <span className="font-semibold">{fmt(balance)}</span>
          </div>
        </header>

        <p className="text-slate-600">Single-page prototype with three actions.</p>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            className="px-4 py-3 rounded-xl bg-slate-900 text-white hover:opacity-90"
            onClick={() => setFundOpen(true)}
          >
            Fund
          </button>

          <button
            className="px-4 py-3 rounded-xl border hover:bg-slate-50"
            onClick={() => setTransferOpen(true)}
          >
            P2P Transfer
          </button>

          <button
            className="px-4 py-3 rounded-xl border hover:bg-slate-50"
            onClick={() => alert('Transactions drawer coming soon')}
          >
            View Transactions
          </button>
        </div>
      </div>

      {/* ------- FUND MODAL ------- */}
      {fundOpen && (
        <>
          <div className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Fund Wallet</h2>
                <button className="text-slate-500" onClick={() => setFundOpen(false)}>✕</button>
              </div>

              <label className="block text-sm text-slate-600">Amount (NGN)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                inputMode="numeric"
                placeholder="10,000"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const withCommas = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  setAmount(withCommas);
                }}
              />

              <button
                className="mt-4 w-full rounded-xl py-3 px-4 bg-slate-900 text-white hover:opacity-90"
                onClick={handleFund}
              >
                Simulate Funding
              </button>
            </div>
          </div>
        </>
      )}

      {/* ------- P2P TRANSFER MODAL ------- */}
      {transferOpen && (
        <>
          <div className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 grid place-items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">P2P Transfer</h2>
                <button className="text-slate-500" onClick={() => setTransferOpen(false)}>✕</button>
              </div>

              <label className="block text-sm text-slate-600">Recipient (email/username)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="user@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />

              <label className="block text-sm text-slate-600 mt-3">Amount (NGN)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                inputMode="numeric"
                placeholder="5,000"
                value={tAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const withCommas = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  setTAmount(withCommas);
                }}
              />

              <label className="block text-sm text-slate-600 mt-3">Note (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Lunch"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <label className="block text-sm text-slate-600 mt-3">PIN (4 digits)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
              />

              <div className="text-xs text-slate-500 mt-2">
                Available: {fmt(balance)}
              </div>

              <button
                className="mt-4 w-full rounded-xl py-3 px-4 bg-slate-900 text-white hover:opacity-90"
                onClick={handleTransfer}
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

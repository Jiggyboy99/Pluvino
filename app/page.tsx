"use client";
import { useState } from "react";

// ---- Types ----
type Transaction = {
  id: string;
  type: "fund" | "transfer";
  amount: number;
  note?: string;
  to?: string;
  date: string; // ISO
};

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

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTxns, setShowTxns] = useState(false);

  // Search
  const [q, setQ] = useState("");

  // ---- Helpers ----
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
  const parseAmt = (s: string) => Number(s.replace(/,/g, ""));
  const nowISO = () => new Date().toISOString();

  // Derived filtered list
  const filtered = transactions.filter((t) => {
    const text = `${t.type} ${t.to ?? ""} ${t.note ?? ""}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  // ---- Handlers ----
  const handleFund = () => {
    const value = parseAmt(amount);
    if (!value || value <= 0) return alert("Enter a valid amount");

    setBalance((b) => b + value);
    setTransactions((tx) => [
      { id: `txn_${Date.now()}`, type: "fund", amount: value, date: nowISO() },
      ...tx,
    ]);

    setAmount("");
    setFundOpen(false);
  };

  const handleTransfer = () => {
    const value = parseAmt(tAmount);
    if (!to.trim()) return alert("Enter recipient email/username");
    if (!value || value <= 0) return alert("Enter a valid amount");
    if (value > balance) return alert("Insufficient balance");
    if (!/^\d{4}$/.test(pin)) return alert("Enter a 4-digit PIN");

    setBalance((b) => b - value);
    setTransactions((tx) => [
      { id: `txn_${Date.now()}`, type: "transfer", amount: value, to, note, date: nowISO() },
      ...tx,
    ]);

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
            onClick={() => setShowTxns(true)}
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

              <div className="text-xs text-slate-500 mt-2">Available: {fmt(balance)}</div>

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

      {/* ------- TRANSACTIONS DRAWER ------- */}
      {showTxns && (
        <>
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowTxns(false)} />
          <div className="fixed inset-x-0 bottom-0 md:inset-0 md:grid md:place-items-center">
            <div className="md:w-[900px] md:max-w-[95vw] md:rounded-2xl bg-white shadow-2xl border border-slate-200 h-[70vh] md:h-[80vh] flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Transactions</h3>
                  <p className="text-xs text-slate-500">Recent funding and P2P activity</p>
                </div>
                <button className="text-slate-500" onClick={() => setShowTxns(false)}>✕</button>
              </div>

              {/* Search */}
              <div className="p-4 border-b">
                <input
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Search (recipient, note, type: fund/transfer)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 border-b text-slate-600">
                    <tr>
                      <th className="text-left px-4 py-2">Date</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-left px-4 py-2">Details</th>
                      <th className="text-right px-4 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                          No transactions match your search.
                        </td>
                      </tr>
                    )}
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(t.date).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 capitalize">{t.type}</td>
                        <td className="px-4 py-2">
                          {t.type === "fund" ? (
                            <span className="text-slate-700">Wallet funding</span>
                          ) : (
                            <span className="text-slate-700">
                              To <span className="font-medium">{t.to}</span>
                              {t.note ? ` — ${t.note}` : ""}
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-2 text-right font-medium ${
                            t.type === "fund" ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {t.type === "fund" ? "+" : "-"}
                          {fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

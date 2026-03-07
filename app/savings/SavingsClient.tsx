"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CurrencyAmount } from "@/app/_components/CurrencyAmount";

type SavingsClientProps = {
  initialSavings: number;
  nacionalidade?: string; // opcional
};

type Bill = { id: number; x: number; y: number; delay: number };

export function SavingsClient({
  initialSavings,
  nacionalidade,
}: SavingsClientProps) {
  const router = useRouter();
  const [savings, setSavings] = useState(initialSavings);
  const [setAmount, setSetAmount] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [settingBusy, setSettingBusy] = useState(false);
  const [addingBusy, setAddingBusy] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const billId = useRef(0);

  const triggerBills = useCallback(() => {
    const rect = addBtnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newBills: Bill[] = Array.from({ length: 6 }, (_, i) => ({
      id: billId.current++,
      x: rect.left + rect.width * 0.1 + Math.random() * rect.width * 0.8,
      y: rect.top + window.scrollY,
      delay: i * 0.12,
    }));

    setBills((prev) => [...prev, ...newBills]);

    setTimeout(() => {
      setBills((prev) =>
        prev.filter((b) => !newBills.some((nb) => nb.id === b.id)),
      );
    }, 1200);
  }, []);

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    if (!setAmount) return;
    setSettingBusy(true);
    const amount = parseFloat(setAmount);
    setSavings(amount);
    setSetAmount("");

    try {
      await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      router.refresh();
    } catch {
      router.refresh();
    } finally {
      setSettingBusy(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addAmount) return;
    setAddingBusy(true);

    const toAdd = parseFloat(addAmount);
    const newTotal = savings + toAdd;
    setSavings(newTotal);
    setAddAmount("");
    triggerBills();

    try {
      await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: newTotal }),
      });
      router.refresh();
    } catch {
      router.refresh();
    } finally {
      setAddingBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Flying bills portal — fixed to viewport */}
      {bills.map((bill) => (
        <span
          key={bill.id}
          className="bill-animate pointer-events-none fixed z-50"
          style={{
            left: `${bill.x}px`,
            top: `${bill.y}px`,
            animationDelay: `${bill.delay}s`,
          }}
        >
          <svg
            width="44"
            height="24"
            viewBox="0 0 44 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="44" height="24" fill="#16a34a" />
            <rect
              x="1"
              y="1"
              width="42"
              height="22"
              fill="none"
              stroke="#15803d"
              strokeWidth="1"
            />
            <text
              x="22"
              y="14"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontWeight="bold"
              fontSize="13"
              fontFamily="monospace"
            >
              $
            </text>
            <circle cx="8" cy="12" r="4" fill="#15803d" />
            <circle cx="36" cy="12" r="4" fill="#15803d" />
          </svg>
        </span>
      ))}

      {/* Current savings display */}
      <div className="border-4 border-black bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
        <p className="font-black text-sm uppercase tracking-widest mb-2">
          Current Savings
        </p>
        <CurrencyAmount
          amount={savings}
          nacionalidade={nacionalidade}
          className="font-black text-5xl sm:text-7xl block"
        />
      </div>

      {/* Two sections side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Set amount */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="font-black text-2xl mb-1 uppercase">Set Amount</h2>
          <p className="font-bold text-sm text-gray-600 mb-4">
            Overwrite your savings total.
          </p>
          <form onSubmit={handleSet} className="flex flex-col gap-3">
            <input
              type="number"
              placeholder="New total"
              value={setAmount}
              onChange={(e) => setSetAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              className="border-2 border-black px-4 py-3 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-black w-full"
            />
            <button
              type="submit"
              disabled={settingBusy}
              className="border-2 border-black bg-yellow-300 font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50"
            >
              {settingBusy ? "Setting..." : "Set"}
            </button>
          </form>
        </div>

        {/* Add to savings */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="font-black text-2xl mb-1 uppercase">Add to Savings</h2>
          <p className="font-bold text-sm text-gray-600 mb-4">
            Add on top of your current total.
          </p>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input
              type="number"
              placeholder="Amount to add"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              className="border-2 border-black px-4 py-3 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-black w-full"
            />
            <button
              ref={addBtnRef}
              type="submit"
              disabled={addingBusy}
              className="border-2 border-black bg-green-400 font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50"
            >
              {addingBusy ? "Adding..." : "+ Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

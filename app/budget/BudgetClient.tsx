"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CurrencyAmount } from "@/app/_components/CurrencyAmount";

type BudgetItem = {
  id: number;
  item: string;
  price: string;
};

export function BudgetClient({ initialItems }: { initialItems: BudgetItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [newItem, setNewItem] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const idCounter = useRef(-1);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price), 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim() || !newPrice) return;

    const tempId = idCounter.current--;
    const optimistic: BudgetItem = {
      id: tempId,
      item: newItem.trim(),
      price: newPrice,
    };

    // Optimistic update
    setItems((prev) => [...prev, optimistic]);
    setNewItem("");
    setNewPrice("");
    setAdding(true);

    try {
      await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: optimistic.item,
          price: parseFloat(optimistic.price),
        }),
      });
      router.refresh();
    } catch {
      // Revert on error
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await fetch("/api/budget", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch {
      // On error, router.refresh() will restore from server
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Add form */}
      <div className="border-4 border-black bg-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
        <h2 className="font-black text-2xl mb-4 uppercase">Add Item</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Item name"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            required
            className="border-2 border-black px-4 py-3 bg-white font-bold flex-1 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="number"
            placeholder="Price"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            min="0"
            step="0.01"
            required
            className="border-2 border-black px-4 py-3 bg-white font-bold w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={adding}
            className="border-2 border-black bg-green-400 font-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            + Add
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-black text-xl text-gray-500">
              No budget items yet.
            </p>
            <p className="font-bold text-gray-400 mt-1">
              Add your first item above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-black bg-pink-400">
                  <th className="text-left font-black text-sm uppercase px-6 py-4 tracking-wide">
                    Item
                  </th>
                  <th className="text-right font-black text-sm uppercase px-6 py-4 tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-4 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b-2 border-black ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-4 font-bold text-base">
                      {item.item}
                    </td>
                    <td className="px-6 py-4 font-bold text-right">
                      <CurrencyAmount amount={parseFloat(item.price)} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="border-2 border-black bg-pink-400 font-black px-3 py-1 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total */}
        <div className="border-t-4 border-black bg-yellow-300 px-6 py-4 flex items-center justify-between">
          <span className="font-black text-lg uppercase tracking-wide">
            Total
          </span>
          <CurrencyAmount amount={total} className="font-black text-2xl" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Card = {
  id: number;
  status: string;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

const COLUMNS = [
  { id: "to-do", label: "TO DO", color: "bg-blue-400" },
  { id: "doing", label: "DOING", color: "bg-yellow-300" },
  { id: "done", label: "DONE", color: "bg-green-400" },
];

const ROTATIONS = [
  "rotate-[-1deg]",
  "rotate-[0.5deg]",
  "rotate-[-0.5deg]",
  "rotate-[1deg]",
  "rotate-0",
];

type ModalState =
  | { type: "add"; status: string }
  | { type: "edit"; card: Card }
  | null;

export function KanbanClient({ initialCards }: { initialCards: Card[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [modal, setModal] = useState<ModalState>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState("to-do");
  const [saving, setSaving] = useState(false);
  const tempId = useRef(-1);

  function openAdd(status: string) {
    setFormTitle("");
    setFormDesc("");
    setFormStatus(status);
    setModal({ type: "add", status });
  }

  function openEdit(card: Card) {
    setFormTitle(card.title ?? "");
    setFormDesc(card.description ?? "");
    setFormStatus(card.status);
    setModal({ type: "edit", card });
  }

  function closeModal() {
    setModal(null);
  }

  async function handleSave() {
    if (!formTitle.trim()) return;
    setSaving(true);

    if (modal?.type === "add") {
      const tid = tempId.current--;
      const optimistic: Card = {
        id: tid,
        status: formStatus,
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCards((prev) => [...prev, optimistic]);
      closeModal();

      try {
        const res = await fetch("/api/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle.trim(),
            description: formDesc.trim() || null,
            status: formStatus,
          }),
        });
        const real = await res.json();
        setCards((prev) =>
          prev.map((c) =>
            c.id === tid
              ? {
                  ...real,
                  createdAt: new Date(real.createdAt).toISOString(),
                  updatedAt: new Date(real.updatedAt).toISOString(),
                }
              : c
          )
        );
      } catch {
        setCards((prev) => prev.filter((c) => c.id !== tid));
      }
    } else if (modal?.type === "edit") {
      const { card } = modal;
      setCards((prev) =>
        prev.map((c) =>
          c.id === card.id
            ? {
                ...c,
                title: formTitle.trim(),
                description: formDesc.trim() || null,
                status: formStatus,
              }
            : c
        )
      );
      closeModal();

      try {
        await fetch("/api/kanban", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: card.id,
            title: formTitle.trim(),
            description: formDesc.trim() || null,
            status: formStatus,
          }),
        });
      } catch {
        router.refresh();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: number) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    closeModal();

    try {
      await fetch("/api/kanban", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      router.refresh();
    }
  }

  function handleDragStart(e: React.DragEvent, id: number) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverCol(null);
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) setDragOverCol(colId);
  }

  function handleDragLeave(e: React.DragEvent) {
    const related = e.relatedTarget as HTMLElement | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverCol(null);
    }
  }

  async function handleDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedId === null) return;

    const card = cards.find((c) => c.id === draggedId);
    if (!card || card.status === colId) {
      setDraggedId(null);
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === draggedId ? { ...c, status: colId } : c))
    );
    const id = draggedId;
    setDraggedId(null);

    try {
      await fetch("/api/kanban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: colId }),
      });
    } catch {
      router.refresh();
    }
  }

  function colCards(colId: string) {
    return cards.filter((c) => c.status === colId);
  }

  return (
    <>
      <div className="flex gap-4 px-4 sm:px-6 py-6 min-w-[700px] min-h-full items-start">
        {COLUMNS.map((col) => {
          const colList = colCards(col.id);
          const isOver = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              className={`flex flex-col flex-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 ${isOver ? "scale-[1.01] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : ""}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div
                className={`${col.color} border-b-4 border-black px-4 py-3 flex items-center justify-between shrink-0`}
              >
                <h2 className="font-black text-xl uppercase tracking-wide">
                  {col.label}
                </h2>
                <span className="font-black text-sm border-2 border-black bg-white w-7 h-7 flex items-center justify-center">
                  {colList.length}
                </span>
              </div>

              {/* Cards */}
              <div
                className={`flex-1 bg-white p-3 flex flex-col gap-3 min-h-[200px] transition-colors ${isOver ? "bg-gray-50" : ""}`}
              >
                {colList.map((card, idx) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onDragEnd={handleDragEnd}
                    className={`relative bg-yellow-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 transition-all duration-100
                      ${ROTATIONS[idx % ROTATIONS.length]}
                      ${draggedId === card.id ? "opacity-40 scale-95" : "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing"}`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(card.id);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center border border-black bg-white font-black text-xs leading-none hover:bg-pink-400 transition-colors"
                    >
                      ×
                    </button>

                    {/* Card body — click to edit */}
                    <div onClick={() => openEdit(card)} className="pr-5 cursor-pointer">
                      {card.title && (
                        <p className="font-black text-sm leading-tight mb-1">
                          {card.title}
                        </p>
                      )}
                      {card.description && (
                        <p className="font-bold text-xs text-gray-600 leading-tight whitespace-pre-wrap">
                          {card.description}
                        </p>
                      )}
                      {!card.title && !card.description && (
                        <p className="font-bold text-xs text-gray-400 italic">
                          Empty card
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add card button */}
                <button
                  onClick={() => openAdd(col.id)}
                  className="border-2 border-dashed border-black font-bold text-sm py-2 hover:bg-yellow-100 transition-colors text-gray-500 mt-auto"
                >
                  + Add card
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="border-b-4 border-black bg-yellow-300 px-6 py-4 flex items-center justify-between">
              <h2 className="font-black text-xl uppercase">
                {modal.type === "add" ? "New Card" : "Edit Card"}
              </h2>
              <button
                onClick={closeModal}
                className="font-black text-2xl leading-none hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="font-black text-sm uppercase block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") closeModal();
                  }}
                  autoFocus
                  className="w-full border-2 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Card title..."
                />
              </div>

              <div>
                <label className="font-black text-sm uppercase block mb-1">
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="font-black text-sm uppercase block mb-1">
                  Column
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full border-2 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                {modal.type === "edit" && (
                  <button
                    onClick={() => handleDelete(modal.card.id)}
                    className="border-2 border-black bg-pink-400 font-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="border-2 border-black bg-white font-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ml-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formTitle.trim()}
                  className="border-2 border-black bg-green-400 font-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

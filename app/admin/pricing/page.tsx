"use client";

import { useEffect, useState } from "react";

type PavilionConfig = {
  pavilionId: string;
  name: string;
  capacity: number;
  firstHourPriceCents: number;
  addHourPriceCents: number;
  isActive: boolean;
  updatedAt: string | null;
};

type EditState = {
  firstHour: string;
  addHour: string;
  isActive: boolean;
  capacity: string;
};

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

function displayToCents(val: string): number {
  const n = parseFloat(val);
  if (isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export default function AdminPricingPage() {
  const [pavilions, setPavilions] = useState<PavilionConfig[]>([]);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/pavilions");
        if (!res.ok) throw new Error("Failed to load pavilion configs.");
        const data = await res.json();
        const pavs: PavilionConfig[] = data.pavilions ?? [];
        setPavilions(pavs);
        // Initialize edit state from DB values
        const initial: Record<string, EditState> = {};
        for (const p of pavs) {
          initial[p.pavilionId] = {
            firstHour: centsToDisplay(p.firstHourPriceCents),
            addHour: centsToDisplay(p.addHourPriceCents),
            isActive: p.isActive,
            capacity: String(p.capacity),
          };
        }
        setEdits(initial);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (
    id: string,
    field: keyof EditState,
    value: string | boolean
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    // Clear saved indicator when editing
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const handleSave = async (pavilionId: string) => {
    const edit = edits[pavilionId];
    if (!edit) return;

    setSaving((prev) => ({ ...prev, [pavilionId]: true }));
    try {
      const capacityNum = parseInt(edit.capacity, 10);
      const res = await fetch(`/api/admin/pavilions/${pavilionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstHourPriceCents: displayToCents(edit.firstHour),
          addHourPriceCents: displayToCents(edit.addHour),
          isActive: edit.isActive,
          ...(isNaN(capacityNum) ? {} : { capacity: capacityNum }),
        }),
      });
      if (!res.ok) throw new Error("Save failed.");
      setSaved((prev) => ({ ...prev, [pavilionId]: true }));
      // Update local state
      setPavilions((prev) =>
        prev.map((p) =>
          p.pavilionId === pavilionId
            ? {
                ...p,
                firstHourPriceCents: displayToCents(edit.firstHour),
                addHourPriceCents: displayToCents(edit.addHour),
                isActive: edit.isActive,
                capacity: isNaN(capacityNum) ? p.capacity : capacityNum,
              }
            : p
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving((prev) => ({ ...prev, [pavilionId]: false }));
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">
          Management
        </p>
        <h1 className="text-3xl font-black text-stone-800">Pavilion Pricing</h1>
        <p className="text-stone-500 text-sm mt-1">
          Edit prices and active status for each pavilion. Changes take effect immediately.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-stone-400 font-semibold">
          Loading pavilion configs...
        </div>
      ) : error ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-red-600 font-semibold">
          {error}
        </div>
      ) : (
        <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_140px_140px_100px_120px] gap-4 px-6 py-3 bg-stone-50 border-b border-amber-100 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Pavilion</span>
            <span>Capacity</span>
            <span>First Hour ($)</span>
            <span>Add&apos;l Hour ($)</span>
            <span>Active</span>
            <span></span>
          </div>

          <div className="divide-y divide-amber-50">
            {pavilions.map((pav) => {
              const edit = edits[pav.pavilionId];
              if (!edit) return null;
              const isSaving = saving[pav.pavilionId] ?? false;
              const isSaved = saved[pav.pavilionId] ?? false;

              return (
                <div
                  key={pav.pavilionId}
                  className="grid grid-cols-[1fr_1fr_140px_140px_100px_120px] gap-4 items-center px-6 py-4 hover:bg-amber-50/40 transition-colors"
                >
                  {/* Name */}
                  <div>
                    <p className="font-black text-stone-800">{pav.name}</p>
                    <p className="text-xs text-stone-400 font-mono">{pav.pavilionId}</p>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={edit.capacity}
                      onChange={(e) =>
                        handleChange(pav.pavilionId, "capacity", e.target.value)
                      }
                      className="w-20 px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <span className="text-xs text-stone-400">guests</span>
                  </div>

                  {/* First hour price */}
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={edit.firstHour}
                        onChange={(e) =>
                          handleChange(pav.pavilionId, "firstHour", e.target.value)
                        }
                        className="w-full pl-7 pr-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Additional hour price */}
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={edit.addHour}
                        onChange={(e) =>
                          handleChange(pav.pavilionId, "addHour", e.target.value)
                        }
                        className="w-full pl-7 pr-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        handleChange(pav.pavilionId, "isActive", !edit.isActive)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        edit.isActive ? "bg-teal-600" : "bg-stone-200"
                      }`}
                      aria-label={`Toggle ${pav.name} active`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          edit.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`ml-2 text-xs font-bold ${
                        edit.isActive ? "text-teal-700" : "text-stone-400"
                      }`}
                    >
                      {edit.isActive ? "On" : "Off"}
                    </span>
                  </div>

                  {/* Save button */}
                  <div>
                    <button
                      onClick={() => handleSave(pav.pavilionId)}
                      disabled={isSaving}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all w-full ${
                        isSaved
                          ? "bg-green-100 text-green-700"
                          : "bg-teal-700 text-white hover:bg-teal-600"
                      } disabled:opacity-50`}
                    >
                      {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-stone-400">
              Prices are entered in dollars. Inactive pavilions will not appear on the public booking page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

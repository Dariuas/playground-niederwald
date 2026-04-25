"use client";

import { useEffect, useState } from "react";

type PavilionData = {
  pavilionId: string;
  name: string;
  defaultName: string;
  defaultDescription: string;
  defaultFeatures: string[];
  defaultMapX: number;
  defaultMapY: number;
  nameOverride: string | null;
  descriptionOverride: string | null;
  featuresOverride: string[] | null;
  mapX: number | null;
  mapY: number | null;
};

type EditState = {
  name: string;
  description: string;
  features: string; // newline-separated
  mapX: string;
  mapY: string;
};

export default function AdminPavilionsPage() {
  const [pavilions, setPavilions] = useState<PavilionData[]>([]);
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
        if (!res.ok) throw new Error("Failed to load pavilion data.");
        const data = await res.json();
        const pavs: PavilionData[] = data.pavilions ?? [];
        setPavilions(pavs);
        // Initialize edit state from current effective values (override if set, else default)
        const initial: Record<string, EditState> = {};
        for (const p of pavs) {
          initial[p.pavilionId] = {
            name: p.nameOverride ?? p.defaultName,
            description: p.descriptionOverride ?? p.defaultDescription,
            features: (p.featuresOverride ?? p.defaultFeatures).join("\n"),
            mapX: p.mapX !== null ? String(p.mapX) : String(p.defaultMapX),
            mapY: p.mapY !== null ? String(p.mapY) : String(p.defaultMapY),
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
    value: string
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const handleSave = async (pavilionId: string) => {
    const edit = edits[pavilionId];
    if (!edit) return;

    const pav = pavilions.find((p) => p.pavilionId === pavilionId);
    if (!pav) return;

    setSaving((prev) => ({ ...prev, [pavilionId]: true }));
    try {
      const mapXNum = parseFloat(edit.mapX);
      const mapYNum = parseFloat(edit.mapY);
      const featuresArr = edit.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      // Determine whether each field is an override or should be cleared back to default
      const nameOverride =
        edit.name.trim() !== pav.defaultName ? edit.name.trim() : null;
      const descriptionOverride =
        edit.description.trim() !== pav.defaultDescription
          ? edit.description.trim()
          : null;
      const defaultFeaturesJoined = pav.defaultFeatures.join("\n");
      const featuresOverride =
        featuresArr.join("\n") !== defaultFeaturesJoined ? featuresArr : null;
      const mapXOverride =
        !isNaN(mapXNum) && mapXNum !== pav.defaultMapX ? mapXNum : null;
      const mapYOverride =
        !isNaN(mapYNum) && mapYNum !== pav.defaultMapY ? mapYNum : null;

      const res = await fetch(`/api/admin/pavilions/${pavilionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameOverride,
          descriptionOverride,
          featuresOverride,
          mapX: mapXOverride,
          mapY: mapYOverride,
        }),
      });
      if (!res.ok) throw new Error("Save failed.");
      setSaved((prev) => ({ ...prev, [pavilionId]: true }));
      // Update local state to reflect saved overrides
      setPavilions((prev) =>
        prev.map((p) =>
          p.pavilionId === pavilionId
            ? {
                ...p,
                nameOverride,
                descriptionOverride,
                featuresOverride,
                mapX: mapXOverride,
                mapY: mapYOverride,
                name: nameOverride ?? p.defaultName,
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

  const handleReset = async (pavilionId: string) => {
    const pav = pavilions.find((p) => p.pavilionId === pavilionId);
    if (!pav) return;

    if (
      !confirm(
        `Reset ${pav.defaultName} to all static defaults? This will clear any custom name, description, features, and map position.`
      )
    )
      return;

    setSaving((prev) => ({ ...prev, [pavilionId]: true }));
    try {
      const res = await fetch(`/api/admin/pavilions/${pavilionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameOverride: null,
          descriptionOverride: null,
          featuresOverride: null,
          mapX: null,
          mapY: null,
        }),
      });
      if (!res.ok) throw new Error("Reset failed.");
      setSaved((prev) => ({ ...prev, [pavilionId]: true }));
      setPavilions((prev) =>
        prev.map((p) =>
          p.pavilionId === pavilionId
            ? {
                ...p,
                nameOverride: null,
                descriptionOverride: null,
                featuresOverride: null,
                mapX: null,
                mapY: null,
              }
            : p
        )
      );
      setEdits((prev) => ({
        ...prev,
        [pavilionId]: {
          name: pav.defaultName,
          description: pav.defaultDescription,
          features: pav.defaultFeatures.join("\n"),
          mapX: String(pav.defaultMapX),
          mapY: String(pav.defaultMapY),
        },
      }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Reset failed.");
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
        <h1 className="text-3xl font-black text-stone-800">Map &amp; Pavilions</h1>
        <p className="text-stone-500 text-sm mt-1">
          Edit pavilion names, descriptions, features, and map marker positions. Changes take effect immediately.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-stone-400 font-semibold">
          Loading pavilion data...
        </div>
      ) : error ? (
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-10 text-center text-red-600 font-semibold">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {pavilions.map((pav) => {
            const edit = edits[pav.pavilionId];
            if (!edit) return null;
            const isSaving = saving[pav.pavilionId] ?? false;
            const isSaved = saved[pav.pavilionId] ?? false;
            const hasOverrides =
              pav.nameOverride !== null ||
              pav.descriptionOverride !== null ||
              pav.featuresOverride !== null ||
              pav.mapX !== null ||
              pav.mapY !== null;

            return (
              <div
                key={pav.pavilionId}
                className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div className="px-6 py-4 bg-stone-50 border-b border-amber-100 flex items-center justify-between">
                  <div>
                    <p className="font-black text-stone-800 text-lg">{pav.name}</p>
                    <p className="text-xs text-stone-400 font-mono">{pav.pavilionId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasOverrides && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Customized
                      </span>
                    )}
                    {hasOverrides && (
                      <button
                        onClick={() => handleReset(pav.pavilionId)}
                        disabled={isSaving}
                        className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        Reset to defaults
                      </button>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Name
                        {pav.nameOverride !== null && (
                          <span className="ml-2 text-amber-500 normal-case font-normal">
                            (overriding &ldquo;{pav.defaultName}&rdquo;)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={edit.name}
                        onChange={(e) =>
                          handleChange(pav.pavilionId, "name", e.target.value)
                        }
                        placeholder={pav.defaultName}
                        className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-semibold text-stone-700 focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={edit.description}
                        onChange={(e) =>
                          handleChange(pav.pavilionId, "description", e.target.value)
                        }
                        placeholder={pav.defaultDescription}
                        className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Features{" "}
                        <span className="text-stone-400 normal-case font-normal">
                          — one per line
                        </span>
                      </label>
                      <textarea
                        rows={5}
                        value={edit.features}
                        onChange={(e) =>
                          handleChange(pav.pavilionId, "features", e.target.value)
                        }
                        placeholder={pav.defaultFeatures.join("\n")}
                        className="w-full px-3 py-2 border-2 border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-teal-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    {/* Map position */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                        Map Marker Position
                      </label>
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-stone-500 w-16">
                            X (left %)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={edit.mapX}
                            onChange={(e) =>
                              handleChange(pav.pavilionId, "mapX", e.target.value)
                            }
                            className="w-28 px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:border-teal-500 transition-colors"
                          />
                          <span className="text-xs text-stone-400">
                            default: {pav.defaultMapX}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-stone-500 w-16">
                            Y (top %)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={edit.mapY}
                            onChange={(e) =>
                              handleChange(pav.pavilionId, "mapY", e.target.value)
                            }
                            className="w-28 px-3 py-2 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-700 focus:outline-none focus:border-teal-500 transition-colors"
                          />
                          <span className="text-xs text-stone-400">
                            default: {pav.defaultMapY}%
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Position is a percentage of the map image dimensions (0–100). The marker is centered on this point.
                        </p>
                      </div>
                    </div>

                    {/* Current effective values summary */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        Currently Live
                      </p>
                      <p className="text-sm font-black text-stone-800">{pav.name}</p>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {pav.descriptionOverride ?? pav.defaultDescription}
                      </p>
                      <ul className="mt-2 space-y-0.5">
                        {(pav.featuresOverride ?? pav.defaultFeatures).map(
                          (f, i) => (
                            <li key={i} className="text-xs text-teal-700 font-semibold">
                              ✓ {f}
                            </li>
                          )
                        )}
                      </ul>
                      <p className="text-xs text-stone-400 mt-2">
                        Map: X={pav.mapX ?? pav.defaultMapX}% · Y={pav.mapY ?? pav.defaultMapY}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-6 py-4 bg-stone-50 border-t border-amber-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleSave(pav.pavilionId)}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                      isSaved
                        ? "bg-green-100 text-green-700"
                        : "bg-teal-700 text-white hover:bg-teal-600"
                    } disabled:opacity-50`}
                  >
                    {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

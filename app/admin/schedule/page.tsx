"use client";

import { useEffect, useState, useCallback } from "react";
import { pavilions } from "@/data/pavilions";

const DAYS = [
  { label: "Sunday",    short: "Sun", dow: 0 },
  { label: "Monday",    short: "Mon", dow: 1 },
  { label: "Tuesday",   short: "Tue", dow: 2 },
  { label: "Wednesday", short: "Wed", dow: 3 },
  { label: "Thursday",  short: "Thu", dow: 4 },
  { label: "Friday",    short: "Fri", dow: 5 },
  { label: "Saturday",  short: "Sat", dow: 6 },
];

type DayConfig = {
  isAvailable: boolean;
  firstHour: string;  // "" = use default, "0" = free
  addHour: string;
};

type PavilionSchedule = Record<number, DayConfig>;
type FullSchedule = Record<string, PavilionSchedule>;
type Defaults = Record<string, { firstHourCents: number; addHourCents: number }>;

function centsToStr(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2);
}

function initSchedule(
  serverSchedule: Record<string, Record<number, { isAvailable: boolean; firstHourCents: number | null; addHourCents: number | null }>>,
  defaults: Defaults
): FullSchedule {
  const out: FullSchedule = {};
  for (const p of pavilions) {
    out[p.id] = {};
    for (const { dow } of DAYS) {
      const row = serverSchedule[p.id]?.[dow];
      out[p.id][dow] = {
        isAvailable: row ? row.isAvailable : true,
        firstHour:   row ? centsToStr(row.firstHourCents) : "",
        addHour:     row ? centsToStr(row.addHourCents) : "",
      };
    }
  }
  return out;
}

// ── Day Cell ──────────────────────────────────────────────────────────────────

function DayCell({
  day,
  config,
  defaultFirstHour,
  defaultAddHour,
  onChange,
}: {
  day: typeof DAYS[number];
  config: DayConfig;
  defaultFirstHour: string;
  defaultAddHour: string;
  onChange: (c: DayConfig) => void;
}) {
  const isFree = config.firstHour === "0" || config.firstHour === "0.00";

  return (
    <div className={`rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${
      config.isAvailable
        ? isFree
          ? "border-green-300 bg-green-50"
          : "border-teal-200 bg-white"
        : "border-stone-200 bg-stone-50 opacity-70"
    }`}>
      {/* Day header + toggle */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-black uppercase tracking-widest ${
          config.isAvailable ? (isFree ? "text-green-700" : "text-stone-700") : "text-stone-400"
        }`}>
          {day.short}
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...config, isAvailable: !config.isAvailable })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            config.isAvailable ? (isFree ? "bg-green-500" : "bg-teal-600") : "bg-stone-300"
          }`}
          aria-label={`Toggle ${day.label}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            config.isAvailable ? "translate-x-4" : "translate-x-0.5"
          }`} />
        </button>
      </div>

      {/* Status label */}
      {!config.isAvailable && (
        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider text-center">Closed</span>
      )}

      {config.isAvailable && (
        <>
          {isFree && (
            <span className="text-[10px] text-green-700 font-black uppercase tracking-wider text-center bg-green-100 rounded-full py-0.5">
              FREE
            </span>
          )}

          {/* First hour */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
              1st hr
            </label>
            <div className="relative">
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.firstHour}
                onChange={(e) => onChange({ ...config, firstHour: e.target.value })}
                placeholder={defaultFirstHour}
                className="w-full pl-4 pr-1 py-1 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:border-teal-400 bg-white"
              />
            </div>
          </div>

          {/* Add'l hour */}
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
              +hr
            </label>
            <div className="relative">
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.addHour}
                onChange={(e) => onChange({ ...config, addHour: e.target.value })}
                placeholder={defaultAddHour}
                className="w-full pl-4 pr-1 py-1 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:border-teal-400 bg-white"
              />
            </div>
          </div>

          <p className="text-[9px] text-stone-400 text-center leading-tight">
            blank = default
          </p>
        </>
      )}
    </div>
  );
}

// ── Pavilion Row ──────────────────────────────────────────────────────────────

function PavilionRow({
  pavilion,
  schedule,
  defaults,
  onChange,
  onSave,
  saving,
  saved,
}: {
  pavilion: typeof pavilions[number];
  schedule: PavilionSchedule;
  defaults: { firstHourCents: number; addHourCents: number };
  onChange: (dow: number, config: DayConfig) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const defFirst = (defaults.firstHourCents / 100).toFixed(2);
  const defAdd   = (defaults.addHourCents   / 100).toFixed(2);

  const openDays = DAYS.filter(({ dow }) => schedule[dow]?.isAvailable).length;
  const freeDays = DAYS.filter(({ dow }) => {
    const c = schedule[dow];
    return c?.isAvailable && (c.firstHour === "0" || c.firstHour === "0.00");
  }).length;

  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-amber-100">
        <div>
          <h3 className="font-black text-stone-800">{pavilion.name}</h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Default: <span className="font-bold">${defFirst}/hr</span> · <span className="font-bold">${defAdd}/hr after</span>
            <span className="ml-3 text-stone-500">{openDays}/7 days open{freeDays > 0 ? ` · ${freeDays} free` : ""}</span>
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-teal-700 text-white hover:bg-teal-600"
          } disabled:opacity-50`}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      {/* Day grid */}
      <div className="p-4 grid grid-cols-7 gap-2">
        {DAYS.map(({ dow, label }) => (
          <DayCell
            key={dow}
            day={DAYS[dow]}
            config={schedule[dow] ?? { isAvailable: true, firstHour: "", addHour: "" }}
            defaultFirstHour={defFirst}
            defaultAddHour={defAdd}
            onChange={(c) => onChange(dow, c)}
          />
        ))}
      </div>

      {/* Quick-set row */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        <span className="text-xs text-stone-400 font-bold self-center mr-1">Quick set:</span>
        <button type="button" onClick={() => {
          DAYS.forEach(({ dow }) => onChange(dow, { isAvailable: true, firstHour: "", addHour: "" }));
        }} className="text-xs px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 font-semibold hover:bg-teal-100 transition-colors">
          Open all days (default prices)
        </button>
        <button type="button" onClick={() => {
          DAYS.forEach(({ dow }) => onChange(dow, { isAvailable: true, firstHour: "0", addHour: "0" }));
        }} className="text-xs px-3 py-1 rounded-lg bg-green-50 border border-green-200 text-green-700 font-semibold hover:bg-green-100 transition-colors">
          All days FREE
        </button>
        <button type="button" onClick={() => {
          [0, 6].forEach((dow) => onChange(dow, { ...(schedule[dow] ?? { isAvailable: false, firstHour: "", addHour: "" }), isAvailable: false }));
          [1,2,3,4,5].forEach((dow) => onChange(dow, { ...(schedule[dow] ?? { isAvailable: true, firstHour: "", addHour: "" }), isAvailable: true }));
        }} className="text-xs px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition-colors">
          Weekdays only
        </button>
        <button type="button" onClick={() => {
          [1,2,3].forEach((dow) => onChange(dow, { isAvailable: true, firstHour: "0", addHour: "0" }));
          [4,5].forEach((dow) => onChange(dow, { ...(schedule[dow] ?? { isAvailable: true, firstHour: "", addHour: "" }) }));
          [0,6].forEach((dow) => onChange(dow, { ...(schedule[dow] ?? { isAvailable: false, firstHour: "", addHour: "" }), isAvailable: false }));
        }} className="text-xs px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-semibold hover:bg-purple-100 transition-colors">
          Mon–Wed free
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSchedulePage() {
  const [schedule, setSchedule] = useState<FullSchedule>({});
  const [defaults, setDefaults] = useState<Defaults>({});
  const [loading, setLoading]   = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved,  setSaved]  = useState<Record<string, boolean>>({});

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/admin/schedule");
    const data = await res.json();
    setDefaults(data.defaults ?? {});
    if (data.tableError) setTableError(data.tableError);
    setSchedule(initSchedule(data.schedule ?? {}, data.defaults ?? {}));
    setLoading(false);
  }, []);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  function updateDay(pavilionId: string, dow: number, config: DayConfig) {
    setSchedule((prev) => ({
      ...prev,
      [pavilionId]: { ...prev[pavilionId], [dow]: config },
    }));
    setSaved((prev) => ({ ...prev, [pavilionId]: false }));
  }

  async function savePavilion(pavilionId: string) {
    setSaving((prev) => ({ ...prev, [pavilionId]: true }));
    const pavSchedule = schedule[pavilionId] ?? {};

    const updates = DAYS.map(({ dow }) => {
      const c = pavSchedule[dow] ?? { isAvailable: true, firstHour: "", addHour: "" };
      const toNullableCents = (s: string) => {
        if (s === "" || s === null) return null;
        const n = parseFloat(s);
        return isNaN(n) ? null : Math.round(n * 100);
      };
      return {
        pavilionId,
        dayOfWeek:      dow,
        isAvailable:    c.isAvailable,
        firstHourCents: toNullableCents(c.firstHour),
        addHourCents:   toNullableCents(c.addHour),
      };
    });

    const res  = await fetch("/api/admin/schedule", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ updates }),
    });
    const data = await res.json();

    setSaving((prev) => ({ ...prev, [pavilionId]: false }));
    if (data.ok) {
      setSaved((prev) => ({ ...prev, [pavilionId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [pavilionId]: false })), 3000);
    } else {
      alert(data.error ?? "Failed to save schedule.");
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Management</p>
        <h1 className="text-3xl font-black text-stone-800">Schedule &amp; Availability</h1>
        <p className="text-stone-500 text-sm mt-1">
          Control which days each pavilion is open and set day-specific pricing. Leave price blank to use the pavilion&apos;s default rate.
        </p>
      </div>

      {/* Supabase table setup notice */}
      {tableError && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <h3 className="font-black text-amber-800 mb-2">⚠ Database table not set up yet</h3>
          <p className="text-amber-700 text-sm mb-3">
            Run this SQL in your Supabase dashboard (SQL Editor) to enable schedule management:
          </p>
          <pre className="bg-amber-100 rounded-xl p-4 text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap">
{`create table pavilion_schedule (
  id uuid default gen_random_uuid() primary key,
  pavilion_id text not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  is_available boolean not null default true,
  first_hour_price_cents integer default null,
  add_hour_price_cents integer default null,
  updated_at timestamptz default now(),
  unique(pavilion_id, day_of_week)
);`}
          </pre>
          <p className="text-amber-700 text-xs mt-2">After running it, refresh this page.</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center text-stone-400">
          <span className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          Loading schedule…
        </div>
      ) : (
        <div className="space-y-5">
          {pavilions.map((p) => (
            <PavilionRow
              key={p.id}
              pavilion={p}
              schedule={schedule[p.id] ?? {}}
              defaults={defaults[p.id] ?? { firstHourCents: p.firstHourPrice * 100, addHourCents: p.additionalHourPrice * 100 }}
              onChange={(dow, config) => updateDay(p.id, dow, config)}
              onSave={() => savePavilion(p.id)}
              saving={saving[p.id] ?? false}
              saved={saved[p.id] ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

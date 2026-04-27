"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Script from "next/script";
import { Pavilion } from "@/data/pavilions";
import { addons as ADDON_CATALOG } from "@/data/products";

const SQUARE_APP_ID      = process.env.NEXT_PUBLIC_SQUARE_APP_ID ?? "";
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
const SQUARE_ENV         = process.env.NEXT_PUBLIC_SQUARE_ENV ?? "sandbox";
const SQUARE_SCRIPT      = SQUARE_ENV === "production"
  ? "https://web.squarecdn.com/v1/square.js"
  : "https://sandbox.web.squarecdn.com/v1/square.js";

const DURATIONS = [1, 2, 3, 4, 6, 8];

type Step       = "schedule" | "details" | "extras" | "payment" | "confirmed";
type AvailState = "idle" | "checking" | "available" | "conflict" | "error";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toMinDate() {
  const earliest = new Date("2026-05-16");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  return (tomorrow > earliest ? tomorrow : earliest).toISOString().split("T")[0];
}
function toMaxDate() {
  const d = new Date(); d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}
function inputCls() {
  return "w-full border-2 border-amber-100 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white";
}

interface Props { pavilion: Pavilion; onClose: () => void; }

export default function ReservationModal({ pavilion, onClose }: Props) {
  const [step, setStep] = useState<Step>("schedule");

  // ── Live pricing (falls back to static data) ──
  const [firstHourPrice,      setFirstHourPrice]      = useState(pavilion.firstHourPrice);
  const [additionalHourPrice, setAdditionalHourPrice] = useState(pavilion.additionalHourPrice);

  useEffect(() => {
    fetch("/api/pavilions")
      .then((r) => r.json())
      .then((list: { id: string; firstHourPrice: number; additionalHourPrice: number }[]) => {
        const match = list.find((p) => p.id === pavilion.id);
        if (match) {
          setFirstHourPrice(match.firstHourPrice);
          setAdditionalHourPrice(match.additionalHourPrice);
        }
      })
      .catch(() => {/* keep static fallback */});
  }, [pavilion.id]);

  // ── Schedule ──
  const [date,     setDate]     = useState("");
  const [time,     setTime]     = useState("10:00");
  const [duration, setDuration] = useState(2);
  const [avail,    setAvail]    = useState<AvailState>("idle");
  const [availMsg, setAvailMsg] = useState("");

  // ── Details ──
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [partySize, setPartySize] = useState("");

  // ── Extras (add-on quantities keyed by addon id) ──
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});

  // ── Payment (Square) ──
  const cardRef        = useRef<HTMLDivElement>(null);
  const cardInstance   = useRef<unknown>(null);
  const [sdkReady,    setSdkReady]    = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [processing,  setProcessing]  = useState(false);
  const [payError,    setPayError]    = useState<string | null>(null);

  // ── Confirmed ──
  const [reservationId, setReservationId] = useState("");

  // Per-day pricing — Mon/Tue/Wed override (typically free)
  const { effectiveFirstHour, effectiveAddHour, isFreeDay, dayLabel } = useMemo(() => {
    if (!date) return { effectiveFirstHour: firstHourPrice, effectiveAddHour: additionalHourPrice, isFreeDay: false, dayLabel: "" };
    const d = new Date(date + "T12:00:00");
    const dow = d.getDay();
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dp = pavilion.schedule.dayPricing[dow];
    if (dp) {
      return { effectiveFirstHour: dp.firstHour, effectiveAddHour: dp.addHour, isFreeDay: dp.firstHour === 0 && dp.addHour === 0, dayLabel: labels[dow] };
    }
    return { effectiveFirstHour: firstHourPrice, effectiveAddHour: additionalHourPrice, isFreeDay: false, dayLabel: labels[dow] };
  }, [date, firstHourPrice, additionalHourPrice, pavilion.schedule.dayPricing]);

  const pavilionTotal = effectiveFirstHour + Math.max(0, duration - 1) * effectiveAddHour;

  const addonLines = useMemo(
    () =>
      ADDON_CATALOG
        .map((a) => ({ ...a, qty: addonQty[a.id] ?? 0 }))
        .filter((l) => l.qty > 0),
    [addonQty]
  );
  const addonTotal = addonLines.reduce((sum, l) => sum + (l.price / 100) * l.qty, 0);
  const total = pavilionTotal + addonTotal;

  // Block dates the pavilion is closed (selecting a closed day on the date picker → reset)
  const dayOpen = date
    ? pavilion.schedule.availableDays.includes(new Date(date + "T12:00:00").getDay())
    : true;

  // Time bounds: must be inside open window AND end before close
  const startMin = timeToMinutes(time);
  const endMin   = startMin + duration * 60;
  const openMin  = timeToMinutes(pavilion.schedule.openTime);
  const closeMin = timeToMinutes(pavilion.schedule.closeTime);
  const timeOutOfRange = startMin < openMin || endMin > closeMin;

  // ── Check availability when date / time / duration change ──
  useEffect(() => {
    if (!date || !time) { setAvail("idle"); return; }

    setAvail("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/availability?pavilionId=${pavilion.id}&date=${date}&startTime=${encodeURIComponent(time)}&duration=${duration}`
        );
        const data = await res.json();
        if (!res.ok) { setAvail("error"); return; }
        setAvail(data.available ? "available" : "conflict");
        setAvailMsg(data.message ?? "");
      } catch {
        setAvail("error");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [date, time, duration, pavilion.id]);

  // ── On entering Extras: default child-entry tickets to match party size ──
  useEffect(() => {
    if (step !== "extras") return;
    const n = Number(partySize);
    if (!Number.isFinite(n) || n < 1) return;
    setAddonQty((prev) => {
      if (prev["child-entry-addon"] !== undefined) return prev;
      return { ...prev, "child-entry-addon": n };
    });
  }, [step, partySize]);

  // ── Initialize Square card when entering payment step (skip if free) ──
  useEffect(() => {
    if (step !== "payment" || total === 0) return;
    if (!sdkReady || squareReady || !cardRef.current) return;

    (async () => {
      try {
        // @ts-expect-error Square loaded via CDN
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const card = await payments.card({
          style: {
            input: { color: "#1c1917", fontFamily: "inherit", fontSize: "14px" },
            "input::placeholder": { color: "#d6d3d1" },
            ".input-container":          { borderColor: "#fde68a", borderRadius: "12px", borderWidth: "2px" },
            ".input-container.is-focus": { borderColor: "#0d9488" },
            ".input-container.is-error": { borderColor: "#f87171" },
          },
        });
        await card.attach(cardRef.current);
        cardInstance.current = card;
        setSquareReady(true);
      } catch (err) {
        console.error("Square init error:", err);
        setPayError("Could not load payment form. Please refresh and try again.");
      }
    })();
  }, [step, sdkReady, squareReady]);

  async function submitReservation(squareTokenValue: string | null) {
    const res = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pavilionId: pavilion.id, pavilionName: pavilion.name,
        date, time, duration, total,
        name, email, phone,
        partySize: partySize ? Number(partySize) : null,
        addons: addonLines.map((l) => ({ id: l.id, qty: l.qty })),
        squareToken: squareTokenValue,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPayError(data.error ?? "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }
    setReservationId(data.reservationId);
    setStep("confirmed");
  }

  async function handlePay() {
    setPayError(null);
    setProcessing(true);

    // Free booking — skip Square entirely
    if (total === 0) {
      try { await submitReservation("FREE"); }
      catch { setPayError("Something went wrong. Please try again."); setProcessing(false); }
      return;
    }

    if (!cardInstance.current) { setProcessing(false); return; }

    try {
      // @ts-expect-error Square tokenize
      const result = await cardInstance.current.tokenize();

      if (result.status !== "OK") {
        setPayError(result.errors?.map((e: { message: string }) => e.message).join(", ") ?? "Card error.");
        setProcessing(false);
        return;
      }

      await submitReservation(result.token);
    } catch {
      setPayError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  }

  // ── Step indicator labels ──
  const steps: { id: Step; label: string }[] = [
    { id: "schedule", label: "Time"    },
    { id: "details",  label: "Info"    },
    { id: "extras",   label: "Tickets" },
    { id: "payment",  label: "Pay"     },
  ];
  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Load Square SDK */}
      <Script
        src={SQUARE_SCRIPT}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
        onError={() => setPayError("Could not load Square. Please refresh and try again — if you use an ad blocker or strict privacy extension, you may need to disable it for this site.")}
      />

      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto border-2 border-amber-100">

        {/* ── Header ── */}
        <div className="bg-teal-700 rounded-t-2xl px-6 py-4 flex items-start justify-between">
          <div>
            <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-0.5">Reserve</p>
            <h2 className="text-lg font-black text-white">{pavilion.name}</h2>
            {step !== "confirmed" && (
              <p className="text-teal-200 text-xs mt-0.5">
                Up to {pavilion.capacity} guests · ${firstHourPrice} first hr · ${additionalHourPrice}/hr after
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close"
            className="text-teal-200 hover:text-white text-2xl leading-none ml-4 mt-0.5 transition-colors">
            ×
          </button>
        </div>

        {/* ── Step tabs ── */}
        {step !== "confirmed" && (
          <div className="flex border-b border-amber-100">
            {steps.map((s, i) => (
              <div key={s.id} className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                i === stepIdx  ? "text-teal-700 border-teal-600" :
                i < stepIdx    ? "text-teal-400 border-transparent" :
                                 "text-stone-300 border-transparent"
              }`}>
                {i + 1}. {s.label}
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-5">

          {/* ══════════════════════════════════════════
              STEP 1 — Schedule
          ══════════════════════════════════════════ */}
          {step === "schedule" && (
            <div className="space-y-4">
              {/* Required-tickets banner — visible on the very first step */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3">
                <p className="text-red-700 text-[10px] uppercase tracking-widest font-black mb-1">⚠ Important</p>
                <p className="text-stone-700 text-sm leading-snug">
                  Pavilion rentals only cover the shaded space.{" "}
                  <strong className="text-red-700">Park entry tickets are required for every guest</strong>{" "}
                  — you can add them in the next steps and pay for everything together.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Date *</label>
                <input type="date" required value={date}
                  min={toMinDate()} max={toMaxDate()}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls()} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Start Time *</label>
                <input type="time" required value={time}
                  min={pavilion.schedule.openTime} max={pavilion.schedule.closeTime}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputCls()} />
                <p className="text-stone-400 text-xs mt-1">
                  Park hours: {pavilion.schedule.openTime} – {pavilion.schedule.closeTime}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Duration *</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                        duration === d
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-stone-600 border-amber-100 hover:border-teal-300"
                      }`}>
                      {d}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Closed-day warning */}
              {date && !dayOpen && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600">
                  ✕ This pavilion is closed on {dayLabel}s. Please pick a different day.
                </div>
              )}

              {/* Out-of-hours warning */}
              {date && dayOpen && timeOutOfRange && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-orange-700">
                  ⚠ That time is outside park hours ({pavilion.schedule.openTime}–{pavilion.schedule.closeTime}). Please adjust your start time or duration.
                </div>
              )}

              {/* Free-day banner */}
              {date && dayOpen && isFreeDay && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 text-sm font-bold text-green-700">
                  🎉 {dayLabel}s are <span className="font-black">FREE</span> — no charge for the pavilion!
                </div>
              )}

              {/* Price preview */}
              <div className="bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3">
                <p className="text-stone-400 text-xs">
                  {duration === 1 ? `1 hr at $${effectiveFirstHour}` : `$${effectiveFirstHour} first hr + ${duration - 1} × $${effectiveAddHour}/hr`}
                </p>
                <p className="text-teal-700 font-black text-xl mt-0.5">
                  ${total} <span className="text-stone-400 text-sm font-normal">due today</span>
                </p>
              </div>

              {/* Availability badge */}
              {date && time && dayOpen && !timeOutOfRange && (
                <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border ${
                  avail === "checking" ? "bg-stone-50 border-stone-200 text-stone-500" :
                  avail === "available" ? "bg-green-50 border-green-200 text-green-700" :
                  avail === "conflict"  ? "bg-red-50 border-red-200 text-red-600" :
                  avail === "error"     ? "bg-orange-50 border-orange-200 text-orange-600" :
                  "bg-stone-50 border-stone-100 text-stone-400"
                }`}>
                  {avail === "checking" && (
                    <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" /> Checking availability…</>
                  )}
                  {avail === "available" && <><span className="text-lg leading-none">✓</span> This slot is open!</>}
                  {avail === "conflict"  && <><span className="text-lg leading-none">✕</span> {availMsg || "Already booked — pick a different time."}</>}
                  {avail === "error"     && "Could not verify — availability will be confirmed on submit."}
                  {avail === "idle"      && "Select a date and time above"}
                </div>
              )}

              <button type="button"
                disabled={avail !== "available" || !dayOpen || timeOutOfRange}
                onClick={() => setStep("details")}
                className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider">
                Continue →
              </button>

              {/* Pavilion features */}
              <div className="flex flex-wrap gap-1 pt-1">
                {pavilion.features.map((f) => (
                  <span key={f} className="bg-amber-50 border border-amber-200 text-stone-500 text-xs px-2 py-0.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 2 — Details
          ══════════════════════════════════════════ */}
          {step === "details" && (
            <div className="space-y-4">
              {/* Booking summary chip */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-teal-700 font-semibold">
                ✓ {date} at {time} · {duration}h · <span className="font-black">${total}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Full Name *</label>
                <input type="text" required value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="Jane Smith"
                  className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                  Email * <span className="normal-case text-stone-400 font-normal">(confirmation sent here)</span>
                </label>
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com"
                  className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Phone</label>
                <input type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="(512) 555-0100"
                  className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
                  Expected Guests * <span className="normal-case text-stone-400 font-normal">(max {pavilion.capacity})</span>
                </label>
                <input type="number" required min={1} max={pavilion.capacity} value={partySize}
                  onChange={(e) => setPartySize(e.target.value)} placeholder={`e.g. 20`}
                  className={inputCls()} />
                <p className="text-stone-400 text-xs mt-1">
                  Helps us prepare. We&apos;ll pre-fill park entry tickets for this many guests on the next step.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep("schedule")}
                  className="flex-1 border-2 border-amber-100 hover:border-teal-200 text-stone-500 hover:text-teal-600 font-bold py-3 rounded-xl transition-colors text-sm">
                  ← Back
                </button>
                <button type="button"
                  disabled={!name.trim() || !email.trim() || !partySize || Number(partySize) < 1 || Number(partySize) > pavilion.capacity}
                  onClick={() => setStep("extras")}
                  className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider text-sm">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 3 — Extras (park entry + add-ons)
          ══════════════════════════════════════════ */}
          {step === "extras" && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3">
                <p className="text-red-700 text-[10px] uppercase tracking-widest font-black mb-1">⚠ Required for every guest</p>
                <p className="text-stone-700 text-sm leading-snug">
                  Park entry is <strong className="text-red-700">not</strong> included in the pavilion rental. Add a ticket
                  for each child below — we&apos;ve pre-filled the count from your guest size.
                </p>
              </div>

              <div className="space-y-2">
                {ADDON_CATALOG.map((a) => {
                  const qty = addonQty[a.id] ?? 0;
                  const isRequired = a.id === "child-entry-addon";
                  return (
                    <div
                      key={a.id}
                      className={`bg-white border-2 rounded-xl p-3 flex items-center gap-3 ${isRequired ? "border-red-200" : "border-amber-100"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800 font-black text-sm leading-tight">
                          {a.name}
                          {isRequired && <span className="ml-2 text-[10px] font-black text-red-600 uppercase tracking-wider">Required</span>}
                        </p>
                        <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{a.description}</p>
                        <p className="text-teal-700 font-black text-sm mt-1">${(a.price / 100).toFixed(2)}{a.id !== "child-entry-addon" ? "" : " each"}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setAddonQty((p) => ({ ...p, [a.id]: Math.max(0, (p[a.id] ?? 0) - 1) }))}
                          className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-amber-100 text-stone-700 font-black flex items-center justify-center hover:border-teal-300"
                        >−</button>
                        <span className="text-stone-800 font-black w-6 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setAddonQty((p) => ({ ...p, [a.id]: (p[a.id] ?? 0) + 1 }))}
                          className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-amber-100 text-stone-700 font-black flex items-center justify-center hover:border-teal-300"
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Running total */}
              <div className="bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Pavilion ({duration} hr{duration !== 1 ? "s" : ""})</span>
                  <span className="text-stone-700 font-semibold">${pavilionTotal.toFixed(2)}</span>
                </div>
                {addonLines.map((l) => (
                  <div key={l.id} className="flex justify-between text-sm text-stone-500">
                    <span>{l.name} × {l.qty}</span>
                    <span className="text-stone-700 font-semibold">${((l.price / 100) * l.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-stone-800 font-black text-base border-t-2 border-amber-200 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-teal-700">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep("details")}
                  className="flex-1 border-2 border-amber-100 hover:border-teal-200 text-stone-500 hover:text-teal-600 font-bold py-3 rounded-xl transition-colors text-sm">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep("payment")}
                  className="flex-1 bg-teal-700 hover:bg-teal-600 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider text-sm">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 4 — Payment
          ══════════════════════════════════════════ */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Booking summary */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm">
                <p className="text-teal-700 font-bold">{pavilion.name}</p>
                <p className="text-teal-600">{date} at {time} · {duration} hr{duration !== 1 ? "s" : ""}</p>
                <p className="text-stone-500 mt-1">For: {name} ({email})</p>
              </div>

              {/* Order breakdown */}
              <div className="bg-white border-2 border-amber-100 rounded-xl px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Pavilion ({duration} hr{duration !== 1 ? "s" : ""})</span>
                  <span className="text-stone-700 font-semibold">${pavilionTotal.toFixed(2)}</span>
                </div>
                {addonLines.map((l) => (
                  <div key={l.id} className="flex justify-between text-sm text-stone-500">
                    <span>{l.name} × {l.qty}</span>
                    <span className="text-stone-700 font-semibold">${((l.price / 100) * l.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Square card form — hidden for free bookings */}
              {total > 0 ? (
                <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal-600">🔒</span>
                      <span className="text-xs font-bold text-stone-400">Secured by Square</span>
                    </div>
                    <div className="flex gap-1">
                      {["VISA", "MC", "AMEX", "DISC"].map((c) => (
                        <span key={c} className="text-xs bg-amber-50 border border-amber-100 text-stone-500 px-1.5 py-0.5 rounded font-bold">{c}</span>
                      ))}
                    </div>
                  </div>

                  <div className="min-h-[90px]">
                    {!squareReady && !payError && (
                      <div className="flex items-center gap-2 text-stone-400 text-sm py-7 justify-center">
                        <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                        Loading secure payment form…
                      </div>
                    )}
                    <div ref={cardRef} className={squareReady ? "" : "hidden"} />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-green-700 font-black text-base">🎉 No payment required</p>
                  <p className="text-green-600 text-sm mt-1">{dayLabel} bookings are free.</p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3">
                <span className="text-stone-500 text-sm font-semibold">Total due today</span>
                <span className="text-teal-700 font-black text-2xl">${total.toFixed(2)}</span>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600 font-semibold">
                  {payError}
                </div>
              )}

              <button type="button"
                disabled={processing || (total > 0 && !squareReady)}
                onClick={handlePay}
                className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                {processing
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                  : total === 0
                    ? "✓ Confirm Free Booking"
                    : `🔒 Pay $${total.toFixed(2)} Now`}
              </button>

              <button type="button" onClick={() => setStep("extras")}
                className="block w-full text-center text-stone-400 hover:text-teal-600 text-xs font-bold uppercase tracking-wider transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════
              CONFIRMED
          ══════════════════════════════════════════ */}
          {step === "confirmed" && (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🤠</div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Yeehaw! You&apos;re booked!</h3>
              <p className="text-stone-500 text-sm">{pavilion.name}</p>
              <p className="text-stone-500 text-sm">{date} at {time} · {duration} hr{duration !== 1 ? "s" : ""}</p>
              <p className="text-teal-700 font-black text-2xl mt-3">${total.toFixed(2)}</p>
              {reservationId && (
                <p className="text-stone-400 text-xs mt-1">Reservation: {reservationId}</p>
              )}

              {/* Itemized recap */}
              <div className="mt-5 bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3 text-left text-sm space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>Pavilion ({duration} hr{duration !== 1 ? "s" : ""})</span>
                  <span className="text-stone-700 font-semibold">${pavilionTotal.toFixed(2)}</span>
                </div>
                {addonLines.map((l) => (
                  <div key={l.id} className="flex justify-between text-stone-500">
                    <span>{l.name} × {l.qty}</span>
                    <span className="text-stone-700 font-semibold">${((l.price / 100) * l.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <p className="text-stone-400 text-xs mt-4 max-w-xs mx-auto">
                Confirmation and QR code sent to{" "}
                <strong className="text-stone-600">{email}</strong>.
              </p>

              <button onClick={onClose}
                className="mt-6 bg-teal-700 hover:bg-teal-600 text-white font-black py-2 px-6 rounded-xl transition-colors uppercase text-sm tracking-wider">
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

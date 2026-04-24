"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Pavilion } from "@/data/pavilions";

const SQUARE_APP_ID      = process.env.NEXT_PUBLIC_SQUARE_APP_ID ?? "";
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
const SQUARE_ENV         = process.env.NEXT_PUBLIC_SQUARE_ENV ?? "sandbox";
const SQUARE_SCRIPT      = SQUARE_ENV === "production"
  ? "https://web.squarecdn.com/v1/square.js"
  : "https://sandbox.web.squarecdn.com/v1/square.js";

const DURATIONS = [1, 2, 3, 4, 6, 8];

type Step       = "schedule" | "details" | "payment" | "confirmed";
type AvailState = "idle" | "checking" | "available" | "conflict" | "error";

function toMinDate() {
  const earliest = new Date("2026-05-23");
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
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ── Payment (Square) ──
  const cardRef        = useRef<HTMLDivElement>(null);
  const cardInstance   = useRef<unknown>(null);
  const [sdkReady,    setSdkReady]    = useState(false);
  const [squareReady, setSquareReady] = useState(false);
  const [processing,  setProcessing]  = useState(false);
  const [payError,    setPayError]    = useState<string | null>(null);

  // ── Confirmed ──
  const [reservationId, setReservationId] = useState("");

  const total = firstHourPrice + Math.max(0, duration - 1) * additionalHourPrice;

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

  // ── Initialize Square card when entering payment step ──
  useEffect(() => {
    if (step !== "payment" || !sdkReady || squareReady || !cardRef.current) return;

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

  async function handlePay() {
    if (!cardInstance.current) return;
    setPayError(null);
    setProcessing(true);

    try {
      // @ts-expect-error Square tokenize
      const result = await cardInstance.current.tokenize();

      if (result.status !== "OK") {
        setPayError(result.errors?.map((e: { message: string }) => e.message).join(", ") ?? "Card error.");
        setProcessing(false);
        return;
      }

      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pavilionId: pavilion.id, pavilionName: pavilion.name,
          date, time, duration, total,
          name, email, phone,
          squareToken: result.token,
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
    } catch {
      setPayError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  }

  // ── Step indicator labels ──
  const steps: { id: Step; label: string }[] = [
    { id: "schedule", label: "Time" },
    { id: "details",  label: "Info" },
    { id: "payment",  label: "Pay"  },
  ];
  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Load Square SDK */}
      <Script src={SQUARE_SCRIPT} strategy="afterInteractive" onReady={() => setSdkReady(true)} />

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
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Date *</label>
                <input type="date" required value={date}
                  min={toMinDate()} max={toMaxDate()}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls()} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Start Time *</label>
                <input type="time" required value={time} min="09:00" max="21:00"
                  onChange={(e) => setTime(e.target.value)}
                  className={inputCls()} />
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

              {/* Price preview */}
              <div className="bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3">
                <p className="text-stone-400 text-xs">
                  {duration === 1 ? `1 hr at $${firstHourPrice}` : `$${firstHourPrice} first hr + ${duration - 1} × $${additionalHourPrice}/hr`}
                </p>
                <p className="text-teal-700 font-black text-xl mt-0.5">
                  ${total} <span className="text-stone-400 text-sm font-normal">due today</span>
                </p>
              </div>

              {/* Availability badge */}
              {date && time && (
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
                disabled={avail !== "available"}
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

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep("schedule")}
                  className="flex-1 border-2 border-amber-100 hover:border-teal-200 text-stone-500 hover:text-teal-600 font-bold py-3 rounded-xl transition-colors text-sm">
                  ← Back
                </button>
                <button type="button"
                  disabled={!name.trim() || !email.trim()}
                  onClick={() => setStep("payment")}
                  className="flex-1 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-wider text-sm">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              STEP 3 — Payment
          ══════════════════════════════════════════ */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Booking summary */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm">
                <p className="text-teal-700 font-bold">{pavilion.name}</p>
                <p className="text-teal-600">{date} at {time} · {duration} hr{duration !== 1 ? "s" : ""}</p>
                <p className="text-stone-500 mt-1">For: {name} ({email})</p>
              </div>

              {/* Square card form */}
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

              {/* Total */}
              <div className="flex justify-between items-center bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-3">
                <span className="text-stone-500 text-sm font-semibold">Total due today</span>
                <span className="text-teal-700 font-black text-2xl">${total}</span>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600 font-semibold">
                  {payError}
                </div>
              )}

              <button type="button"
                disabled={processing || !squareReady}
                onClick={handlePay}
                className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                {processing
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                  : `🔒 Pay $${total} Now`}
              </button>

              <button type="button" onClick={() => setStep("details")}
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
              <div className="text-5xl mb-4">🤠</div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Yeehaw! You&apos;re booked!</h3>
              <p className="text-stone-500 text-sm">{pavilion.name}</p>
              <p className="text-stone-500 text-sm">{date} at {time} · {duration} hr{duration !== 1 ? "s" : ""}</p>
              <p className="text-teal-700 font-black text-2xl mt-3">${total}</p>
              {reservationId && (
                <p className="text-stone-400 text-xs mt-1">Reservation: {reservationId}</p>
              )}
              <p className="text-stone-400 text-xs mt-3 max-w-xs mx-auto">
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

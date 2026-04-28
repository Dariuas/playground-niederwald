"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { addons } from "@/data/products";

// ── Square config — set in .env.local ──────────────────────────────
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID ?? "";
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENV ?? "sandbox";
const SQUARE_SCRIPT =
  SQUARE_ENV === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";

type Step = "cart" | "info" | "payment" | "confirmation";
interface ContactInfo { name: string; email: string; phone: string; }
const EMPTY_CONTACT: ContactInfo = { name: "", email: "", phone: "" };

function inputCls() {
  return "w-full bg-white border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400";
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "cart", label: "Cart" }, { id: "info", label: "Your Info" },
    { id: "payment", label: "Payment" }, { id: "confirmation", label: "Confirmed" },
  ];
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${i < idx ? "bg-teal-600 text-white" : i === idx ? "bg-teal-700 text-white ring-4 ring-teal-200" : "bg-amber-100 text-stone-400"}`}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-bold uppercase tracking-wider ${i <= idx ? "text-teal-700" : "text-stone-300"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`w-10 sm:w-16 h-0.5 mx-1 mb-5 ${i < idx ? "bg-teal-600" : "bg-amber-100"}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Square payment step ────────────────────────────────────────────
function SquarePaymentForm({
  grandTotal,
  onSuccess,
  onBack,
  items,
  totalPrice,
  tax,
  customerName,
  customerEmail,
}: {
  grandTotal: number;
  onSuccess: (orderNumber: string) => void;
  onBack: () => void;
  items: { id: string; name: string; quantity: number; price: number }[];
  totalPrice: number;
  tax: number;
  customerName: string;
  customerEmail: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInstance = useRef<unknown>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Square card once SDK is ready
  useEffect(() => {
    if (!sdkReady || initialized || !cardRef.current) return;

    async function initSquare() {
      try {
        // @ts-expect-error Square is loaded via CDN script
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const card = await payments.card({
          style: {
            input: {
              color: "#1c1917",
              fontFamily: "inherit",
              fontSize: "14px",
            },
            "input::placeholder": { color: "#d6d3d1" },
            ".input-container": {
              borderColor: "#fde68a",
              borderRadius: "12px",
              borderWidth: "2px",
            },
            ".input-container.is-focus": { borderColor: "#0d9488" },
            ".input-container.is-error": { borderColor: "#f87171" },
          },
        });
        await card.attach(cardRef.current);
        cardInstance.current = card;
        setInitialized(true);
      } catch (err) {
        console.error("Square init error:", err);
        setError("Could not load payment form. Please refresh and try again.");
      }
    }

    initSquare();
  }, [sdkReady, initialized]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!cardInstance.current) return;
    setError(null);
    setProcessing(true);

    try {
      // @ts-expect-error Square card tokenize
      const result = await cardInstance.current.tokenize();

      if (result.status === "OK") {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: result.token,
            amountCents: Math.round(grandTotal * 100),
            customerName,
            customerEmail,
            items,
            totalPrice,
            tax,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Payment failed. Please try again.");
          setProcessing(false);
          return;
        }

        onSuccess(data.orderNumber);
      } else {
        const msgs = result.errors?.map((e: { message: string }) => e.message).join(", ") ?? "Payment failed.";
        setError(msgs);
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handlePay}>
      {/* Load Square SDK */}
      <Script
        src={SQUARE_SCRIPT}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
        onError={() => setError("Could not load Square SDK. Check your connection.")}
      />

      <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 mb-4">
        {/* Square badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-teal-600 text-lg">🔒</span>
            <span className="text-xs font-bold text-stone-400">Secured by Square</span>
          </div>
          <div className="flex gap-1.5 items-center">
            {["VISA", "MC", "AMEX", "DISC"].map((c) => (
              <span key={c} className="text-xs bg-amber-50 border border-amber-100 text-stone-500 px-1.5 py-0.5 rounded font-bold">{c}</span>
            ))}
          </div>
        </div>

        {/* Square card container — SDK renders fields here */}
        <div className="min-h-[100px]">
          {!initialized && !error && (
            <div className="flex items-center gap-2 text-stone-400 text-sm py-8 justify-center">
              <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Loading secure payment form…
            </div>
          )}
          <div ref={cardRef} id="card-container" className={initialized ? "" : "hidden"} />
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 mb-5">
        {items.map((i) => (
          <div key={i.name} className="flex justify-between text-sm text-stone-400 py-0.5">
            <span>{i.name} × {i.quantity}</span>
            <span>${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm text-stone-400 border-t border-amber-50 pt-2 mt-1">
          <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-stone-800 font-black text-xl border-t border-amber-100 pt-3 mt-2">
          <span>Total</span><span className="text-teal-700">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing || !initialized}
        className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3"
      >
        {processing ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
        ) : (
          <>🔒 Pay ${grandTotal.toFixed(2)} with Square</>
        )}
      </button>
      <button type="button" onClick={onBack} className="block w-full text-center text-stone-400 hover:text-teal-600 text-xs mt-4 font-bold uppercase tracking-wider transition-colors">
        ← Back
      </button>
    </form>
  );
}

// ── Add-on recommendations strip ───────────────────────────────────
function AddonRecommendations({
  cartItemIds,
}: {
  cartItemIds: Set<string>;
}) {
  const { addItem } = useCart();
  // Split kids tickets out — those are REQUIRED, not "recommended"
  const required = addons.filter((a) => a.id === "child-entry-addon" && !cartItemIds.has(a.id));
  const optional = addons.filter((a) => a.id !== "child-entry-addon" && !cartItemIds.has(a.id));

  if (required.length === 0 && optional.length === 0) return null;

  return (
    <>
      {required.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-5">
          <p className="text-red-700 text-xs uppercase tracking-widest font-black mb-1">⚠ Required for kids ages 3–12</p>
          <h3 className="text-stone-800 font-black text-lg mb-1">Park entry tickets</h3>
          <p className="text-stone-600 text-sm mb-4">
            Every kid ages 3–12 needs an entry ticket — <strong className="text-red-700">even with a pavilion rental.</strong>{" "}
            Adults and kids under 3 enter free. Add a ticket for each child now.
          </p>
          <div className="space-y-3">
            {required.map((a) => (
              <div key={a.id} className="bg-white border-2 border-red-200 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 font-black text-sm leading-tight">{a.name}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{a.description}</p>
                  <p className="text-teal-700 font-black text-sm mt-1">${(a.price / 100).toFixed(2)} each</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem({ id: a.id, name: a.name, price: a.price / 100, category: "Park Entry" })}
                  className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
                >
                  + Add Ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {optional.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-5">
          <p className="text-amber-800 text-xs uppercase tracking-widest font-black mb-1">⚡ Add to your day</p>
          <h3 className="text-stone-800 font-black text-lg mb-3">Make it extra fun</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {optional.map((a) => (
              <div key={a.id} className="bg-white border-2 border-amber-100 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 font-black text-sm leading-tight">{a.name}</p>
                  <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{a.description}</p>
                  <p className="text-teal-700 font-black text-sm mt-1">${(a.price / 100).toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem({ id: a.id, name: a.name, price: a.price / 100, category: "Add-on" })}
                  className="bg-teal-700 hover:bg-teal-600 text-white font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main checkout page ─────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [orderNumber, setOrderNumber] = useState("");

  const cartItemIds = new Set(items.map((i) => i.id));
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + tax;

  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="bg-teal-700 py-10 px-6 text-center">
        <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">
          {step === "confirmation" ? "🎉 You're all set!" : "Checkout"}
        </p>
        <h1 className="text-3xl font-black text-white">
          {step === "cart" && "Your Cart"}
          {step === "info" && "Your Info"}
          {step === "payment" && "Payment"}
          {step === "confirmation" && "Order Confirmed!"}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <StepIndicator current={step} />

        {/* ── Cart ── */}
        {step === "cart" && (
          <div>
            {items.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-amber-100">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-stone-800 font-black text-xl mb-2">Your cart is empty</p>
                <p className="text-stone-400 text-sm mb-8">Head back and add some items first!</p>
                <Link href="/playground" className="inline-block bg-teal-700 hover:bg-teal-600 text-white font-black py-2.5 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors">
                  Buy Tickets
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white border-2 border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-800 font-black text-sm truncate">{item.name}</p>
                        <p className="text-stone-400 text-xs">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-amber-50 border-2 border-amber-100 text-stone-700 font-black text-sm flex items-center justify-center hover:border-teal-300">−</button>
                        <span className="text-stone-800 font-bold w-4 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-amber-50 border-2 border-amber-100 text-stone-700 font-black text-sm flex items-center justify-center hover:border-teal-300">+</button>
                      </div>
                      <p className="text-teal-700 font-black text-sm w-16 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-400 transition-colors text-lg">×</button>
                    </div>
                  ))}
                </div>
                <AddonRecommendations cartItemIds={cartItemIds} />

                <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-stone-400"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-stone-400"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-stone-800 font-black text-lg border-t border-amber-100 pt-3 mt-1">
                    <span>Total</span><span className="text-teal-700">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => setStep("info")} className="w-full bg-teal-700 hover:bg-teal-600 text-white font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm transition-colors">
                  Continue →
                </button>
                <Link href="/menu" className="block text-center text-stone-400 hover:text-teal-600 text-xs mt-4 font-bold uppercase tracking-wider transition-colors">← Keep Shopping</Link>
              </>
            )}
          </div>
        )}

        {/* ── Info ── */}
        {step === "info" && (
          <form onSubmit={(e) => { e.preventDefault(); setStep("payment"); }}>
            <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 mb-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input type="text" required placeholder="Jane Smith" value={contact.name} onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Email *</label>
                <input type="email" required placeholder="jane@example.com" value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Phone</label>
                <input type="tel" placeholder="(512) 555-0100" value={contact.phone} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} className={inputCls()} />
              </div>
            </div>
            <div className="bg-white border-2 border-amber-100 rounded-2xl p-4 mb-5">
              <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">Order Summary</p>
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm text-stone-500 py-0.5">
                  <span>{i.name} × {i.quantity}</span><span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-stone-800 font-black border-t border-amber-100 pt-2 mt-2">
                <span>Total</span><span className="text-teal-700">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button type="submit" className="w-full bg-teal-700 hover:bg-teal-600 text-white font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm transition-colors">
              Continue to Payment →
            </button>
            <button type="button" onClick={() => setStep("cart")} className="block w-full text-center text-stone-400 hover:text-teal-600 text-xs mt-4 font-bold uppercase tracking-wider transition-colors">← Back</button>
          </form>
        )}

        {/* ── Payment (Square) ── */}
        {step === "payment" && (
          <SquarePaymentForm
            grandTotal={grandTotal}
            tax={tax}
            totalPrice={totalPrice}
            items={items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price }))}
            customerName={contact.name}
            customerEmail={contact.email}
            onSuccess={(num) => { clearCart(); setOrderNumber(num); setStep("confirmation"); }}
            onBack={() => setStep("info")}
          />
        )}

        {/* ── Confirmation ── */}
        {step === "confirmation" && (
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-8 text-center">
            <div className="text-7xl mb-4">🤠</div>
            <h2 className="text-3xl font-black text-stone-800 mb-2">Yeehaw! You&apos;re all set.</h2>
            <p className="text-teal-700 font-black text-lg mb-1">Order {orderNumber}</p>
            <p className="text-stone-400 text-sm mb-8">
              Confirmation sent to <strong className="text-stone-700">{contact.email}</strong>.<br />We&apos;ll see you at the park!
            </p>
            <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 text-left mb-7 space-y-4">
              <p className="text-stone-500 font-black text-xs uppercase tracking-widest mb-2">What Happens Next</p>
              {[
                { icon: "📧", title: "Check your email", desc: "Order details and QR code are on their way." },
                { icon: "📍", title: "Head to the park", desc: "7400 Niederwald Strasse, Niederwald, TX 78640" },
                { icon: "📱", title: "Show your QR code", desc: "At the gate or food truck for instant access." },
              ].map((s) => (
                <div key={s.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{s.icon}</span>
                  <div><p className="text-stone-800 font-black text-sm">{s.title}</p><p className="text-stone-400 text-xs">{s.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/" className="bg-teal-700 hover:bg-teal-600 text-white font-black py-2.5 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors">Back to Home</Link>
              <Link href="/playground" className="bg-white border-2 border-amber-100 hover:border-teal-300 text-stone-700 font-bold py-2.5 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors">Explore Activities</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

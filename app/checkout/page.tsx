"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Step = "cart" | "info" | "payment" | "confirmation";

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

const EMPTY_CONTACT: ContactInfo = { name: "", email: "", phone: "" };
const EMPTY_PAYMENT: PaymentInfo = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

function formatCard(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "cart", label: "Cart" },
    { id: "info", label: "Your Info" },
    { id: "payment", label: "Payment" },
    { id: "confirmation", label: "Confirmed" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                i < currentIdx
                  ? "bg-amber-400 text-stone-900"
                  : i === currentIdx
                  ? "bg-amber-400 text-stone-900 ring-4 ring-amber-400/30"
                  : "bg-stone-800 text-stone-500"
              }`}
            >
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <span className={`text-xs mt-1 font-bold uppercase tracking-wider ${i <= currentIdx ? "text-amber-400" : "text-stone-600"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-5 ${i < currentIdx ? "bg-amber-400" : "bg-stone-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function inputCls() {
  return "w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400";
}

export default function CheckoutPage() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [payment, setPayment] = useState<PaymentInfo>(EMPTY_PAYMENT);
  const [processing, setProcessing] = useState(false);
  const [orderNumber] = useState(() => "PN-" + Math.floor(100000 + Math.random() * 900000));

  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + tax;

  function handlePayNow(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    // Simulate network delay
    setTimeout(() => {
      setProcessing(false);
      clearCart();
      setStep("confirmation");
    }, 2000);
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="bg-stone-900 border-b border-stone-800 py-10 px-6 text-center">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
          {step === "confirmation" ? "🎉 You're all set!" : "Checkout"}
        </p>
        <h1 className="text-3xl font-black text-white">
          {step === "cart" && "Your Cart"}
          {step === "info" && "Your Info"}
          {step === "payment" && "Payment"}
          {step === "confirmation" && "Order Confirmed"}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <StepIndicator current={step} />

        {/* ── STEP 1: Cart ── */}
        {step === "cart" && (
          <div>
            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-white font-black text-xl mb-2">Your cart is empty</p>
                <p className="text-stone-500 text-sm mb-8">Head back and add some items first.</p>
                <Link
                  href="/menu"
                  className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-2.5 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-stone-900 border border-stone-800 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-sm truncate">{item.name}</p>
                        <p className="text-stone-500 text-xs">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-white font-black text-sm flex items-center justify-center hover:border-amber-400 transition-colors"
                        >−</button>
                        <span className="text-white font-bold w-4 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-white font-black text-sm flex items-center justify-center hover:border-amber-400 transition-colors"
                        >+</button>
                      </div>
                      <p className="text-amber-400 font-black text-sm w-16 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-600 hover:text-red-400 transition-colors text-lg ml-1"
                        aria-label="Remove"
                      >×</button>
                    </div>
                  ))}
                </div>

                {/* Order summary */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-6 space-y-2">
                  <div className="flex justify-between text-sm text-stone-400">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-400">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-lg border-t border-stone-800 pt-3 mt-1">
                    <span>Total</span>
                    <span className="text-amber-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep("info")}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm transition-colors"
                >
                  Continue to Info →
                </button>
                <Link href="/menu" className="block text-center text-stone-500 hover:text-amber-400 text-xs mt-4 font-bold uppercase tracking-wider transition-colors">
                  ← Keep Shopping
                </Link>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Contact Info ── */}
        {step === "info" && (
          <form onSubmit={(e) => { e.preventDefault(); setStep("payment"); }}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={contact.name}
                  onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={contact.email}
                  onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Phone</label>
                <input
                  type="tel"
                  placeholder="(512) 555-0100"
                  value={contact.phone}
                  onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                  className={inputCls()}
                />
              </div>
            </div>

            {/* Mini order summary */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
              <p className="text-stone-500 text-xs uppercase tracking-wider mb-2">Order Summary</p>
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm text-stone-400 py-0.5">
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-white font-black border-t border-stone-800 pt-2 mt-2">
                <span>Total</span>
                <span className="text-amber-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3.5 rounded-2xl uppercase tracking-widest text-sm transition-colors">
              Continue to Payment →
            </button>
            <button type="button" onClick={() => setStep("cart")} className="block w-full text-center text-stone-500 hover:text-amber-400 text-xs mt-4 font-bold uppercase tracking-wider transition-colors">
              ← Back to Cart
            </button>
          </form>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === "payment" && (
          <form onSubmit={handlePayNow}>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-400">🔒</span>
                <p className="text-xs text-stone-500 font-semibold">Demo checkout — no real payment processed</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Name on Card *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={payment.cardName}
                    onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value }))}
                    className={inputCls()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Card Number *</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={payment.cardNumber}
                    onChange={(e) => setPayment((p) => ({ ...p, cardNumber: formatCard(e.target.value) }))}
                    maxLength={19}
                    className={inputCls() + " font-mono tracking-widest"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">Expiry *</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={payment.expiry}
                      onChange={(e) => setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                      className={inputCls() + " font-mono"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">CVV *</label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="123"
                      value={payment.cvv}
                      onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      maxLength={4}
                      className={inputCls() + " font-mono"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accepted cards */}
            <div className="flex items-center gap-2 mb-5">
              {["VISA", "MC", "AMEX", "DISC"].map((c) => (
                <span key={c} className="text-xs bg-stone-800 border border-stone-700 text-stone-400 px-2 py-1 rounded font-bold">
                  {c}
                </span>
              ))}
              <span className="text-stone-600 text-xs ml-1">· Apple Pay · Google Pay (coming soon)</span>
            </div>

            {/* Total */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-sm text-stone-400 mb-1">
                <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-400">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-black text-xl border-t border-stone-800 pt-3 mt-2">
                <span>Total</span>
                <span className="text-amber-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-70 text-stone-900 font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>🔒 Pay ${grandTotal.toFixed(2)}</>
              )}
            </button>
            <button type="button" onClick={() => setStep("info")} className="block w-full text-center text-stone-500 hover:text-amber-400 text-xs mt-4 font-bold uppercase tracking-wider transition-colors">
              ← Back
            </button>
          </form>
        )}

        {/* ── STEP 4: Confirmation ── */}
        {step === "confirmation" && (
          <div className="text-center py-6">
            <div className="text-7xl mb-5">🤠</div>
            <h2 className="text-3xl font-black text-white mb-2">Yeehaw! You&apos;re all set.</h2>
            <p className="text-amber-400 font-black text-lg mb-1">Order {orderNumber}</p>
            <p className="text-stone-400 text-sm mb-8">
              A confirmation has been sent to <strong className="text-white">{contact.email}</strong>.<br />
              We&apos;ll see you at the park!
            </p>

            {/* What's next */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-left mb-8 space-y-4">
              <p className="text-white font-black text-sm uppercase tracking-widest mb-2">What Happens Next</p>
              {[
                { icon: "📧", title: "Check your email", desc: "Your order details and QR code will arrive shortly." },
                { icon: "📍", title: "Head to the park", desc: "7400 Niederwald Strasse, Niederwald, TX 78640" },
                { icon: "📱", title: "Show your QR code", desc: "At the gate or food truck for instant entry." },
              ].map((s) => (
                <div key={s.title} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-white font-black text-sm">{s.title}</p>
                    <p className="text-stone-500 text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-2.5 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/playground"
                className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white font-bold py-2.5 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors"
              >
                Explore Activities
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

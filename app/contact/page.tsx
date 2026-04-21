"use client";

import { useState } from "react";
import Link from "next/link";

interface FormState { name: string; email: string; phone: string; subject: string; message: string; }
const INITIAL: FormState = { name: "", email: "", phone: "", subject: "", message: "" };
const SUBJECTS = ["Pavilion / Gazebo Reservation", "Full Park Rental", "Bar Rental", "Amphitheater / Private Event", "Gel Blasters / Paintball Booking", "General Inquiry"];

const infoBlocks = [
  { icon: "🏡", title: "Pavilion Reservations", desc: "Use the interactive map on the Activities page to pick your gazebo, date, and time.", linkHref: "/playground#pavilions", linkLabel: "Go to Pavilion Map →", border: "border-amber-200", bg: "bg-amber-50" },
  { icon: "🌳", title: "Full Park Rental", desc: "Need the whole place? We offer full park buyouts for large events, corporate outings, and special occasions.", border: "border-teal-200", bg: "bg-teal-50" },
  { icon: "🍻", title: "Bar Rentals", desc: "Our on-site bar is available for private events. Ask about bar packages when you reach out.", border: "border-orange-200", bg: "bg-orange-50" },
];

function inputCls() {
  return "w-full bg-white border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-400";
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send message.");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="bg-teal-700 py-12 px-6 text-center">
        <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">Let&apos;s Talk</p>
        <h1 className="text-4xl font-black text-white mb-2">Contact Us</h1>
        <p className="text-teal-100 text-base max-w-xl mx-auto">Questions, bookings, or party planning — we&apos;re here for it!</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Left — Info */}
          <div className="space-y-4">
            {infoBlocks.map((block) => (
              <div key={block.title} className={`border-2 ${block.border} ${block.bg} rounded-2xl p-5`}>
                <h3 className="font-black text-stone-800 text-base mb-1">{block.icon} {block.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-2">{block.desc}</p>
                {block.linkHref && (
                  <Link href={block.linkHref} className="text-teal-600 text-sm font-bold hover:text-teal-700 transition-colors">
                    {block.linkLabel}
                  </Link>
                )}
              </div>
            ))}

            <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 space-y-2">
              <h3 className="font-black text-stone-800 text-base mb-2">📍 Find Us</h3>
              <p className="text-stone-500 text-sm">7400 Niederwald Strasse<br />Niederwald, TX 78640</p>
              <p><a href="tel:+15125377554" className="text-stone-500 hover:text-teal-700 transition-colors text-sm">(512) 537-7554</a></p>
              <p><a href="mailto:info@playgroundniederwald.com" className="text-stone-500 hover:text-teal-700 transition-colors text-xs">info@playgroundniederwald.com</a></p>
              <p className="text-stone-400 text-xs pt-1">Mon–Fri · 9am – 9pm</p>
              <div className="flex gap-4 pt-1">
                <a href="#" className="text-stone-400 hover:text-teal-600 text-sm font-bold transition-colors">Facebook</a>
                <a href="#" className="text-stone-400 hover:text-teal-600 text-sm font-bold transition-colors">Instagram</a>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-7 shadow-sm">
            {submitted ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">🤠</div>
                <h3 className="text-2xl font-black text-stone-800 mb-2">Message sent!</h3>
                <p className="text-stone-500 text-sm">
                  Much obliged, <strong className="text-stone-800">{form.name}</strong>! We&apos;ll holler back at <strong className="text-stone-800">{form.email}</strong> real soon.
                </p>
                <button onClick={() => { setForm(INITIAL); setSubmitted(false); }} className="mt-6 text-teal-600 hover:text-teal-700 text-sm font-bold underline transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-stone-800 mb-5">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Name *</label>
                      <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Jane Smith" className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Phone</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(512) 555-0100" className={inputCls()} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Email *</label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="jane@example.com" className={inputCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Subject *</label>
                    <select name="subject" required value={form.subject} onChange={handleChange} className={inputCls() + " bg-white"}>
                      <option value="">Select a topic...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Message *</label>
                    <textarea name="message" required rows={4} value={form.message} onChange={handleChange} placeholder="Tell us about your event, dates, group size..." className={inputCls() + " resize-none"} />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600 font-semibold">{error}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-black py-3 rounded-xl transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                    {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</> : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

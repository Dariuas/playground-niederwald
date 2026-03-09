"use client";

import { useState } from "react";
import Link from "next/link";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL: FormState = { name: "", email: "", phone: "", subject: "", message: "" };

const SUBJECTS = [
  "Pavilion / Gazebo Reservation",
  "Full Park Rental",
  "Bar Rental",
  "Amphitheater / Private Event",
  "Paintball / Gellyball Booking",
  "General Inquiry",
];

const infoBlocks = [
  {
    icon: "🏡",
    title: "Pavilion Reservations",
    desc: "Reserve one of our 5 shaded gazebos using the interactive map on the Activities page. Pick a date, time, and duration — done.",
    linkHref: "/playground#pavilions",
    linkLabel: "Go to Pavilion Map →",
    color: "border-amber-500/30 bg-amber-500/5",
  },
  {
    icon: "🌳",
    title: "Full Park Rental",
    desc: "Need the whole place? We offer full park buyouts for large events, corporate outings, and special occasions. Contact us to talk dates and pricing.",
    color: "border-orange-500/30 bg-orange-500/5",
  },
  {
    icon: "🍻",
    title: "Bar Rentals",
    desc: "Our on-site bar is available for private events. Ask about bar service packages when you reach out about your event.",
    color: "border-teal-500/30 bg-teal-500/5",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form submitted:", form);
    setSubmitted(true);
  }

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800 py-16 px-6 text-center">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Let&apos;s Talk</p>
        <h1 className="text-5xl font-black text-white mb-3">Contact Us</h1>
        <p className="text-stone-400 text-lg max-w-xl mx-auto">
          Questions, bookings, or party planning — we&apos;re here for it.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left — Info */}
          <div className="space-y-5">
            {infoBlocks.map((block) => (
              <div key={block.title} className={`border rounded-2xl p-5 ${block.color}`}>
                <h3 className="font-black text-white text-base mb-1">
                  {block.icon} {block.title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-2">{block.desc}</p>
                {block.linkHref && (
                  <Link href={block.linkHref} className="text-amber-400 text-sm font-bold hover:text-amber-300 transition-colors">
                    {block.linkLabel}
                  </Link>
                )}
              </div>
            ))}

            {/* Contact details */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-black text-white text-base mb-2">📍 Find Us</h3>
              <div className="space-y-2 text-sm">
                <p className="text-stone-400">7400 Niederwald Strasse<br />Niederwald, TX 78640</p>
                <p>
                  <a href="tel:+15124135948" className="text-stone-400 hover:text-amber-400 transition-colors">
                    (512) 413-5948
                  </a>
                </p>
                <p>
                  <a href="mailto:info@playgroundniederwald.com" className="text-stone-400 hover:text-amber-400 transition-colors text-xs">
                    info@playgroundniederwald.com
                  </a>
                </p>
                <p className="text-stone-500 text-xs pt-1">Mon–Fri · 9am – 9pm</p>
              </div>
              <div className="flex gap-4 pt-2">
                <a href="#" className="text-stone-500 hover:text-amber-400 transition-colors text-sm font-bold">Facebook</a>
                <a href="#" className="text-stone-500 hover:text-amber-400 transition-colors text-sm font-bold">Instagram</a>
                <a href="#" className="text-stone-500 hover:text-amber-400 transition-colors text-sm font-bold">Twitter</a>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤠</div>
                <h3 className="text-2xl font-black text-white mb-2">Message sent!</h3>
                <p className="text-stone-400 text-sm">
                  Much obliged, <strong className="text-white">{form.name}</strong>. We&apos;ll holler back
                  at <strong className="text-white">{form.email}</strong> real soon.
                </p>
                <button
                  onClick={() => { setForm(INITIAL); setSubmitted(false); }}
                  className="mt-8 text-amber-400 hover:text-amber-300 text-sm font-bold underline transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-white mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(512) 555-0100"
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Subject *</label>
                    <select
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" className="bg-stone-800">Select a topic...</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s} className="bg-stone-800">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your event, dates, group size, or anything else..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3 rounded-xl transition-colors uppercase tracking-widest text-sm"
                  >
                    Send Message
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

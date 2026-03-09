"use client";

import ProductCard from "@/components/ProductCard";
import PavilionMap from "@/components/PavilionMap";
import Link from "next/link";

const activities = [
  {
    icon: "🚂",
    title: "Train Rides",
    desc: "Our beloved open-air train loops the entire property. Free to ride with park entry — hop on as many times as you want.",
    tag: "Included with entry",
  },
  {
    icon: "🏋️",
    title: "Jumping Blob",
    desc: "The crown jewel. Launch yourself into the air off our giant inflatable blob. Scream-inducing fun for all ages.",
    tag: "Ticketed",
  },
  {
    icon: "🎠",
    title: "Play Zone",
    desc: "Sprawling playground structures — slides, climbing walls, swings, and more. Fully shaded for those Texas afternoons.",
    tag: "Included with entry",
  },
  {
    icon: "🎨",
    title: "Face Painting",
    desc: "Our pro face painters will turn your kids into tigers, butterflies, superheroes — you name it.",
    tag: "Add-on",
  },
];

export default function PlaygroundPage() {
  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Page Header */}
      <div className="bg-stone-900 border-b border-stone-800 py-12 px-6 text-center">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">The Park</p>
        <h1 className="text-4xl font-black text-white mb-2">Activities</h1>
        <p className="text-stone-400 text-base max-w-xl mx-auto">
          Hours of family fun — something for every age, every energy level, every Texas-sized appetite for adventure.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">

        {/* Activity Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((a) => (
              <div
                key={a.title}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex gap-4 hover:border-amber-500/30 transition-colors"
              >
                <span className="text-3xl flex-shrink-0">{a.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-white">{a.title}</h3>
                    <span className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Park Entry Tickets */}
        <section>
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">Get In</p>
          <h2 className="text-3xl font-black text-white mb-2">Park Entry</h2>
          <p className="text-stone-400 text-sm mb-6">Pre-purchase tickets online and skip the line at the gate.</p>
          <div className="max-w-xs">
            <ProductCard
              id="child-entry"
              title="Child Entry Ticket"
              price={10}
              description="Per child. Includes all general park attractions — play zone, train rides, and more."
              features={[
                "Jumping blob area access",
                "Free train rides",
                "Play zone access",
                "Valid for one day",
              ]}
              category="Park Entry"
            />
          </div>
        </section>

        {/* Paintball / Gellyball */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <div className="flex items-start gap-5">
            <span className="text-4xl flex-shrink-0">🎯</span>
            <div>
              <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">Private Parties Only</p>
              <h2 className="text-2xl font-black text-white mb-2">Paintball & Gellyball</h2>
              <p className="text-stone-400 mb-3 leading-relaxed text-sm">
                The ultimate group throwdown. Available for{" "}
                <strong className="text-white">private party bookings only</strong> — birthdays,
                team building, bachelor/bachelorette parties, and youth groups.
              </p>
              <p className="text-stone-500 text-xs mb-5">
                All equipment provided. Minimum group sizes apply. Contact us to lock in your date.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-2 px-6 rounded-xl transition-colors uppercase text-xs tracking-widest"
              >
                Contact Us to Book
              </Link>
            </div>
          </div>
        </section>

        {/* Pavilion Map */}
        <section>
          <PavilionMap />
        </section>

      </div>
    </div>
  );
}

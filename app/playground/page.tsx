"use client";

import ProductCard from "@/components/ProductCard";
import PavilionMap from "@/components/PavilionMap";
import Link from "next/link";

const activities = [
  { icon: "🚂", title: "Train Rides", desc: "Our open-air train loops the whole property. Hop on as many times as you want — it never gets old!", tag: "Included with entry", tagColor: "bg-green-100 text-green-700 border-green-200" },
  { icon: "🏋️", title: "Jumping Blob", desc: "Launch yourself into the air off our giant inflatable blob. Screams guaranteed. Total blast for every age!", tag: "Included with entry", tagColor: "bg-green-100 text-green-700 border-green-200" },
  { icon: "🎠", title: "Play Zone", desc: "Sprawling playground structures — slides, climbing walls, swings — all shaded for those hot Texas afternoons.", tag: "Included with entry", tagColor: "bg-green-100 text-green-700 border-green-200" },
  { icon: "💦", title: "Gel Blasters", desc: "Action-packed gel blaster battles for the whole family! Fun, safe, and seriously exciting for all ages.", tag: "Ticketed", tagColor: "bg-blue-100 text-blue-700 border-blue-200" },
  { icon: "🎨", title: "Face Painting", desc: "Our pro face painters will transform your kids into tigers, butterflies, superheroes — you name it!", tag: "Add-on", tagColor: "bg-pink-100 text-pink-700 border-pink-200" },
];

export default function PlaygroundPage() {
  return (
    <div className="bg-amber-50 min-h-screen">

      {/* Header */}
      <div className="bg-teal-700 py-12 px-6 text-center">
        <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">The Park</p>
        <h1 className="text-4xl font-black text-white mb-2">Activities</h1>
        <p className="text-teal-100 text-base max-w-xl mx-auto">
          Hours of family fun — something for every age, every energy level, and every Texas-sized appetite for adventure.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">

        {/* Activity Cards */}
        <section>
          <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">What's here</p>
          <h2 className="text-3xl font-black text-stone-800 mb-6">All Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((a) => (
              <div key={a.title} className="bg-white border-2 border-amber-100 rounded-2xl p-5 flex gap-4 hover:shadow-md hover:border-teal-200 transition-all">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {a.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-black text-stone-800">{a.title}</h3>
                    <span className={`text-xs border font-bold px-2 py-0.5 rounded-full ${a.tagColor}`}>
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Park Entry Tickets */}
        <section>
          <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Get In</p>
          <h2 className="text-3xl font-black text-stone-800 mb-2">Park Entry Tickets</h2>
          <p className="text-stone-500 text-sm mb-6">Pre-purchase online and skip the line at the gate!</p>
          <div className="max-w-xs">
            <ProductCard
              id="child-entry"
              title="Child Entry Ticket"
              price={10}
              description="Ages 3–12. One amazing day at the park — all included!"
              features={[
                "Jumping blob access",
                "Free train rides",
                "Full play zone access",
                "Valid for one day",
              ]}
              category="Park Entry"
            />
          </div>
        </section>

        {/* Gel Blasters */}
        <section className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">💦</div>
            <div>
              <p className="text-blue-600 text-xs uppercase tracking-widest font-bold mb-1">Action-Packed Fun</p>
              <h2 className="text-2xl font-black text-stone-800 mb-2">Gel Blasters</h2>
              <p className="text-stone-600 mb-3 leading-relaxed text-sm">
                Get ready for an epic battle! Gel blasters fire soft, water-filled gel beads that are safe,
                fun, and a total blast for kids and adults alike. Great for groups, birthday parties, and
                just a wild afternoon at the park.
              </p>
              <Link href="/contact" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-black py-2 px-6 rounded-xl transition-colors uppercase text-xs tracking-widest">
                Ask Us About Gel Blasters
              </Link>
            </div>
          </div>
        </section>

        {/* Paintball / Gellyball */}
        <section className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">🎯</div>
            <div>
              <p className="text-orange-600 text-xs uppercase tracking-widest font-bold mb-1">Private Parties Only</p>
              <h2 className="text-2xl font-black text-stone-800 mb-2">Paintball & Gellyball</h2>
              <p className="text-stone-600 mb-3 leading-relaxed text-sm">
                The ultimate group throwdown — available for <strong>private party bookings only</strong>.
                Perfect for birthdays, team building, bachelor/bachelorette parties, and youth groups.
              </p>
              <p className="text-stone-400 text-xs mb-4">All equipment provided. Contact us to book your date.</p>
              <Link href="/contact" className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-black py-2 px-6 rounded-xl transition-colors uppercase text-xs tracking-widest">
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

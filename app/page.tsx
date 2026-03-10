import Link from "next/link";
import Image from "next/image";

const activities = [
  { icon: "🚂", label: "Train Rides", color: "bg-amber-50 border-amber-200", iconBg: "bg-amber-100", desc: "Classic open-air train that loops the whole property. Hop on as many times as you like." },
  { icon: "🏋️", label: "Jumping Blob", color: "bg-teal-50 border-teal-200", iconBg: "bg-teal-100", desc: "Launch yourself sky-high off our giant inflatable blob. A fan favorite for every age!" },
  { icon: "🎠", label: "Play Zone", color: "bg-green-50 border-green-200", iconBg: "bg-green-100", desc: "Slides, climbing walls, swings, and more — all shaded for those Texas afternoons." },
  { icon: "🎨", label: "Face Painting", color: "bg-pink-50 border-pink-200", iconBg: "bg-pink-100", desc: "Pro face painters turning kids into their favorite animals, heroes, and characters." },
  { icon: "💦", label: "Gel Blasters", color: "bg-blue-50 border-blue-200", iconBg: "bg-blue-100", desc: "Exciting gel blaster battles for the whole crew — fun, safe, and action-packed!" },
  { icon: "🎶", label: "Live Music", color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-100", desc: "Open-air amphitheater hosting headliners and local acts all season long." },
];

const quickLinks = [
  { href: "/playground", label: "Activities", icon: "🤠", desc: "Train rides, blob, gel blasters, face painting, and pavilion bookings.", bg: "bg-amber-400", text: "text-stone-900" },
  { href: "/menu", label: "Food & Drinks", icon: "🌮", desc: "3 food trucks and sweet treats on-site.", bg: "bg-teal-700", text: "text-white" },
  { href: "/amphitheater", label: "Live Music", icon: "🎸", desc: "Upcoming shows, ticket info, and private events.", bg: "bg-purple-700", text: "text-white" },
  { href: "/contact", label: "Contact Us", icon: "📞", desc: "Book a pavilion, plan a party, or just say hey.", bg: "bg-orange-500", text: "text-white" },
];

export default function HomePage() {
  return (
    <div className="bg-amber-50">

      {/* ── Hero ── */}
      <section className="relative h-[90vh] min-h-[560px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="The Playground @niederwald sign"
          fill priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/55 via-stone-950/35 to-stone-950/85" />

        {/* Floating star accents */}
        <span className="absolute top-14 left-10 text-amber-400 text-4xl opacity-25 select-none">★</span>
        <span className="absolute top-20 right-16 text-amber-400 text-6xl opacity-15 select-none">★</span>
        <span className="absolute bottom-36 right-10 text-amber-400 text-3xl opacity-20 select-none">★</span>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-400/40 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <span className="text-amber-400">★</span>
            <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">
              Niederwald, Texas · Grand Opening May 3rd, 2026
            </span>
            <span className="text-amber-400">★</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-1 drop-shadow-2xl">THE</h1>
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-2 drop-shadow-2xl">
            <span className="text-amber-400">PLAYGROUND</span>
          </h1>
          <p className="text-stone-300 text-sm md:text-base font-bold tracking-[0.4em] uppercase mb-5">@niederwald</p>
          <p className="text-stone-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow">
            All the fun in one place — trains, food trucks, live music, gel blasters, and more right here in Texas!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/playground" className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3.5 px-9 rounded-2xl text-sm uppercase tracking-widest transition-colors shadow-lg shadow-amber-400/30">
              Explore the Park
            </Link>
            <Link href="/playground#pavilions" className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-bold py-3.5 px-9 rounded-2xl text-sm uppercase tracking-widest transition-colors">
              Book a Pavilion
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-white text-xs uppercase tracking-widest">Scroll</span>
          <span className="text-white animate-bounce">↓</span>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="bg-teal-700 py-3.5">
        <p className="text-center text-white font-black text-xs uppercase tracking-[0.3em]">
          ★ &nbsp; All The Fun In One Place &nbsp; ★ &nbsp; Niederwald, TX &nbsp; ★ &nbsp; Mon–Fri 9am–9pm &nbsp; ★ &nbsp; Grand Opening May 3rd, 2026 &nbsp; ★
        </p>
      </div>

      {/* ── Activities ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Something for everyone</p>
          <h2 className="text-4xl font-black text-stone-800">What's at the Park</h2>
          <p className="text-stone-500 mt-2 max-w-lg mx-auto text-sm">From toddlers to grandparents — we've got hours of fun waiting for your whole crew.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <div key={a.label} className={`bg-white rounded-2xl border-2 ${a.color} p-5 hover:shadow-md transition-all group`}>
              <div className={`w-12 h-12 ${a.iconBg} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                {a.icon}
              </div>
              <h3 className="text-base font-black text-stone-800 mb-1">{a.label}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/playground" className="inline-block bg-teal-700 hover:bg-teal-600 text-white font-black py-3 px-8 rounded-2xl uppercase tracking-widest text-sm transition-colors">
            See All Activities →
          </Link>
        </div>
      </section>

      {/* ── Facebook Videos ── */}
      <section className="bg-white border-y-2 border-amber-100 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">See It For Yourself</p>
            <h2 className="text-3xl font-black text-stone-800">From Our Facebook</h2>
            <p className="text-stone-400 text-sm mt-2">Watch our latest updates straight from the park.</p>
          </div>

          {/*
            HOW TO EMBED A REAL FACEBOOK VIDEO:
            1. Go to the Facebook video post on the park page
            2. Click ••• → Embed → copy the iframe src URL
            3. Replace the placeholder div below with:
               <iframe
                 src="PASTE_SRC_HERE"
                 width="100%" height="100%"
                 className="w-full h-full"
                 style={{ border: "none" }}
                 scrolling="no"
                 frameBorder="0"
                 allowFullScreen
                 allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
               />
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl overflow-hidden border-2 border-amber-100 aspect-video bg-amber-50 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-3">📹</div>
              <p className="text-stone-700 font-black mb-1">Video Coming Soon</p>
              <p className="text-stone-400 text-xs">Facebook video embed goes here</p>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-amber-100 aspect-video bg-amber-50 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-stone-700 font-black mb-1">Behind the Scenes</p>
              <p className="text-stone-400 text-xs">Second Facebook video embed goes here</p>
            </div>
          </div>

          <div className="text-center mt-5">
            <a href="https://www.facebook.com/playgroundniederwald" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-sm transition-colors">
              Follow us on Facebook →
            </a>
          </div>
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">Explore More</p>
          <h2 className="text-3xl font-black text-stone-800">Everything at The Playground</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`${link.bg} ${link.text} rounded-2xl p-6 hover:scale-[1.02] transition-transform group`}>
              <div className="text-3xl mb-3">{link.icon}</div>
              <h3 className="text-base font-black mb-1">{link.label}</h3>
              <p className={`text-sm leading-relaxed mb-3 ${link.text === "text-white" ? "opacity-75" : "text-stone-700"}`}>{link.desc}</p>
              <p className={`text-xs font-bold uppercase tracking-wider ${link.text === "text-white" ? "opacity-90" : ""}`}>
                Learn more →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Grand Opening CTA ── */}
      <section className="bg-teal-700 py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-4 left-8 text-amber-400 text-5xl opacity-20 select-none">★</div>
        <div className="absolute bottom-4 right-8 text-amber-400 text-7xl opacity-10 select-none">★</div>
        <div className="relative max-w-xl mx-auto">
          <div className="text-5xl mb-4">🤠</div>
          <h2 className="text-4xl font-black text-white mb-2">Grand Opening</h2>
          <p className="text-amber-400 text-3xl font-black mb-4">May 3rd, 2026</p>
          <p className="text-teal-100 leading-relaxed mb-8">
            Be among the first through the gates. We can&apos;t wait to see y&apos;all out here!
          </p>
          <Link href="/contact" className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3 px-10 rounded-2xl uppercase tracking-widest transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

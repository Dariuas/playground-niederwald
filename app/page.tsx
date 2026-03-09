import Link from "next/link";
import Image from "next/image";

const activities = [
  { icon: "🚂", label: "Train Rides", desc: "Classic open-air train that loops the property. Beloved by every age." },
  { icon: "🏋️", label: "Jumping Blob", desc: "High-flying inflatable blob launch. Pure, unadulterated chaos — in the best way." },
  { icon: "🎠", label: "Play Zone", desc: "Sprawling playground equipment for the little ones to climb, slide, and explore." },
  { icon: "🎨", label: "Face Painting", desc: "Pro face painters turning kids into their favorite animals and characters." },
  { icon: "🎯", label: "Paintball & Gellyball", desc: "Private party bookings only. Contact us to set up your group battle." },
  { icon: "🎶", label: "Live Music", desc: "Open-air amphitheater hosting headliners and local acts all season long." },
];

const quickLinks = [
  {
    href: "/playground",
    label: "Activities",
    icon: "🤠",
    desc: "Everything to do at the park — blob, train, play zone, pavilion bookings.",
    color: "from-amber-500/15 to-orange-600/5",
    border: "border-amber-500/25",
  },
  {
    href: "/menu",
    label: "Food & Drinks",
    icon: "🌮",
    desc: "3 food trucks, snacks, sweet treats — pickup on-site.",
    color: "from-orange-500/15 to-red-600/5",
    border: "border-orange-500/25",
  },
  {
    href: "/amphitheater",
    label: "Live Music",
    icon: "🎸",
    desc: "Upcoming headliners, event schedule, and ticket info.",
    color: "from-purple-500/15 to-indigo-600/5",
    border: "border-purple-500/25",
  },
  {
    href: "/contact",
    label: "Contact & Rentals",
    icon: "📞",
    desc: "Reserve a gazebo, plan a full park buyout, or just reach out.",
    color: "from-teal-500/15 to-cyan-600/5",
    border: "border-teal-500/25",
  },
];

// ── Replace this URL with any Facebook video URL from the park's page ──
const FACEBOOK_VIDEO_URL = "https://www.facebook.com/playgroundniederwald/videos/123456789";
const FB_EMBED_SRC = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(FACEBOOK_VIDEO_URL)}&width=640&show_text=false&height=360&appId=`;

export default function HomePage() {
  return (
    <div className="bg-stone-950">

      {/* ── Hero with real park photo ── */}
      <section className="relative h-[90vh] min-h-[560px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/hero.jpg"
          alt="The Playground @niederwald sign with park grounds behind it"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay — heavier at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/40 to-stone-950/90" />

        {/* Subtle star accents */}
        <div className="absolute top-12 left-10 text-amber-400 text-4xl opacity-20 select-none">★</div>
        <div className="absolute top-24 right-16 text-amber-400 text-6xl opacity-10 select-none">★</div>
        <div className="absolute bottom-32 right-10 text-amber-400 text-3xl opacity-15 select-none">★</div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-400/30 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">
              Niederwald, Texas · Grand Opening Mid-March 2026
            </span>
            <span className="text-amber-400 text-xs">★</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none mb-1 drop-shadow-2xl">
            THE
          </h1>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-2 drop-shadow-2xl">
            <span className="text-amber-400">PLAYGROUND</span>
          </h1>
          <p className="text-stone-300 text-sm md:text-base font-bold tracking-[0.4em] uppercase mb-6">
            @niederwald
          </p>
          <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow">
            All the fun in one place. Trains, food trucks, live music, jumping blobs, and more — right in the heart of Texas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/playground"
              className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3.5 px-9 rounded-2xl text-sm uppercase tracking-widest transition-colors shadow-lg shadow-amber-400/25"
            >
              Explore the Park
            </Link>
            <Link
              href="/playground#pavilions"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-bold py-3.5 px-9 rounded-2xl text-sm uppercase tracking-widest transition-colors"
            >
              Book a Pavilion
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-stone-400 text-xs uppercase tracking-widest">Scroll</span>
          <span className="text-stone-400 animate-bounce">↓</span>
        </div>
      </section>

      {/* ── Ticker banner ── */}
      <div className="bg-amber-400 py-3.5 overflow-hidden">
        <p className="text-center text-stone-900 font-black text-xs uppercase tracking-[0.35em]">
          ★ &nbsp; All The Fun In One Place &nbsp; ★ &nbsp; Niederwald, TX &nbsp; ★ &nbsp; Mon–Fri 9am–9pm &nbsp; ★ &nbsp; Grand Opening Mid-March 2026 &nbsp; ★
        </p>
      </div>

      {/* ── Activities ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">What We've Got</p>
          <h2 className="text-3xl font-black text-white">Activities</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => (
            <div
              key={a.label}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/40 transition-colors group"
            >
              <span className="text-3xl mb-3 block">{a.icon}</span>
              <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors mb-1">{a.label}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Facebook Video Section ── */}
      <section className="bg-stone-900 border-y border-stone-800 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">See It For Yourself</p>
            <h2 className="text-3xl font-black text-white">From Our Facebook</h2>
            <p className="text-stone-500 text-sm mt-2">
              Watch our latest videos and updates straight from the park.
            </p>
          </div>

          {/*
            ── HOW TO UPDATE THIS VIDEO ──
            1. Go to the Facebook video post on the park page
            2. Click the "..." menu → Embed
            3. Copy the iframe src URL and replace FB_EMBED_SRC above
               OR replace the src below directly.
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video placeholder 1 — replace src with actual FB video embed URL */}
            <div className="rounded-2xl overflow-hidden border border-stone-700 aspect-video bg-stone-800 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-3">📹</div>
              <p className="text-white font-black mb-1">Video Coming Soon</p>
              <p className="text-stone-500 text-xs">
                Replace this block with a Facebook video embed.<br />
                See code comment in <code className="text-amber-400">app/page.tsx</code> for instructions.
              </p>
            </div>

            {/* Video placeholder 2 */}
            <div className="rounded-2xl overflow-hidden border border-stone-700 aspect-video bg-stone-800 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-white font-black mb-1">Behind the Scenes</p>
              <p className="text-stone-500 text-xs">
                Second Facebook video embed goes here.
              </p>
            </div>
          </div>

          {/* Example of a real embed (commented out — uncomment and update URL to activate):
          <iframe
            src={FB_EMBED_SRC}
            width="100%"
            height="360"
            className="rounded-2xl border border-stone-700"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
          */}

          <div className="text-center mt-6">
            <a
              href="https://www.facebook.com/playgroundniederwald"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors text-sm font-bold"
            >
              Follow us on Facebook →
            </a>
          </div>
        </div>
      </section>

      {/* ── Gallery Placeholder ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">The Grounds</p>
          <h2 className="text-3xl font-black text-white">Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["Play Zone", "Train Rides", "Jumping Blob", "Food Trucks", "Shaded Gazebos", "Live Music"].map((label) => (
            <div
              key={label}
              className="aspect-video bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className="text-stone-700 text-xs">Photos coming soon</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Explore quick links ── */}
      <section className="border-t border-stone-900 bg-stone-950 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">Explore More</p>
            <h2 className="text-3xl font-black text-white">Everything at The Playground</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`bg-gradient-to-br ${link.color} border ${link.border} rounded-2xl p-5 hover:scale-[1.02] transition-transform group`}
              >
                <div className="text-3xl mb-3">{link.icon}</div>
                <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors mb-1">{link.label}</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-3">{link.desc}</p>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Learn more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grand Opening CTA ── */}
      <section className="relative overflow-hidden bg-stone-900 border-t border-stone-800 py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/20 via-transparent to-orange-950/20" />
        <div className="relative max-w-xl mx-auto">
          <div className="text-5xl mb-4">🤠</div>
          <h2 className="text-3xl font-black text-white mb-2">Grand Opening — Mid-March 2026</h2>
          <p className="text-stone-400 leading-relaxed mb-8 text-sm">
            Be among the first through the gates. We can&apos;t wait to see y&apos;all out here.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3 px-10 rounded-2xl uppercase tracking-widest transition-colors text-sm"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

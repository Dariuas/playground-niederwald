import { events } from "@/data/events";
import EventCard from "@/components/EventCard";

export default function AmphitheaterPage() {
  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="bg-stone-950 min-h-screen">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800 py-16 px-6 text-center">
        <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">Under the Open Sky</p>
        <h1 className="text-5xl font-black text-white mb-3">Live Music</h1>
        <p className="text-stone-400 text-lg max-w-xl mx-auto">
          Headliners, local acts, and everything in between — live at The Playground amphitheater.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">

        {/* Venue */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">🎸</div>
              <p className="text-stone-500 text-sm">Amphitheater photo coming soon</p>
            </div>
          </div>
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">The Venue</p>
            <h2 className="text-3xl font-black text-white mb-4">Open-Air Amphitheater</h2>
            <p className="text-stone-400 mb-4 leading-relaxed">
              Our open-air amphitheater is a one-of-a-kind outdoor concert experience right here in
              Niederwald. Professional sound and lighting, natural surroundings, and a real Texas
              atmosphere — whether you&apos;re watching a bluegrass set or a full big-band show.
            </p>
            <ul className="space-y-2 text-sm text-stone-400">
              {[
                "🎤 Pro stage, sound & lighting rig",
                "🌳 Open-air natural setting",
                "🍻 Bar service at select events",
                "🏡 Adjacent Pavilion E for pre-show groups",
                "🅿️ On-site parking",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Upcoming Shows */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">On the Calendar</p>
              <h2 className="text-3xl font-black text-white">Upcoming Shows</h2>
            </div>
            <span className="text-stone-600 text-sm">
              {upcoming.length} show{upcoming.length !== 1 ? "s" : ""} scheduled
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl text-center py-20">
              <div className="text-5xl mb-4">🎵</div>
              <p className="text-white font-black text-xl mb-2">Lineup dropping soon.</p>
              <p className="text-stone-500 text-sm">Check back or follow us on social to stay in the loop.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Past events */}
        {past.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-stone-600 mb-4 uppercase tracking-wider">Past Shows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-40">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Private events CTA */}
        <section className="relative overflow-hidden bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/30 via-transparent to-indigo-950/30" />
          <div className="relative">
            <div className="text-5xl mb-4">🎤</div>
            <h2 className="text-3xl font-black text-white mb-2">Host a Private Event</h2>
            <p className="text-stone-400 max-w-xl mx-auto mb-8 leading-relaxed">
              The amphitheater is available for private buyouts — weddings, corporate events, birthdays,
              you name it. Reach out and let&apos;s make it happen.
            </p>
            <a
              href="/contact"
              className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3 px-10 rounded-2xl uppercase tracking-widest transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

import { events } from "@/data/events";
import EventCard from "@/components/EventCard";

export default function AmphitheaterPage() {
  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="bg-teal-700 py-12 px-6 text-center">
        <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">Under the Open Sky</p>
        <h1 className="text-4xl font-black text-white mb-2">Live Music</h1>
        <p className="text-teal-100 text-base max-w-xl mx-auto">
          Headliners, local acts, and everything in between — live at The Playground amphitheater.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">

        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-white border-2 border-amber-100 rounded-2xl h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">🎸</div>
              <p className="text-stone-400 text-sm">Amphitheater photo coming soon</p>
            </div>
          </div>
          <div>
            <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-2">The Venue</p>
            <h2 className="text-3xl font-black text-stone-800 mb-3">Open-Air Amphitheater</h2>
            <p className="text-stone-600 mb-4 leading-relaxed text-sm">
              Our open-air amphitheater delivers a one-of-a-kind outdoor concert experience right here in
              Niederwald. Professional sound and lighting, natural Texas surroundings, and the kind of
              atmosphere you just can&apos;t find indoors.
            </p>
            <ul className="space-y-2 text-sm text-stone-500">
              {["🎤 Pro stage, sound & lighting", "🌳 Open-air natural setting", "🍻 Bar service at select events", "🏡 Adjacent Pavilion E for pre-show groups", "🅿️ On-site parking"].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">On the Calendar</p>
              <h2 className="text-3xl font-black text-stone-800">Upcoming Shows</h2>
            </div>
            <span className="text-stone-400 text-sm">{upcoming.length} show{upcoming.length !== 1 ? "s" : ""}</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-white border-2 border-amber-100 rounded-2xl text-center py-16">
              <div className="text-5xl mb-3">🎵</div>
              <p className="text-stone-800 font-black text-xl mb-1">Lineup dropping soon.</p>
              <p className="text-stone-400 text-sm">Follow us on Facebook to stay in the loop.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-stone-400 mb-4 uppercase tracking-wider">Past Shows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-50">
              {past.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        <section className="bg-teal-700 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-4 right-6 text-amber-400 text-5xl opacity-20">★</div>
          <h2 className="text-3xl font-black text-white mb-2">Host a Private Event</h2>
          <p className="text-teal-100 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
            The amphitheater is available for private buyouts — weddings, corporate events, parties and more.
            Reach out and let&apos;s make it happen!
          </p>
          <a href="/contact" className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black py-3 px-10 rounded-2xl uppercase tracking-widest transition-colors">
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
}

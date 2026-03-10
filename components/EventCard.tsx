import { Event } from "@/data/events";

interface EventCardProps {
  event: Event;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:border-teal-200 transition-all group">
      <div className="bg-teal-700 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-amber-300 text-xs uppercase tracking-widest font-bold">Upcoming Show</p>
          <p className="text-white text-sm font-semibold mt-0.5">{formatDate(event.date)}</p>
        </div>
        <span className="text-amber-300 text-2xl opacity-60 group-hover:opacity-100 transition-opacity">★</span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-black text-stone-800 mb-1">{event.artist}</h3>
        <span className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold px-2 py-0.5 rounded-full mb-3 self-start uppercase tracking-wider">
          {event.genre}
        </span>
        <p className="text-stone-500 text-sm leading-relaxed flex-1">{event.description}</p>

        <a
          href={event.ticketUrl ?? "#"}
          className="mt-4 block text-center bg-teal-700 hover:bg-teal-600 text-white font-black py-2 px-4 rounded-xl transition-colors uppercase text-sm tracking-wider"
        >
          Get Tickets
        </a>
      </div>
    </div>
  );
}

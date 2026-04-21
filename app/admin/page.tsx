import Link from "next/link";

const cards = [
  {
    href: "/admin/bookings",
    icon: "📅",
    label: "Bookings",
    desc: "View and manage pavilion reservations",
    bg: "bg-teal-50",
    border: "border-teal-200",
    iconBg: "bg-teal-100",
  },
  {
    href: "/admin/pricing",
    icon: "💲",
    label: "Pricing",
    desc: "Update ticket and activity prices",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    href: "/admin/products",
    icon: "🏷",
    label: "Products",
    desc: "Manage menu items and merchandise",
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
  },
  {
    href: "/admin/schedule",
    icon: "🗓",
    label: "Schedule",
    desc: "Set park hours and event calendar",
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
  },
];

export default async function AdminDashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-teal-600 text-xs uppercase tracking-widest font-bold mb-1">
          Welcome back
        </p>
        <h1 className="text-3xl font-black text-stone-800">
          Admin Dashboard
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Here&apos;s your admin overview for The Playground @niederwald.
        </p>
      </div>

      {/* Quick-action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`${card.bg} border-2 ${card.border} rounded-2xl p-5 hover:shadow-md hover:scale-[1.02] transition-all group`}
          >
            <div
              className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center text-2xl mb-3`}
            >
              {card.icon}
            </div>
            <h2 className="text-stone-800 font-black text-base mb-1">{card.label}</h2>
            <p className="text-stone-500 text-xs leading-relaxed">{card.desc}</p>
            <p className="text-teal-600 text-xs font-bold uppercase tracking-wider mt-3 group-hover:text-teal-700">
              Open →
            </p>
          </Link>
        ))}
      </div>

      {/* Placeholder notice */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            🚧
          </div>
          <div>
            <h3 className="text-stone-800 font-black text-base mb-1">Dashboard Coming Soon</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Booking stats, revenue summaries, and quick actions will appear here. Use the sidebar navigation to manage your park for now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

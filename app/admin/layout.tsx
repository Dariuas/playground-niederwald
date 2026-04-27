import { requireAuth } from "@/lib/adminAuth";
import Link from "next/link";

export const runtime = "nodejs";

const navItems = [
  { href: "/admin",           label: "Dashboard",      icon: "▦"  },
  { href: "/admin/bookings",  label: "Bookings",       icon: "📅" },
  { href: "/admin/sales",     label: "Sales",          icon: "💰" },
  { href: "/admin/schedule",  label: "Schedule",       icon: "🗓" },
  { href: "/admin/pricing",   label: "Pricing",        icon: "💲" },
  { href: "/admin/products",  label: "Products",       icon: "🏷" },
  { href: "/admin/pavilions", label: "Map & Pavilions", icon: "🗺" },
  { href: "/admin/content",   label: "Content",        icon: "📢" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#0d9488" }}>
        {/* Brand */}
        <div className="px-6 py-6 border-b border-teal-500/40">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-amber-400 text-lg select-none">★</span>
            <span className="text-white font-black text-sm tracking-wide leading-tight">The Playground</span>
          </div>
          <p className="text-teal-200 text-xs font-semibold tracking-widest ml-6">@niederwald</p>
          <p className="text-teal-300 text-[10px] uppercase tracking-widest mt-2 ml-6 font-bold">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-teal-100 hover:bg-teal-700/60 hover:text-white transition-colors text-sm font-semibold">
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-5 pt-2 border-t border-teal-500/40">
          <form action="/api/admin/logout" method="POST">
            <button type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-teal-200 hover:bg-teal-700/60 hover:text-white transition-colors text-sm font-semibold">
              <span className="text-base w-5 text-center">↩</span>
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <p className="text-stone-500 text-xs uppercase tracking-widest font-bold">Admin Dashboard</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-sm">
              A
            </div>
            <span className="text-stone-600 text-sm font-semibold">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

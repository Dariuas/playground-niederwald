"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Activities" },
  { href: "/amphitheater", label: "Live Music" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="bg-stone-900 text-white shadow-lg sticky top-0 z-50 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">★</span>
          <div className="leading-tight">
            <p className="text-white font-black text-sm tracking-widest uppercase">The Playground</p>
            <p className="text-amber-400 text-xs font-semibold tracking-widest">@niederwald</p>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-stone-400 hover:text-amber-400 transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/checkout"
            className="relative flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-bold px-3 py-2 rounded-full transition-colors"
          >
            <span>🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Book CTA */}
          <Link
            href="/playground#pavilions"
            className="hidden md:inline-block bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xs px-4 py-2 rounded-full uppercase tracking-widest transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 ml-1 rounded hover:bg-stone-800 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1">
            <span className={`block h-0.5 bg-amber-400 transition-all duration-200 ${open ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 bg-amber-400 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-amber-400 transition-all duration-200 ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-stone-950 border-t border-stone-800 px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-stone-300 hover:text-amber-400 transition-colors text-sm uppercase tracking-widest font-bold py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/checkout"
              className="bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest"
              onClick={() => setOpen(false)}
            >
              🛒 Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
            <Link
              href="/playground#pavilions"
              className="bg-amber-400 text-stone-900 font-black text-xs px-4 py-2 rounded-full uppercase tracking-widest"
              onClick={() => setOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

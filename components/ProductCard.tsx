"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  description: string;
  features?: string[];
  highlight?: boolean;
  category?: string;
}

export default function ProductCard({
  id,
  title,
  price,
  description,
  features = [],
  highlight = false,
  category = "Ticket",
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ id, name: title, price, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div
      className={`rounded-2xl flex flex-col p-6 transition-shadow hover:shadow-xl ${
        highlight
          ? "bg-amber-400 text-stone-900 ring-2 ring-amber-300 shadow-lg shadow-amber-400/20"
          : "bg-stone-800 text-white border border-stone-700"
      }`}
    >
      {highlight && (
        <span className="self-start mb-3 bg-stone-900 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
          ★ Most Popular
        </span>
      )}
      <h3 className={`text-lg font-bold ${highlight ? "text-stone-900" : "text-white"}`}>{title}</h3>
      <p className={`text-4xl font-black mt-1 mb-2 ${highlight ? "text-stone-900" : "text-amber-400"}`}>
        ${price.toFixed(2)}
      </p>
      <p className={`text-sm mb-4 leading-relaxed ${highlight ? "text-stone-700" : "text-stone-400"}`}>{description}</p>

      {features.length > 0 && (
        <ul className="text-sm space-y-1.5 mb-6 flex-1">
          {features.map((f) => (
            <li key={f} className={`flex items-start gap-2 ${highlight ? "text-stone-800" : "text-stone-300"}`}>
              <span className={`mt-0.5 font-bold ${highlight ? "text-stone-900" : "text-amber-400"}`}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleAdd}
        className={`mt-auto font-black py-2.5 px-4 rounded-xl transition-all uppercase text-sm tracking-wider ${
          added
            ? "bg-green-500 text-white scale-95"
            : highlight
            ? "bg-stone-900 hover:bg-stone-800 text-amber-400"
            : "bg-amber-400 hover:bg-amber-300 text-stone-900"
        }`}
      >
        {added ? "✓ Added!" : "Add to Cart"}
      </button>
    </div>
  );
}

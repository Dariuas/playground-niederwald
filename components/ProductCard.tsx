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
      className={`rounded-2xl flex flex-col p-6 transition-all hover:shadow-lg ${
        highlight
          ? "bg-teal-700 text-white ring-4 ring-teal-300 shadow-xl"
          : "bg-white border-2 border-amber-100 shadow-sm"
      }`}
    >
      {highlight && (
        <span className="self-start mb-3 bg-amber-400 text-stone-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
          ★ Most Popular
        </span>
      )}
      <h3 className={`text-lg font-bold ${highlight ? "text-white" : "text-stone-800"}`}>{title}</h3>
      <p className={`text-4xl font-black mt-1 mb-2 ${highlight ? "text-amber-300" : "text-teal-700"}`}>
        ${price.toFixed(2)}
      </p>
      <p className={`text-sm mb-4 leading-relaxed ${highlight ? "text-teal-100" : "text-stone-500"}`}>{description}</p>

      {features.length > 0 && (
        <ul className="text-sm space-y-1.5 mb-6 flex-1">
          {features.map((f) => (
            <li key={f} className={`flex items-start gap-2 ${highlight ? "text-teal-100" : "text-stone-600"}`}>
              <span className={`mt-0.5 font-bold ${highlight ? "text-amber-300" : "text-teal-600"}`}>✓</span>
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
            ? "bg-amber-400 hover:bg-amber-300 text-stone-900"
            : "bg-teal-700 hover:bg-teal-600 text-white"
        }`}
      >
        {added ? "✓ Added!" : "Add to Cart"}
      </button>
    </div>
  );
}

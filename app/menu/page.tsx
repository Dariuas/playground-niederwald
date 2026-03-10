"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface MenuItem { id: string; name: string; desc: string; price: number; }
interface Category { id: string; name: string; emoji: string; desc: string; items: MenuItem[]; }

const menuCategories: Category[] = [
  {
    id: "playful-bites", name: "Playful Bites", emoji: "🌽", desc: "Snacks and shareable bites for the whole crew.",
    items: [
      { id: "corn-dogs", name: "Mini Corn Dogs", desc: "Crispy cornmeal batter wrapped around juicy hot dogs, served with tangy dipping sauce.", price: 5.00 },
      { id: "nachos", name: "Cheesy Nachos", desc: "Crispy chips topped with melted cheese, jalapeños, and salsa.", price: 7.00 },
      { id: "veggie-skewers", name: "Veggie Skewers", desc: "Grilled seasonal vegetables on skewers with a zesty dipping sauce.", price: 6.00 },
    ],
  },
  {
    id: "family-favorites", name: "Family Favorites", emoji: "🍔", desc: "Hearty plates for hungry adventurers.",
    items: [
      { id: "cheeseburger", name: "Classic Cheeseburger", desc: "Juicy beef patty with cheddar, lettuce, tomato, and special sauce.", price: 10.00 },
      { id: "chicken-tenders", name: "Chicken Tenders", desc: "Crispy breaded chicken strips with honey mustard or BBQ sauce.", price: 8.00 },
      { id: "mac-cheese", name: "Mac and Cheese", desc: "Creamy macaroni baked with blended cheeses and a crunchy breadcrumb topping.", price: 9.00 },
    ],
  },
  {
    id: "sweet-treats", name: "Sweet Treats", emoji: "🍪", desc: "Because every adventure deserves a sweet finish.",
    items: [
      { id: "cookies", name: "Chocolate Chip Cookies", desc: "Freshly baked and loaded with chocolate chips.", price: 3.00 },
      { id: "popsicles", name: "Fruit Popsicles", desc: "Real fruit juice popsicles in various flavors.", price: 4.00 },
      { id: "brownie-sundae", name: "Brownie Sundae", desc: "Warm brownie with vanilla ice cream, chocolate sauce, and whipped cream.", price: 6.00 },
    ],
  },
];

function MenuItemCard({ item, category }: { item: MenuItem; category: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ id: item.id, name: item.name, price: item.price, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-teal-200 transition-all group">
      <div className="bg-amber-50 rounded-xl h-28 mb-4 flex items-center justify-center text-stone-300 text-xs">Photo coming soon</div>
      <h3 className="font-black text-stone-800 group-hover:text-teal-700 transition-colors mb-1 text-sm">{item.name}</h3>
      <p className="text-stone-400 text-xs leading-relaxed flex-1">{item.desc}</p>
      <div className="flex items-center justify-between mt-4">
        <p className="text-teal-700 font-black text-xl">${item.price.toFixed(2)}</p>
        <button
          onClick={handleAdd}
          className={`font-black text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wider ${added ? "bg-green-500 text-white scale-95" : "bg-teal-700 hover:bg-teal-600 text-white"}`}
        >
          {added ? "✓ Added" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { totalItems, totalPrice } = useCart();

  return (
    <div className="bg-amber-50 min-h-screen pb-24">
      <div className="bg-teal-700 py-12 px-6 text-center">
        <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">Eat Well, Play Hard</p>
        <h1 className="text-4xl font-black text-white mb-2">Food & Drinks</h1>
        <p className="text-teal-100 text-base max-w-xl mx-auto">Three food trucks, snacks, and sweet treats — all on-site.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">🛻</span>
            <div>
              <p className="text-stone-800 font-black text-sm">Pickup</p>
              <p className="text-stone-400 text-xs">Order at any food truck on-site. Ready in ~15 min.</p>
            </div>
          </div>
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl">📦</span>
            <div>
              <p className="text-stone-800 font-black text-sm">Pavilion Delivery</p>
              <p className="text-stone-400 text-xs">Coming soon!</p>
            </div>
          </div>
        </div>

        {menuCategories.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <h2 className="text-xl font-black text-stone-800">{cat.name}</h2>
                <p className="text-stone-400 text-xs">{cat.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cat.items.map((item) => <MenuItemCard key={item.id} item={item} category={cat.name} />)}
            </div>
          </section>
        ))}

        <div className="bg-teal-700 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🚚</div>
          <h3 className="text-white font-black text-lg mb-1">3 Food Trucks On-Site</h3>
          <p className="text-teal-100 text-sm max-w-md mx-auto">Operating during park hours with rotating daily specials. Come hungry!</p>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4">
          <div className="max-w-sm mx-auto bg-teal-700 rounded-2xl shadow-2xl px-5 py-4 flex items-center justify-between border-2 border-teal-500">
            <div>
              <p className="text-white font-black text-sm">{totalItems} item{totalItems !== 1 ? "s" : ""} in cart</p>
              <p className="text-teal-200 text-xs">${totalPrice.toFixed(2)} before tax</p>
            </div>
            <Link href="/checkout" className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-sm px-5 py-2.5 rounded-xl uppercase tracking-wider transition-colors">
              Checkout →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

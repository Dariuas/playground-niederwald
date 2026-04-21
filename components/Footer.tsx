import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-teal-900 text-teal-100 pt-14 pb-8 mt-0">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 text-2xl">★</span>
            <div>
              <p className="text-white font-black text-sm tracking-widest uppercase">The Playground</p>
              <p className="text-amber-400 text-xs tracking-widest">@niederwald</p>
            </div>
          </div>
          <p className="text-teal-300 text-sm leading-relaxed">
            All the fun in one place — right in the heart of Texas.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-teal-400 hover:text-amber-400 transition-colors text-sm font-bold">FB</a>
            <a href="#" className="text-teal-400 hover:text-amber-400 transition-colors text-sm font-bold">IG</a>
            <a href="#" className="text-teal-400 hover:text-amber-400 transition-colors text-sm font-bold">𝕏</a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-teal-300">
            <li><Link href="/playground" className="hover:text-amber-400 transition-colors">Activities</Link></li>
            <li><Link href="/amphitheater" className="hover:text-amber-400 transition-colors">Live Music</Link></li>
            <li><Link href="/playground#pavilions" className="hover:text-amber-400 transition-colors">Reserve a Pavilion</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Info</h4>
          <ul className="space-y-2 text-sm text-teal-300">
            <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            <li>Mon–Fri: 9am – 9pm</li>
            <li className="text-amber-400 font-bold">🎉 Grand Opening: May 3rd, 2026</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Find Us</h4>
          <ul className="space-y-2 text-sm text-teal-300">
            <li>7400 Niederwald Strasse<br />Niederwald, TX 78640</li>
            <li><a href="tel:+15125377554" className="hover:text-amber-400 transition-colors">(512) 537-7554</a></li>
            <li><a href="mailto:info@playgroundniederwald.com" className="hover:text-amber-400 transition-colors text-xs break-all">info@playgroundniederwald.com</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-teal-800">
        <p className="text-xs text-center text-teal-600 mb-3">Our Sponsors</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50">
          <span className="text-teal-300 text-sm font-semibold">Inspired Closets</span>
          <span className="text-teal-300 text-sm font-semibold">Step Onward Foundation</span>
          <span className="text-teal-300 text-sm font-semibold">Lemonade Float Co.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6 text-center text-xs text-teal-700">
        © {new Date().getFullYear()} The Playground @niederwald · Family Funfair · All rights reserved.
      </div>
    </footer>
  );
}

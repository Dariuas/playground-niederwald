import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 pt-14 pb-8 mt-0 border-t border-amber-500/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 text-2xl">★</span>
            <div>
              <p className="text-white font-black text-sm tracking-widest uppercase">The Playground</p>
              <p className="text-amber-400 text-xs tracking-widest">@niederwald</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed">
            All the fun in one place — right in the heart of Texas.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="text-stone-500 hover:text-amber-400 transition-colors text-lg">f</a>
            <a href="#" aria-label="Twitter" className="text-stone-500 hover:text-amber-400 transition-colors text-lg">𝕏</a>
            <a href="#" aria-label="Instagram" className="text-stone-500 hover:text-amber-400 transition-colors text-lg">◎</a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/playground" className="hover:text-amber-400 transition-colors">Activities</Link></li>
            <li><Link href="/menu" className="hover:text-amber-400 transition-colors">Food & Drinks</Link></li>
            <li><Link href="/amphitheater" className="hover:text-amber-400 transition-colors">Live Music</Link></li>
            <li><Link href="/playground#pavilions" className="hover:text-amber-400 transition-colors">Reserve a Pavilion</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Info</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            <li><span className="text-stone-500">Mon–Fri: 9am – 9pm</span></li>
            <li><span className="text-stone-500">Grand Opening: Mid-March 2026</span></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Find Us</h4>
          <ul className="space-y-2 text-sm">
            <li className="text-stone-400">7400 Niederwald Strasse<br />Niederwald, TX 78640</li>
            <li>
              <a href="tel:+15124135948" className="hover:text-amber-400 transition-colors">
                (512) 413-5948
              </a>
            </li>
            <li>
              <a href="mailto:info@playgroundniederwald.com" className="hover:text-amber-400 transition-colors text-xs break-all">
                info@playgroundniederwald.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Sponsors */}
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-8 border-t border-stone-800">
        <p className="text-xs uppercase tracking-widest text-stone-600 mb-4 text-center">Our Sponsors</p>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
          <span className="text-stone-400 text-sm font-semibold">Inspired Closets</span>
          <span className="text-stone-400 text-sm font-semibold">Step Onward Foundation</span>
          <span className="text-stone-400 text-sm font-semibold">Lemonade Float Co.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 text-center text-xs text-stone-700">
        © {new Date().getFullYear()} The Playground @niederwald · Family Funfair · All rights reserved.
      </div>
    </footer>
  );
}

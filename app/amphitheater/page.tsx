export default function AmphitheaterPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="bg-teal-700 py-12 px-6 text-center">
        <p className="text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">Under the Open Sky</p>
        <h1 className="text-4xl font-black text-white mb-2">Live Music</h1>
        <p className="text-teal-100 text-base max-w-xl mx-auto">
          Headliners, local acts, and everything in between — live at The Playground amphitheater.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🎵</div>
        <h2 className="text-3xl font-black text-stone-800 mb-3">Events Coming Soon</h2>
        <p className="text-stone-500 text-base leading-relaxed">
          We&apos;re booking acts and planning a great lineup. Follow us on Facebook to be the first to know when tickets go on sale.
        </p>
      </div>
    </div>
  );
}

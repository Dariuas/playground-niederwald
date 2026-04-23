"use client";

/** Inline SVG park map — structures drawn at exact pavilion data coordinates */
export default function ParkMapSVG() {
  // [cx, cy, baseR]
  const trees: [number, number, number][] = [
    // Top-left corner
    [68, 48, 22], [128, 40, 18], [172, 75, 20], [82, 115, 22], [158, 128, 18],
    [58, 172, 20], [202, 56, 18], [228, 138, 17],
    // Top area (between entrance and train station, avoiding spine)
    [340, 88, 19], [390, 60, 17], [445, 115, 18], [628, 75, 18],
    [690, 115, 19], [755, 75, 17],
    // Top-right corner
    [1192, 48, 22], [1142, 40, 18], [1098, 75, 20], [1185, 115, 20],
    [1148, 130, 18], [1218, 165, 18], [1058, 152, 17],
    // Left side (below E-W path, away from bar)
    [90, 560, 20], [65, 630, 18], [145, 690, 19], [80, 760, 20],
    [170, 780, 18], [220, 840, 17],
    // Bottom-left
    [62, 885, 22], [118, 908, 18], [172, 878, 20], [230, 895, 17],
    [340, 858, 18], [415, 908, 19],
    // Right side (upper, below train station)
    [1052, 295, 19], [1088, 405, 17], [1068, 515, 19], [1095, 620, 18],
    // Right side (lower)
    [1130, 698, 19], [1188, 775, 18], [1052, 795, 19], [1148, 868, 18],
    [1198, 838, 21], [1218, 898, 18],
    // Bottom-center / right
    [648, 778, 18], [698, 838, 19], [782, 798, 18], [828, 858, 19],
    [462, 818, 18], [498, 898, 16],
    // Upper-right mid (near train path area)
    [848, 138, 17], [822, 195, 16], [930, 118, 17], [998, 158, 17],
    [1038, 218, 17],
    // Center-left mid
    [268, 328, 18], [205, 415, 16],
  ];

  return (
    <svg
      viewBox="0 0 1270 952"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="gp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#aece68"/>
          <ellipse cx="14" cy="18" rx="4" ry="5" fill="#9ebe58" opacity="0.22"/>
          <ellipse cx="42" cy="8" rx="3" ry="4" fill="#bede7a" opacity="0.18"/>
          <ellipse cx="50" cy="48" rx="5" ry="3" fill="#9ebe58" opacity="0.16"/>
          <ellipse cx="28" cy="38" rx="4" ry="3" fill="#a8cc68" opacity="0.18"/>
        </pattern>
        <filter id="sh" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.22"/>
        </filter>
        <filter id="sh2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodOpacity="0.18"/>
        </filter>
      </defs>

      {/* ── Background ── */}
      <rect width="1270" height="952" fill="url(#gp)"/>
      {/* Outer fence */}
      <rect x="14" y="14" width="1242" height="924" fill="none" stroke="#6a9e3a" strokeWidth="9" rx="20"/>
      <rect x="19" y="19" width="1232" height="914" fill="none" stroke="#fff" strokeWidth="2.5" rx="18" opacity="0.28"/>

      {/* ── Trees (drawn before paths so paths overlay them) ── */}
      {trees.map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r + 5} fill="#2e5e12" opacity="0.55"/>
          <circle cx={cx - 3} cy={cy - 3} r={r} fill="#4a8228"/>
          <circle cx={cx + 4} cy={cy + 3} r={r - 4} fill="#62a03a" opacity="0.88"/>
          <circle cx={cx - 1} cy={cy - 7} r={r - 7} fill="#78b848" opacity="0.72"/>
        </g>
      ))}

      {/* ── Pathways ── */}
      {/* Entrance approach */}
      <rect x="481" y="808" width="104" height="144" fill="#d2b47a"/>

      {/* Main N-S spine */}
      <rect x="509" y="198" width="48" height="680" fill="#d2b47a" rx="3"/>
      <line x1="509" y1="198" x2="509" y2="870" stroke="#b49858" strokeWidth="1.5" opacity="0.55"/>
      <line x1="557" y1="198" x2="557" y2="870" stroke="#b49858" strokeWidth="1.5" opacity="0.55"/>

      {/* E-W cross path */}
      <rect x="140" y="456" width="912" height="44" fill="#d2b47a" rx="3"/>
      <line x1="140" y1="456" x2="1052" y2="456" stroke="#b49858" strokeWidth="1.5" opacity="0.48"/>
      <line x1="140" y1="500" x2="1052" y2="500" stroke="#b49858" strokeWidth="1.5" opacity="0.48"/>

      {/* Branch to Train Station (NE diagonal) */}
      <path d="M 557 280 Q 722 240 889 192" stroke="#d2b47a" strokeWidth="40" fill="none" strokeLinecap="round"/>

      {/* Branch to Gem Mining (SE curve) */}
      <path d="M 1005 492 Q 985 548 955 604" stroke="#d2b47a" strokeWidth="38" fill="none" strokeLinecap="round"/>

      {/* ── Train Tracks ── */}
      <path d="M 511 228 Q 700 208 889 192 Q 960 188 1028 195" stroke="#8a8a8a" strokeWidth="5" fill="none"/>
      <path d="M 511 236 Q 700 216 889 200 Q 960 196 1028 203" stroke="#8a8a8a" strokeWidth="5" fill="none"/>
      {/* Ties */}
      {[528,563,598,634,670,706,742,778,814,850,886,922,958,994,1025].map((tx, i) => {
        const pct = (tx - 511) / (1028 - 511);
        const ty = 232 + (199 - 232) * pct;
        return (
          <line key={i} x1={tx - 7} y1={ty - 7} x2={tx + 7} y2={ty + 7}
            stroke="#727272" strokeWidth="3.5" opacity="0.6"/>
        );
      })}

      {/* ── Entrance Gate ── */}
      <g transform="translate(533,789)" filter="url(#sh2)">
        <rect x="-58" y="-24" width="18" height="42" rx="3" fill="#c8aa72"/>
        <rect x="40"  y="-24" width="18" height="42" rx="3" fill="#c8aa72"/>
        <rect x="-62" y="-30" width="26" height="10" rx="3" fill="#dcc088"/>
        <rect x="36"  y="-30" width="26" height="10" rx="3" fill="#dcc088"/>
        <path d="M -40 -16 Q 0 -54 40 -16" stroke="#907040" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="-1" cy="-35" r="4" fill="#e8a020" opacity="0.9"/>
        <text x="0" y="32" textAnchor="middle" fontSize="13" fontFamily="sans-serif"
          fontWeight="700" fill="#4a3010" letterSpacing="2">ENTRANCE</text>
      </g>

      {/* ── Fire Pit ── */}
      <g transform="translate(533,228)">
        <circle r="36" fill="#b09878" opacity="0.95"/>
        <circle r="27" fill="#7a6048"/>
        <ellipse cx="0"  cy="4"  rx="9"  ry="12" fill="#e06018" opacity="0.95"/>
        <ellipse cx="-6" cy="6"  rx="6"  ry="9"  fill="#f09028" opacity="0.85"/>
        <ellipse cx="7"  cy="5"  rx="7"  ry="10" fill="#f08020" opacity="0.85"/>
        <ellipse cx="0"  cy="2"  rx="5"  ry="7"  fill="#f8b038" opacity="0.9"/>
        <text x="0" y="52" textAnchor="middle" fontSize="13" fontFamily="sans-serif"
          fontWeight="700" fill="#4a3010">Fire Pit</text>
      </g>

      {/* ── Train Station ── */}
      <g transform="translate(889,190)" filter="url(#sh)">
        <rect x="-52" y="-28" width="104" height="58" rx="5" fill="#ece0b8"/>
        <polygon points="-57,-28 0,-52 57,-28" fill="#b07838" opacity="0.9"/>
        <rect x="-9"  y="2"  width="18" height="28" rx="2" fill="#8a5e28"/>
        <rect x="-44" y="-16" width="20" height="14" rx="2" fill="#a8d0e4" opacity="0.85"/>
        <rect x="24"  y="-16" width="20" height="14" rx="2" fill="#a8d0e4" opacity="0.85"/>
        {/* Platform */}
        <rect x="-55" y="30" width="110" height="8" rx="2" fill="#c4a870" opacity="0.8"/>
        <text x="0" y="-57" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
          fontWeight="700" fill="#3a2808">Train Station</text>
      </g>

      {/* ── Games Pavilion ── */}
      <g transform="translate(978,390)" filter="url(#sh)">
        <rect x="-50" y="-30" width="100" height="60" rx="8" fill="#e2eaf8"/>
        <rect x="-50" y="-30" width="100" height="16" rx="5" fill="#3a6aaa" opacity="0.9"/>
        <rect x="-27" y="-5" width="18" height="18" rx="4" fill="#f8b030" opacity="0.95"/>
        <rect x="9"   y="-5" width="18" height="18" rx="4" fill="#f04848" opacity="0.9"/>
        <text x="0" y="46" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
          fontWeight="700" fill="#2a3a5a">Games</text>
      </g>

      {/* ── Gem Mining ── */}
      <g transform="translate(953,599)" filter="url(#sh)">
        <rect x="-48" y="-26" width="96" height="52" rx="6" fill="#ede2c2"/>
        <rect x="-17" y="-8" width="34" height="20" rx="3" fill="#8a5e38"/>
        <circle cx="-9"  cy="14" r="6" fill="#4a3018"/>
        <circle cx="9"   cy="14" r="6" fill="#4a3018"/>
        <polygon points="-7,-14 -3,-22 1,-14"  fill="#60a8f0"/>
        <polygon points="3,-14 7,-22 11,-14"   fill="#a060e8"/>
        <polygon points="-15,-10 -11,-20 -7,-10" fill="#f06880"/>
        <text x="0" y="40" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
          fontWeight="700" fill="#3a2808">Gem Mining</text>
      </g>

      {/* ── Bar ── */}
      <g transform="translate(190,476)" filter="url(#sh)">
        <rect x="-58" y="-32" width="116" height="64" rx="8" fill="#f2e4c4"/>
        <rect x="-63" y="-38" width="126" height="14" rx="5" fill="#a06e30" opacity="0.9"/>
        <rect x="-30" y="-30" width="60" height="18" rx="3" fill="#8a4e18"/>
        <text x="0" y="-17" textAnchor="middle" fontSize="13" fontFamily="sans-serif"
          fontWeight="700" fill="#fff0d0">BAR</text>
        <rect x="-20" y="4" width="13" height="18" rx="3" fill="#f0bc38" opacity="0.95"/>
        <rect x="7"   y="4" width="13" height="18" rx="3" fill="#f0bc38" opacity="0.95"/>
        <text x="0" y="44" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
          fontWeight="700" fill="#4a3010">Bar</text>
      </g>

      {/* ── Playground ── */}
      <g transform="translate(559,514)" filter="url(#sh)">
        <rect x="-48" y="-34" width="96" height="68" rx="8" fill="#f2ecd4" opacity="0.9"/>
        {/* Slide tower + ramp */}
        <rect x="-30" y="-24" width="13" height="28" rx="2" fill="#e84848" opacity="0.9"/>
        <line x1="-30" y1="4" x2="-8" y2="24" stroke="#cc3838" strokeWidth="5" strokeLinecap="round"/>
        {/* Swing set */}
        <line x1="10" y1="-24" x2="40" y2="-24" stroke="#907050" strokeWidth="4"/>
        <line x1="16" y1="-24" x2="16" y2="2" stroke="#705030" strokeWidth="2.5"/>
        <line x1="34" y1="-24" x2="34" y2="2" stroke="#705030" strokeWidth="2.5"/>
        <rect x="12" y="0" width="8" height="4" rx="1" fill="#907050"/>
        <rect x="30" y="0" width="8" height="4" rx="1" fill="#907050"/>
        <text x="0" y="48" textAnchor="middle" fontSize="12" fontFamily="sans-serif"
          fontWeight="700" fill="#3a2808">Playground</text>
      </g>

      {/* ── Pavilion Structures P1–P5 (standard size) ── */}
      {([
        [457, 352],
        [559, 352],
        [775, 400],
        [775, 495],
        [673, 590],
      ] as [number, number][]).map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`} filter="url(#sh2)">
          <rect x="-35" y="-26" width="70" height="52" rx="6" fill="#f5ede0"/>
          <rect x="-35" y="-26" width="70" height="13" rx="5" fill="#0d9488" opacity="0.88"/>
          <rect x="-31" y="-14" width="6" height="36" rx="2" fill="#c4a87a"/>
          <rect x="25"  y="-14" width="6" height="36" rx="2" fill="#c4a87a"/>
          <rect x="-14" y="-5" width="28" height="12" rx="2" fill="#d4a060" opacity="0.9"/>
          <rect x="-19" y="6"  width="38" height="4" rx="1" fill="#b88840" opacity="0.68"/>
          <rect x="-19" y="-14" width="38" height="4" rx="1" fill="#b88840" opacity="0.68"/>
        </g>
      ))}

      {/* ── Pavilion 6 — Playground Pavilion (larger, premium) ── */}
      <g transform="translate(381,619)" filter="url(#sh)">
        {/* Shadow base */}
        <rect x="-54" y="-36" width="108" height="72" rx="8" fill="#e8d8b8" opacity="0.6"/>
        {/* Main platform */}
        <rect x="-52" y="-34" width="104" height="68" rx="8" fill="#f8f0e0"/>
        {/* Amber premium roof band */}
        <rect x="-52" y="-34" width="104" height="16" rx="7" fill="#d97706" opacity="0.92"/>
        {/* Roof ridge line */}
        <rect x="-52" y="-22" width="104" height="3" fill="#b45309" opacity="0.5"/>
        {/* Corner posts (4) */}
        <rect x="-46" y="-20" width="7" height="50" rx="2" fill="#c4a87a"/>
        <rect x="39"  y="-20" width="7" height="50" rx="2" fill="#c4a87a"/>
        {/* Picnic tables x2 */}
        <rect x="-38" y="-8" width="32" height="12" rx="2" fill="#d4a060" opacity="0.9"/>
        <rect x="6"   y="-8" width="32" height="12" rx="2" fill="#d4a060" opacity="0.9"/>
        {/* Benches */}
        <rect x="-42" y="3"  width="40" height="4" rx="1" fill="#b88840" opacity="0.65"/>
        <rect x="2"   y="3"  width="40" height="4" rx="1" fill="#b88840" opacity="0.65"/>
        <rect x="-42" y="-16" width="40" height="4" rx="1" fill="#b88840" opacity="0.65"/>
        <rect x="2"   y="-16" width="40" height="4" rx="1" fill="#b88840" opacity="0.65"/>
        {/* Star badge — premium marker */}
        <circle cx="0" cy="26" r="8" fill="#fbbf24" opacity="0.9"/>
        <text x="0" y="30" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="900" fill="#78350f">★</text>
      </g>

      {/* ── Gel Blaster Range ── */}
      <g transform="translate(870,510)" filter="url(#sh2)">
        <rect x="-45" y="-30" width="90" height="60" rx="8" fill="#dcfce7" opacity="0.85"/>
        <rect x="-45" y="-30" width="90" height="14" rx="7" fill="#16a34a" opacity="0.8"/>
        {/* Target circles */}
        <circle cx="-20" cy="10" r="12" fill="none" stroke="#dc2626" strokeWidth="2.5" opacity="0.7"/>
        <circle cx="-20" cy="10" r="7"  fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.7"/>
        <circle cx="-20" cy="10" r="3"  fill="#dc2626" opacity="0.8"/>
        <circle cx="20"  cy="10" r="12" fill="none" stroke="#dc2626" strokeWidth="2.5" opacity="0.7"/>
        <circle cx="20"  cy="10" r="7"  fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.7"/>
        <circle cx="20"  cy="10" r="3"  fill="#dc2626" opacity="0.8"/>
        <text x="0" y="46" textAnchor="middle" fontSize="11" fontFamily="sans-serif"
          fontWeight="700" fill="#14532d">Gel Blasters</text>
      </g>

      {/* ── Branding badge ── */}
      <g transform="translate(1192,900)">
        <rect x="-88" y="-38" width="176" height="66" rx="10" fill="#fff" opacity="0.7"/>
        <rect x="-88" y="-38" width="176" height="66" rx="10" fill="none" stroke="#0d9488" strokeWidth="2" opacity="0.55"/>
        <text x="0" y="-14" textAnchor="middle" fontSize="11" fontFamily="sans-serif"
          fontWeight="800" fill="#0d9488" letterSpacing="2">THE PLAYGROUND</text>
        <text x="0" y="2" textAnchor="middle" fontSize="10" fontFamily="sans-serif"
          fontWeight="500" fill="#6a4e20" letterSpacing="1">@niederwald</text>
        <text x="0" y="16" textAnchor="middle" fontSize="9" fontFamily="sans-serif"
          fill="#999">Niederwald, TX  ·  Not to scale</text>
      </g>

      {/* ── Compass rose ── */}
      <g transform="translate(1196,80)">
        <circle r="28" fill="#fff" opacity="0.7"/>
        <circle r="28" fill="none" stroke="#bbb" strokeWidth="1.5"/>
        <polygon points="0,-20 3,-8 -3,-8" fill="#cc3333"/>
        <polygon points="0,20 3,8 -3,8" fill="#666"/>
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#999" strokeWidth="1.5"/>
        <text x="0" y="-23" textAnchor="middle" fontSize="9" fontFamily="sans-serif"
          fontWeight="700" fill="#cc3333">N</text>
        <text x="0" y="32" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#666">S</text>
        <text x="25" y="4" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#666">E</text>
        <text x="-25" y="4" textAnchor="middle" fontSize="9" fontFamily="sans-serif" fill="#666">W</text>
      </g>
    </svg>
  );
}

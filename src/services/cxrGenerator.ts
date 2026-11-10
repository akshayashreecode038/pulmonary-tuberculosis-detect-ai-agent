/**
 * Medical CXR Synthetic Radiograph Generator
 * Produces anatomically accurate chest radiography simulations with optional TB pathology
 */

export function generateSyntheticCXR(type: 'normal' | 'active_tb_cavitary' | 'bilateral_tb' | 'apical_nodular'): string {
  const isTB = type !== 'normal';
  const hasCavity = type === 'active_tb_cavitary';
  const hasBilateral = type === 'bilateral_tb';
  const hasApical = type === 'apical_nodular';

  // Return SVG data URI
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700" style="background:#090b10; font-family: monospace;">
  <defs>
    <!-- Lung glow filter -->
    <filter id="blur-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" />
    </filter>

    <!-- Lung gradient -->
    <radialGradient id="lung-grad-right" cx="45%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#07090e" />
      <stop offset="60%" stop-color="#141a24" />
      <stop offset="100%" stop-color="#2a3342" />
    </radialGradient>
    <radialGradient id="lung-grad-left" cx="55%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#07090e" />
      <stop offset="60%" stop-color="#141a24" />
      <stop offset="100%" stop-color="#2a3342" />
    </radialGradient>

    <!-- Infiltrate radial mask -->
    <radialGradient id="infiltrate-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.85" />
      <stop offset="40%" stop-color="#cbd5e1" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#94a3b8" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#64748b" stop-opacity="0" />
    </radialGradient>

    <!-- Cavity Wall Gradient -->
    <radialGradient id="cavity-wall" cx="48%" cy="48%" r="50%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="65%" stop-color="#0d1117" />
      <stop offset="75%" stop-color="#e2e8f0" stop-opacity="0.9" />
      <stop offset="90%" stop-color="#94a3b8" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#475569" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Radiographic Border & Exposure Mask -->
  <rect width="600" height="700" fill="#06080c" />
  <rect x="25" y="25" width="550" height="650" rx="16" fill="#0b0e14" stroke="#1e293b" stroke-width="1.5" />

  <!-- Radiologist Orientation Markers -->
  <text x="50" y="65" fill="#64748b" font-size="22" font-weight="bold">R</text>
  <text x="535" y="65" fill="#64748b" font-size="14">PA UPRIGHT</text>
  <text x="50" y="655" fill="#475569" font-size="11">CXR CHEST 120kVp 4mAs</text>
  <text x="440" y="655" fill="#475569" font-size="11">LAT: 0.12mm/px</text>

  <!-- Thoracic spine (central column) -->
  <g opacity="0.45">
    <rect x="290" y="100" width="20" height="480" rx="3" fill="#cbd5e1" />
    ${Array.from({ length: 14 }).map((_, i) => `
      <rect x="286" y="${120 + i * 32}" width="28" height="18" rx="4" fill="#f1f5f9" opacity="0.6" />
      <circle cx="300" cy="${129 + i * 32}" r="3" fill="#64748b" />
    `).join('')}
  </g>

  <!-- Neck and Trachea -->
  <path d="M260,30 L260,110 Q280,120 300,120 Q320,120 340,110 L340,30 Z" fill="#1e293b" opacity="0.7" />
  <rect x="294" y="50" width="12" height="110" rx="5" fill="#07090e" opacity="0.9" />

  <!-- Clavicles (collar bones) -->
  <g opacity="0.75" filter="url(#blur-filter)">
    <!-- Right Clavicle -->
    <path d="M290,140 Q210,135 120,125 Q105,125 95,135 Q105,145 125,140 Q210,150 290,146 Z" fill="#e2e8f0" />
    <!-- Left Clavicle -->
    <path d="M310,140 Q390,135 480,125 Q495,125 505,135 Q495,145 475,140 Q390,150 310,146 Z" fill="#e2e8f0" />
  </g>

  <!-- Lung Fields (Dark radiolucent air pockets) -->
  <!-- Right Lung Field (anatomical right = viewer left) -->
  <path d="M 280,160 
           Q 220,140 160,180 
           Q 90,260 85,420 
           Q 85,520 95,570 
           Q 130,550 200,535 
           Q 260,530 280,520 
           Z" 
        fill="url(#lung-grad-right)" />

  <!-- Left Lung Field (anatomical left = viewer right, accommodates heart) -->
  <path d="M 320,160 
           Q 380,140 440,180 
           Q 510,260 515,420 
           Q 515,520 505,570 
           Q 470,555 420,545 
           Q 360,540 330,510 
           Z" 
        fill="url(#lung-grad-left)" />

  <!-- Pulmonary Vascular Bronchovascular Markings -->
  <g opacity="0.35" stroke="#94a3b8" stroke-linecap="round" fill="none">
    <!-- Right hilum arborization -->
    <path d="M 265,310 Q 230,300 170,280" stroke-width="3" />
    <path d="M 265,315 Q 210,340 150,380" stroke-width="2.5" />
    <path d="M 265,320 Q 220,380 180,450" stroke-width="2" />
    <path d="M 220,300 Q 180,240 170,200" stroke-width="1.5" />

    <!-- Left hilum arborization -->
    <path d="M 335,300 Q 370,290 430,270" stroke-width="3" />
    <path d="M 335,305 Q 390,330 450,370" stroke-width="2.5" />
    <path d="M 335,310 Q 380,370 420,440" stroke-width="2" />
  </g>

  <!-- Posterior & Anterior Rib Pairs (Semi-transparent bones overlying lungs) -->
  <g opacity="0.4" stroke="#e2e8f0" fill="none" filter="url(#blur-filter)">
    ${[180, 220, 260, 305, 355, 410, 465, 515].map((y, idx) => `
      <!-- Right rib ${idx + 1} -->
      <path d="M 285,${y - 25} Q 180,${y - 10} 100,${y + 40} Q 150,${y + 70} 250,${y + 60}" stroke-width="${10 + idx * 0.5}" stroke-opacity="0.5" />
      <!-- Left rib ${idx + 1} -->
      <path d="M 315,${y - 25} Q 420,${y - 10} 500,${y + 40} Q 450,${y + 70} 350,${y + 60}" stroke-width="${10 + idx * 0.5}" stroke-opacity="0.5" />
    `).join('')}
  </g>

  <!-- Cardiac Silhouette & Aortic Arch (Central / Left sided heart) -->
  <g opacity="0.85" filter="url(#blur-filter)">
    <!-- Aortic Knob -->
    <path d="M 290,220 Q 320,205 340,230 Q 335,260 300,270 Z" fill="#cbd5e1" opacity="0.7" />
    <!-- Heart shadow (Apex pointing toward left lower chest) -->
    <path d="M 275,320 
             Q 285,420 280,470 
             Q 280,530 330,535 
             Q 400,535 425,480 
             Q 440,430 380,330 
             Q 340,290 300,290 
             Z" 
          fill="#cbd5e1" />
  </g>

  <!-- Diaphragm Domes and Costophrenic Angles -->
  <g opacity="0.9" filter="url(#blur-filter)">
    <!-- Right Hemi-diaphragm (slightly higher due to liver) -->
    <path d="M 75,590 Q 180,520 290,535 L 290,620 L 75,620 Z" fill="#94a3b8" />
    <!-- Left Hemi-diaphragm -->
    <path d="M 310,545 Q 420,535 525,595 L 525,620 L 310,620 Z" fill="#94a3b8" />
  </g>

  <!-- Gastric Bubble (Magenblase under left diaphragm) -->
  <ellipse cx="440" cy="575" rx="25" ry="14" fill="#080c14" opacity="0.75" />

  ${isTB && hasCavity ? `
  <!-- PATHOLOGY: ACTIVE PULMONARY TB - RIGHT UPPER LOBE CAVITATION -->
  <g id="tb-cavity">
    <!-- Surrounding consolidative infiltrate -->
    <circle cx="190" cy="235" r="48" fill="url(#infiltrate-grad)" filter="url(#soft-glow)" />
    <!-- Thick-walled cavitary lesion characteristic of post-primary TB -->
    <circle cx="190" cy="235" r="28" fill="url(#cavity-wall)" />
    <circle cx="188" cy="233" r="16" fill="#090d14" opacity="0.95" />
    <!-- Air-fluid level / inner wall irregularity -->
    <path d="M 174,236 Q 188,238 202,236 L 201,244 Q 188,245 175,243 Z" fill="#cbd5e1" opacity="0.6" />
    <!-- Satellite nodular densities in right apex -->
    <ellipse cx="160" cy="185" rx="7" ry="6" fill="#cbd5e1" opacity="0.7" filter="url(#blur-filter)" />
    <ellipse cx="225" cy="195" rx="9" ry="7" fill="#cbd5e1" opacity="0.65" filter="url(#blur-filter)" />
    <circle cx="145" cy="250" r="5" fill="#cbd5e1" opacity="0.6" filter="url(#blur-filter)" />
  </g>
  ` : ''}

  ${isTB && hasBilateral ? `
  <!-- PATHOLOGY: BILATERAL MILIARY / RETICULONODULAR TB -->
  <g id="tb-bilateral" filter="url(#blur-filter)">
    <!-- Right Upper & Mid Infiltrates -->
    <ellipse cx="180" cy="220" rx="35" ry="25" fill="url(#infiltrate-grad)" />
    <ellipse cx="170" cy="330" rx="28" ry="22" fill="url(#infiltrate-grad)" opacity="0.8" />
    <!-- Left Mid & Lower Infiltrates -->
    <ellipse cx="410" cy="260" rx="32" ry="24" fill="url(#infiltrate-grad)" />
    <ellipse cx="430" cy="390" rx="38" ry="30" fill="url(#infiltrate-grad)" opacity="0.85" />
    <!-- Miliary snowstorm pattern micro-nodules -->
    ${[
      [150, 210], [170, 240], [210, 215], [195, 270], [160, 310], [185, 345],
      [380, 230], [420, 245], [440, 280], [390, 320], [425, 360], [445, 410]
    ].map(([nx, ny]) => `
      <circle cx="${nx}" cy="${ny}" r="${3 + (nx % 3)}" fill="#e2e8f0" opacity="0.65" />
    `).join('')}
  </g>
  ` : ''}

  ${isTB && hasApical ? `
  <!-- PATHOLOGY: APICAL FIBRONODULAR SUSPICION -->
  <g id="tb-apical" filter="url(#soft-glow)">
    <path d="M 140,175 Q 180,165 210,195 Q 175,215 145,200 Z" fill="#e2e8f0" opacity="0.75" />
    <line x1="150" y1="180" x2="200" y2="230" stroke="#cbd5e1" stroke-width="2.5" opacity="0.8" />
    <circle cx="215" cy="210" r="8" fill="#cbd5e1" opacity="0.7" />
  </g>
  ` : ''}

  <!-- DICOM Scale & Reticle Overlay (subtle clinical aesthetic) -->
  <line x1="560" y1="300" x2="560" y2="400" stroke="#334155" stroke-width="2" />
  <line x1="555" y1="300" x2="565" y2="300" stroke="#334155" stroke-width="1.5" />
  <line x1="555" y1="350" x2="565" y2="350" stroke="#334155" stroke-width="1" />
  <line x1="555" y1="400" x2="565" y2="400" stroke="#334155" stroke-width="1.5" />
  <text x="568" y="354" fill="#475569" font-size="9">10 cm</text>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

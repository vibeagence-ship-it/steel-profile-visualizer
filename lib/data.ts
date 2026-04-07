// ─── Color Palette ───────────────────────────────────────────────────────────

export interface Color {
  name: string;
  ral: string;
  hex: string;
}

export const RAL_PALETTE: Color[] = [
  { name: "Ivoire clair",    ral: "RAL 1015", hex: "#E6D2B5" },
  { name: "Gris acier",      ral: "RAL 5008", hex: "#374B52" },
  { name: "Vert mousse",     ral: "RAL 6005", hex: "#284428" },
  { name: "Vert réséda",     ral: "RAL 6011", hex: "#587246" },
  { name: "Gris anthracite", ral: "RAL 7016", hex: "#383E42" },
  { name: "Gris ombrage",    ral: "RAL 7022", hex: "#4B4D4E" },
  { name: "Rouge brique",    ral: "RAL 8012", hex: "#7B3B2A" },
  { name: "Brun sépia",      ral: "RAL 8014", hex: "#4E3524" },
  { name: "Blanc grisâtre",  ral: "RAL 9002", hex: "#E7E3DC" },
  { name: "Noir foncé",      ral: "RAL 9005", hex: "#0E0E0E" },
  { name: "Aluminium blanc", ral: "RAL 9006", hex: "#A5A5A5" },
  { name: "Aluminium gris",  ral: "RAL 9007", hex: "#8F8F8F" },
];

// ─── Profile Configs ─────────────────────────────────────────────────────────

export interface ProfileConfig {
  id: string;
  name: string;
  description: string;
  type: "sandwich" | "cladding";
  /** Useful width in mm */
  width: number;
  /** Display length in mm */
  length: number;
  /** Wave/rib height in mm */
  waveHeight: number;
  /** Number of main waves across width */
  numWaves: number;
  /** Flat crest width in mm */
  crestWidth: number;
  /** Horizontal width of each slope in mm */
  slopeWidth: number;
  /** Steel sheet thickness in mm */
  sheetThickness: number;
  /** PIR/PUR core thickness in mm — sandwich panels only */
  coreThickness?: number;
}

export const PROFILES: ProfileConfig[] = [
  // ── Sandwich panels (toiture) ────────────────────────────────────────────
  {
    id: "sandwich-t39",
    name: "Sandwich T39",
    description: "Toiture · 1000 mm · 39 mm",
    type: "sandwich",
    width: 1000,
    length: 3000,
    waveHeight: 39,
    numWaves: 3,
    crestWidth: 80,
    slopeWidth: 35,
    sheetThickness: 1.5,
    coreThickness: 100,
  },
  {
    id: "sandwich-ts45",
    name: "Sandwich TS 1000",
    description: "Toiture · 1000 mm · 45 mm",
    type: "sandwich",
    width: 1000,
    length: 3000,
    waveHeight: 45,
    numWaves: 3,
    crestWidth: 85,
    slopeWidth: 38,
    sheetThickness: 1.5,
    coreThickness: 120,
  },
  {
    id: "sandwich-t79",
    name: "Tôle T79",
    description: "Toiture · 1000 mm · 79 mm",
    type: "sandwich",
    width: 1000,
    length: 3000,
    waveHeight: 79,
    numWaves: 3,
    crestWidth: 80,
    slopeWidth: 50,
    sheetThickness: 1.5,
    coreThickness: 150,
  },
  // ── Cladding panels (façade/bardage) ─────────────────────────────────────
  {
    id: "cladding-t29",
    name: "Bardage T29",
    description: "Façade · 850 mm · 29 mm",
    type: "cladding",
    width: 850,
    length: 3000,
    waveHeight: 29,
    numWaves: 3,
    crestWidth: 36,
    slopeWidth: 20,
    sheetThickness: 0.6,
  },
  {
    id: "cladding-b32",
    name: "Bardage B32",
    description: "Façade · 1035 mm · 32 mm",
    type: "cladding",
    width: 1035,
    length: 3000,
    waveHeight: 32,
    numWaves: 5,
    crestWidth: 40,
    slopeWidth: 25,
    sheetThickness: 0.7,
  },
  {
    id: "cladding-b18",
    name: "Bardage B18",
    description: "Façade micro-nervuré · ~1000 mm · 18 mm",
    type: "cladding",
    width: 1001,    // 13 × 77mm
    length: 3000,
    waveHeight: 18,
    numWaves: 13,
    crestWidth: 20,
    slopeWidth: 10,
    sheetThickness: 0.6,
  },
];

// ─── Camera Presets ──────────────────────────────────────────────────────────

export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

/** Generate camera presets scaled to a given profile.
 *  The panel mesh is centered in XZ at origin, Y from 0 upward.
 */
export function getCameraPresets(cfg: ProfileConfig): CameraPreset[] {
  const d = Math.max(cfg.width, cfg.length); // scale reference
  const cy = cfg.waveHeight / 2;

  return [
    {
      id: "3q-left",
      label: "3/4 Gauche",
      position: [-d * 0.55, d * 0.35, -d * 0.45],
      target: [0, cy, 0],
    },
    {
      id: "3q-right",
      label: "3/4 Droite",
      position: [d * 0.55, d * 0.35, -d * 0.45],
      target: [0, cy, 0],
    },
    {
      id: "profile",
      label: "Profil",
      position: [0, d * 0.08, -d * 0.65],
      target: [0, cy, 0],
    },
    {
      id: "side",
      label: "Côté",
      position: [-d * 0.65, d * 0.08, 0],
      target: [0, cy, 0],
    },
    {
      id: "top",
      label: "Dessus",
      position: [0, d * 0.9, 0],
      target: [0, 0, 0],
    },
    {
      id: "detail",
      label: "Détail",
      position: [-cfg.width * 0.2, d * 0.1, -d * 0.3],
      target: [-cfg.width * 0.1, cy, -d * 0.1],
    },
    {
      id: "bottom",
      label: "Dessous",
      position: [0, -d * 0.45, 0],
      target: [0, 0, 0],
    },
    {
      id: "long",
      label: "Vue longue",
      position: [d * 0.1, d * 0.15, d * 0.75],
      target: [0, cy, 0],
    },
  ];
}

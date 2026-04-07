"use client";

import dynamic from "next/dynamic";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import {
  House,
  GearSix,
  DownloadSimple,
  X,
} from "@phosphor-icons/react";
import { PROFILES, RAL_PALETTE, ProfileConfig, Color } from "@/lib/data";

// ─── Dynamic import — WebGL component, no SSR ─────────────────────────────────

const PanelViewer = dynamic(() => import("@/components/PanelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-50 relative overflow-hidden">
      {/* Skeleton shapes mimicking 3D panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-3">
          {/* Panel skeleton */}
          <div className="w-72 h-[6px] bg-zinc-200 rounded animate-pulse" />
          <div className="w-64 h-20 bg-zinc-200 rounded-xl animate-pulse" />
          <div className="w-72 h-[6px] bg-zinc-200 rounded animate-pulse" />
        </div>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"
            style={{ left: "-33.333%" }}
          />
        </div>
        {/* Label */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-[family-name:var(--font-geist-mono)]">
          Initialisation du moteur 3D
        </p>
      </div>
    </div>
  ),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 128;
}

function rangePercent(value: number, min: number, max: number): string {
  return `${((value - min) / (max - min)) * 100}%`;
}

// ─── ProductRow ───────────────────────────────────────────────────────────────

function ProductRow({
  profile,
  selected,
  onClick,
}: {
  profile: ProfileConfig;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      layout
      className={`w-full text-left flex items-start gap-3 py-3 pl-4 pr-4 border-l-2 transition-colors duration-200 group ${
        selected
          ? "border-zinc-900 bg-zinc-50"
          : "border-transparent hover:border-zinc-200 hover:bg-zinc-50/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-semibold leading-tight transition-colors duration-200 ${
              selected ? "text-zinc-950" : "text-zinc-700 group-hover:text-zinc-900"
            }`}
          >
            {profile.name}
          </p>
          <AnimatePresence>
            {selected && (
              <motion.span
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-zinc-900 text-white"
              >
                Actif
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[11px] text-zinc-400 mt-0.5 font-[family-name:var(--font-geist-mono)]">
          {profile.description}
        </p>
      </div>
    </motion.button>
  );
}

// ─── ColorSwatch with magnetic hover ──────────────────────────────────────────

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: Color;
  selected: boolean;
  onClick: () => void;
}) {
  const swatchRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 25 });
  const springY = useSpring(y, { stiffness: 350, damping: 25 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!swatchRef.current) return;
      const rect = swatchRef.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setHovered(false);
  }, [x, y]);

  return (
    <div className="relative">
      <motion.button
        ref={swatchRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`relative w-11 h-11 rounded-xl transition-shadow duration-200 ${
          selected
            ? "ring-2 ring-offset-2 ring-zinc-800 scale-105 shadow-md"
            : "ring-1 ring-black/10 hover:shadow-md"
        }`}
        style={{ backgroundColor: color.hex, x: springX, y: springY }}
      >
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={isLight(color.hex) ? "#111" : "#fff"}
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && !selected && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="bg-zinc-950 text-white rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
              {/* Color preview larger */}
              <div
                className="w-full h-3 rounded-sm mb-1.5"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-[10px] font-semibold leading-none">{color.name}</p>
              <p className="text-[9px] text-zinc-400 font-[family-name:var(--font-geist-mono)] mt-0.5">
                {color.ral}
              </p>
            </div>
            {/* Arrow */}
            <div className="w-2 h-2 bg-zinc-950 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pt-5 pb-2 text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-400">
      {children}
    </p>
  );
}

// ─── Length Display + Direct Input ────────────────────────────────────────────

function snapToStep(val: number, step: number): number {
  return Math.round(val / step) * step;
}

function AnimatedLength({
  profileLength,
  units,
  onProfileLengthChange,
}: {
  profileLength: number;
  units: "mm" | "m";
  onProfileLengthChange: (v: number) => void;
}) {
  const intRef = useRef<HTMLSpanElement>(null);
  const decRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const count = useMotionValue(profileLength);
  const spring = useSpring(count, { stiffness: 180, damping: 22 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    count.set(profileLength);
  }, [profileLength, count]);

  useMotionValueEvent(spring, "change", (v) => {
    if (editing) return;
    if (units === "m") {
      const meters = v / 1000;
      const intPart = Math.floor(meters).toString();
      const decPart = (meters % 1).toFixed(2).slice(1);
      if (intRef.current) intRef.current.textContent = intPart;
      if (decRef.current) decRef.current.textContent = decPart;
    } else {
      if (intRef.current) intRef.current.textContent = Math.round(v).toString();
      if (decRef.current) decRef.current.textContent = "";
    }
  });

  const startEditing = useCallback(() => {
    const display = units === "m"
      ? (profileLength / 1000).toFixed(2)
      : profileLength.toString();
    setDraft(display);
    setEditing(true);
    setTimeout(() => { inputRef.current?.select(); }, 0);
  }, [profileLength, units]);

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(draft.replace(",", "."));
    if (!isNaN(parsed)) {
      const inMm = units === "m" ? parsed * 1000 : parsed;
      const clamped = Math.min(12000, Math.max(1000, inMm));
      const snapped = snapToStep(clamped, 250);
      onProfileLengthChange(snapped);
    }
    setEditing(false);
  }, [draft, units, onProfileLengthChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  }, [commitEdit]);

  if (editing) {
    return (
      <div className="flex items-baseline gap-1.5 mb-3">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-24 text-2xl font-semibold tracking-tight text-zinc-950 font-[family-name:var(--font-geist-mono)] bg-zinc-100 rounded-lg px-2 py-0.5 outline-none border-2 border-zinc-900 tabular-nums"
          autoFocus
        />
        <span className="text-sm font-medium text-zinc-400">{units}</span>
      </div>
    );
  }

  if (units === "mm") {
    return (
      <button onClick={startEditing} className="flex items-baseline gap-1.5 mb-3 group cursor-text">
        <span className="text-2xl font-semibold tracking-tight text-zinc-950 font-[family-name:var(--font-geist-mono)] tabular-nums group-hover:text-zinc-600 transition-colors">
          <span ref={intRef}>{profileLength}</span>
          <span ref={decRef} />
        </span>
        <span className="text-sm font-medium text-zinc-400">mm</span>
      </button>
    );
  }

  const meters = profileLength / 1000;
  const intPart = Math.floor(meters).toString();
  const decPart = (meters % 1).toFixed(2).slice(1);

  return (
    <button onClick={startEditing} className="flex items-baseline gap-1.5 mb-3 group cursor-text w-full">
      <span className="text-2xl font-semibold tracking-tight text-zinc-950 font-[family-name:var(--font-geist-mono)] tabular-nums group-hover:text-zinc-600 transition-colors">
        <span ref={intRef}>{intPart}</span>
        <span ref={decRef}>{decPart}</span>
      </span>
      <span className="text-sm font-medium text-zinc-400">m</span>
      <span className="ml-auto text-[10px] text-zinc-300 font-[family-name:var(--font-geist-mono)]">
        {profileLength} mm
      </span>
    </button>
  );
}

// ─── AI Scene Panel ───────────────────────────────────────────────────────────

interface AISceneState {
  phase: "idle" | "loading" | "done" | "error";
  imageUrl: string | null;
}

function AIScenePanel({
  profileId,
  profileName,
  colorHex,
  colorName,
  onClose,
}: {
  profileId: string;
  profileName: string;
  colorHex: string;
  colorName: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<AISceneState>({ phase: "idle", imageUrl: null });

  const generate = useCallback(async () => {
    setState({ phase: "loading", imageUrl: null });
    const apiUrl = process.env.NEXT_PUBLIC_NANO_BANANA_API_URL;
    if (!apiUrl) {
      await new Promise((r) => setTimeout(r, 1000));
      setState({ phase: "idle", imageUrl: null });
      return;
    }
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          color_hex: colorHex,
          prompt: `Architectural visualization, Galva Service ${profileName}, ${colorName}, modern industrial building`,
          width: 1024,
          height: 576,
        }),
      });
      if (!res.ok) throw new Error("api_error");
      const data = (await res.json()) as { image_url?: string };
      if (!data.image_url) throw new Error("no_image");
      setState({ phase: "done", imageUrl: data.image_url });
    } catch {
      setState({ phase: "error", imageUrl: null });
    }
  }, [profileId, profileName, colorHex, colorName]);

  const apiConfigured = !!process.env.NEXT_PUBLIC_NANO_BANANA_API_URL;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-zinc-100 shadow-2xl z-20 flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            Nano Banana AI
          </p>
          <p className="text-sm font-semibold text-zinc-900 mt-0.5">Mise en scène</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      <div className="px-5 py-3 border-b border-zinc-50 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg border border-black/10 shrink-0 shadow-sm"
          style={{ backgroundColor: colorHex }}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-900 truncate">{profileName}</p>
          <p className="text-[11px] text-zinc-400 font-[family-name:var(--font-geist-mono)]">
            {colorName}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
        {state.phase === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
            {!apiConfigured ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    className="text-zinc-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-zinc-700">Intégration IA en cours</p>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
                    Définissez{" "}
                    <code className="font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">
                      NEXT_PUBLIC_NANO_BANANA_API_URL
                    </code>{" "}
                    pour activer la génération
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    className="text-zinc-500"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
                  Générez une mise en scène architecturale réaliste avec ce profil
                </p>
              </>
            )}
            <button
              onClick={generate}
              disabled={!apiConfigured}
              className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Générer l&apos;image
            </button>
          </div>
        )}

        {state.phase === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 animate-pulse" />
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-3.5 h-3.5 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
              Génération en cours…
            </div>
          </div>
        )}

        {state.phase === "done" && state.imageUrl && (
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.imageUrl}
              alt={`Mise en scène ${profileName}`}
              className="w-full aspect-video object-cover rounded-xl border border-zinc-100"
            />
            <div className="flex gap-2">
              <a
                href={state.imageUrl}
                download="mise-en-scene-ai.png"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors active:scale-[0.98]"
              >
                <DownloadSimple size={12} weight="bold" />
                Télécharger
              </a>
              <button
                onClick={generate}
                className="px-3 py-2 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:border-zinc-400 hover:text-zinc-900 transition-all"
              >
                Régénérer
              </button>
            </div>
          </div>
        )}

        {state.phase === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                className="text-red-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
              La génération a échoué. Vérifiez votre connexion et réessayez.
            </p>
            <button
              onClick={generate}
              className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 active:scale-95 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  selectedProfileId,
  onSelectProfile,
  selectedColor,
  onSelectColor,
  profileLength,
  onProfileLengthChange,
  reflectivity,
  onReflectivityChange,
  shadowStrength,
  onShadowStrengthChange,
  foamThickness,
  onFoamThicknessChange,
  companyLogo,
  exportWithLogo,
  onExportWithLogoChange,
  innerColor,
  onInnerColorChange,
  innerFaceRibbed,
  onInnerFaceRibbedChange,
  units,
  onOpenAI,
  onClose,
}: {
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  selectedColor: Color;
  onSelectColor: (c: Color) => void;
  profileLength: number;
  onProfileLengthChange: (l: number) => void;
  reflectivity: number;
  onReflectivityChange: (v: number) => void;
  shadowStrength: number;
  onShadowStrengthChange: (v: number) => void;
  foamThickness: number;
  onFoamThicknessChange: (v: number) => void;
  companyLogo: string | null;
  exportWithLogo: boolean;
  onExportWithLogoChange: (v: boolean) => void;
  innerColor: Color;
  onInnerColorChange: (c: Color) => void;
  innerFaceRibbed: boolean;
  onInnerFaceRibbedChange: (v: boolean) => void;
  units: "mm" | "m";
  onOpenAI: () => void;
  onClose?: () => void;
}) {
  const sandwichProfiles = PROFILES.filter((p) => p.type === "sandwich");
  const claddingProfiles = PROFILES.filter((p) => p.type === "cladding");
  const fillPercent = rangePercent(profileLength, 1000, 12000);
  const selectedProfile = PROFILES.find((p) => p.id === selectedProfileId)!;
  const isSandwich = selectedProfile.type === "sandwich";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 32, delay: 0.05 }}
      className="w-72 shrink-0 h-full flex flex-col border-r border-zinc-100 bg-white overflow-y-auto"
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-zinc-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2">
              Galva Service
            </p>
            <h1 className="font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-tight text-zinc-950 leading-snug">
              Profile
              <br />
              Visualizer
            </h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors md:hidden"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-1.5 mt-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <House size={10} weight="bold" />
            Accueil
          </Link>
          <span className="text-zinc-300 text-[10px]">/</span>
          <span className="text-[11px] font-semibold text-zinc-700">Visualiseur</span>
          <span className="text-zinc-300 text-[10px] mx-0.5">·</span>
          <Link
            href="/settings"
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <GearSix size={10} weight="bold" />
            Paramètres
          </Link>
        </nav>

        {/* Active profile display with transition */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden">
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
            Profil actif
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedProfileId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm font-semibold text-zinc-950 leading-tight">
                {selectedProfile.name}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-[family-name:var(--font-geist-mono)]">
                {selectedProfile.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Profile list */}
      <div className="flex-1">
        <SectionLabel>Toiture — Sandwich</SectionLabel>
        <div className="mt-1 mb-4">
          {sandwichProfiles.map((p) => (
            <ProductRow
              key={p.id}
              profile={p}
              selected={p.id === selectedProfileId}
              onClick={() => onSelectProfile(p.id)}
            />
          ))}
        </div>

        <div className="mx-5 h-px bg-zinc-100" />

        <SectionLabel>Façade — Bardage</SectionLabel>
        <div className="mt-1">
          {claddingProfiles.map((p) => (
            <ProductRow
              key={p.id}
              profile={p}
              selected={p.id === selectedProfileId}
              onClick={() => onSelectProfile(p.id)}
            />
          ))}
        </div>
      </div>

      {/* Length slider */}
      <div className="border-t border-zinc-100">
        <SectionLabel>Longueur du produit</SectionLabel>
        <div className="px-5 pb-5">
          <AnimatedLength profileLength={profileLength} units={units} onProfileLengthChange={onProfileLengthChange} />
          <input
            type="range"
            min={1000}
            max={12000}
            step={250}
            value={profileLength}
            onChange={(e) => onProfileLengthChange(Number(e.target.value))}
            style={{ "--range-fill": fillPercent } as React.CSSProperties}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-zinc-300 font-[family-name:var(--font-geist-mono)]">
              1 m
            </span>
            <span className="text-[10px] text-zinc-300 font-[family-name:var(--font-geist-mono)]">
              12 m
            </span>
          </div>
        </div>
      </div>

      {/* Foam thickness — sandwich only */}
      {isSandwich && (
        <div className="border-t border-zinc-100">
          <SectionLabel>Isolation</SectionLabel>
          <div className="px-5 pb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Épaisseur mousse</span>
              <span className="text-[10px] text-zinc-400 font-[family-name:var(--font-geist-mono)]">{foamThickness} mm</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={foamThickness}
              onChange={(e) => onFoamThicknessChange(Number(e.target.value))}
              style={{ "--range-fill": rangePercent(foamThickness, 20, 200) } as React.CSSProperties}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-zinc-300 font-[family-name:var(--font-geist-mono)]">20 mm</span>
              <span className="text-[10px] text-zinc-300 font-[family-name:var(--font-geist-mono)]">200 mm</span>
            </div>
          </div>
        </div>
      )}

      {/* Inner face — sandwich only */}
      {isSandwich && (
        <div className="border-t border-zinc-100">
          <SectionLabel>Face intérieure</SectionLabel>
          <div className="px-5 pb-4">
            {/* Active color preview */}
            <div className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden">
              <motion.div
                key={innerColor.ral}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="w-6 h-6 rounded-md border border-black/10 shrink-0 shadow-sm"
                style={{ backgroundColor: innerColor.hex }}
              />
              <span className="text-xs font-semibold text-zinc-800 leading-tight truncate">{innerColor.name}</span>
              <span className="ml-auto text-[10px] text-zinc-400 font-[family-name:var(--font-geist-mono)]">{innerColor.ral}</span>
            </div>
            {/* Color grid */}
            <div className="grid grid-cols-4 gap-2">
              {RAL_PALETTE.map((c) => (
                <ColorSwatch
                  key={c.ral}
                  color={c}
                  selected={c.ral === innerColor.ral}
                  onClick={() => onInnerColorChange(c)}
                />
              ))}
            </div>
            {/* Ribbed toggle */}
            <button
              onClick={() => onInnerFaceRibbedChange(!innerFaceRibbed)}
              className="mt-4 w-full flex items-center justify-between gap-3 text-left"
            >
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Face nervurée</span>
              <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${innerFaceRibbed ? "bg-zinc-900" : "bg-zinc-200"}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${innerFaceRibbed ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Render settings */}
      <div className="border-t border-zinc-100">
        <SectionLabel>Rendu</SectionLabel>
        <div className="px-5 pb-5 flex flex-col gap-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Reflets</span>
              <span className="text-[10px] text-zinc-400 font-[family-name:var(--font-geist-mono)]">{reflectivity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={reflectivity}
              onChange={(e) => onReflectivityChange(Number(e.target.value))}
              style={{ "--range-fill": rangePercent(reflectivity, 0, 100) } as React.CSSProperties}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Ombre</span>
              <span className="text-[10px] text-zinc-400 font-[family-name:var(--font-geist-mono)]">{shadowStrength}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={shadowStrength}
              onChange={(e) => onShadowStrengthChange(Number(e.target.value))}
              style={{ "--range-fill": rangePercent(shadowStrength, 0, 100) } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Logo export toggle — visible only if a logo is configured */}
      {companyLogo && (
        <div className="border-t border-zinc-100 px-5 py-4">
          <button
            onClick={() => onExportWithLogoChange(!exportWithLogo)}
            className="w-full flex items-center justify-between gap-3 text-left"
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Logo sur l&apos;export</span>
            <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${exportWithLogo ? "bg-zinc-900" : "bg-zinc-200"}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${exportWithLogo ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </button>
        </div>
      )}

      {/* Color picker */}
      <div className="border-t border-zinc-100">
        <SectionLabel>Couleur RAL</SectionLabel>

        {/* Active color preview with transition */}
        <div className="flex items-center gap-3 mx-5 mb-4 mt-1 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden">
          <motion.div
            key={selectedColor.ral}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="w-8 h-8 rounded-lg border border-black/10 shrink-0 shadow-sm"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedColor.ral}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <p className="text-xs font-semibold text-zinc-800 leading-tight truncate">
                {selectedColor.name}
              </p>
              <p className="text-[10px] text-zinc-400 font-[family-name:var(--font-geist-mono)] mt-0.5">
                {selectedColor.ral}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Color grid */}
        <div className="grid grid-cols-4 gap-2.5 px-5 pb-5">
          {RAL_PALETTE.map((c) => (
            <ColorSwatch
              key={c.ral}
              color={c}
              selected={c.ral === selectedColor.ral}
              onClick={() => onSelectColor(c)}
            />
          ))}
        </div>
      </div>

      {/* AI Scene generation */}
      <div className="border-t border-zinc-100 px-5 py-4">
        <button
          onClick={onOpenAI}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 active:scale-[0.98] transition-all duration-150"
        >
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Mise en scène IA
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-zinc-100">
        <p className="text-[10px] text-zinc-300 text-center tracking-wide font-[family-name:var(--font-geist-mono)]">
          Rendu 3D · Géométrie paramétrique exacte
        </p>
      </div>
    </motion.aside>
  );
}

// ─── Export handler ────────────────────────────────────────────────────────────

function handleExport(profileName: string) {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
  try {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profileName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  } catch {
    // Canvas may be tainted if cross-origin resources are used
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisualizerPage() {
  const [selectedProfileId, setSelectedProfileId] = useState(PROFILES[0].id);
  const [selectedColor, setSelectedColor] = useState<Color>(RAL_PALETTE[4]);
  const [profileLength, setProfileLength] = useState(3000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [reflectivity, setReflectivity] = useState(60);
  const [shadowStrength, setShadowStrength] = useState(44);
  const [units, setUnits] = useState<"mm" | "m">("m");
  const [showGrid, setShowGrid] = useState(false);
  const [foamThickness, setFoamThickness] = useState(100);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [exportWithLogo, setExportWithLogo] = useState(false);
  const [innerColor, setInnerColor] = useState<Color>(RAL_PALETTE[0]);
  const [innerFaceRibbed, setInnerFaceRibbed] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("steel-viz-settings") || "{}");
      if (saved.units === "mm" || saved.units === "m") setUnits(saved.units);
      if (typeof saved.showGrid === "boolean") setShowGrid(saved.showGrid);
      if (saved.companyLogo) setCompanyLogo(saved.companyLogo);
    } catch { /* ignore */ }
  }, []);

  const selectedProfile = PROFILES.find((p) => p.id === selectedProfileId)!;

  // Reset foam thickness to profile default when switching profiles
  useEffect(() => {
    if (selectedProfile.type === "sandwich") {
      setFoamThickness(selectedProfile.coreThickness ?? 100);
    }
  }, [selectedProfileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayProfile: ProfileConfig = {
    ...selectedProfile,
    length: profileLength,
    ...(selectedProfile.type === "sandwich" ? { coreThickness: foamThickness } : {}),
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50">
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — slide-in on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:relative md:z-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          selectedProfileId={selectedProfileId}
          onSelectProfile={setSelectedProfileId}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          profileLength={profileLength}
          onProfileLengthChange={setProfileLength}
          reflectivity={reflectivity}
          onReflectivityChange={setReflectivity}
          shadowStrength={shadowStrength}
          onShadowStrengthChange={setShadowStrength}
          foamThickness={foamThickness}
          onFoamThicknessChange={setFoamThickness}
          companyLogo={companyLogo}
          exportWithLogo={exportWithLogo}
          onExportWithLogoChange={setExportWithLogo}
          innerColor={innerColor}
          onInnerColorChange={setInnerColor}
          innerFaceRibbed={innerFaceRibbed}
          onInnerFaceRibbedChange={setInnerFaceRibbed}
          units={units}
          onOpenAI={() => {
            setSidebarOpen(false);
            setAiPanelOpen(true);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main 3D viewer area */}
      <main className="flex-1 h-full min-w-0 relative flex flex-col">
        {/* Viewer toolbar */}
        <div className="absolute top-0 left-0 right-0 h-11 bg-white/90 backdrop-blur-sm border-b border-zinc-100 z-10 flex items-center px-4 gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors md:hidden"
            aria-label="Ouvrir le menu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Profile name + color indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <motion.div
              key={selectedColor.ral}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={selectedProfileId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-semibold text-zinc-800 truncate"
              >
                {selectedProfile.name}
              </motion.span>
            </AnimatePresence>
            <span className="text-zinc-200 text-[10px] hidden sm:block">·</span>
            <span className="text-[10px] text-zinc-400 font-[family-name:var(--font-geist-mono)] hidden sm:block">
              {units === "mm" ? `${profileLength} mm` : `${(profileLength / 1000).toFixed(2)} m`}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Export button */}
            <motion.button
              onClick={() => handleExport(selectedProfile.name)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white text-[11px] font-semibold rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150"
            >
              <DownloadSimple size={11} weight="bold" />
              Exporter PNG
            </motion.button>
          </div>
        </div>

        {/* 3D Panel Viewer — offset for toolbar */}
        <div className="flex-1 pt-11">
          <PanelViewer cfg={displayProfile} color={selectedColor.hex} reflectivity={reflectivity} shadowStrength={shadowStrength} showGrid={showGrid} companyLogo={companyLogo} exportWithLogo={exportWithLogo} innerColor={innerColor.hex} innerFaceRibbed={innerFaceRibbed} />
        </div>

        {/* Nano Banana AI panel */}
        <AnimatePresence>
          {aiPanelOpen && (
            <AIScenePanel
              profileId={selectedProfile.id}
              profileName={selectedProfile.name}
              colorHex={selectedColor.hex}
              colorName={selectedColor.name}
              onClose={() => setAiPanelOpen(false)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { PROFILES, RAL_PALETTE, Color } from "@/lib/data";
import EmbedColorPicker from "@/components/EmbedColorPicker";

// ─── Dynamic import — WebGL component, no SSR ────────────────────────────────

const PanelViewer = dynamic(() => import("@/components/PanelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
      <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-[family-name:var(--font-geist-mono)]">
        Chargement…
      </p>
    </div>
  ),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeRal(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

// ─── Inner component (uses useSearchParams — must be inside Suspense) ─────────

function EmbedVisualizer() {
  const searchParams = useSearchParams();
  const profileParam = searchParams.get("profile");
  const colorParam = searchParams.get("color");

  const profile =
    PROFILES.find((p) => p.id === profileParam) ?? PROFILES[0];

  const initialColor: Color =
    colorParam
      ? (RAL_PALETTE.find(
          (c) => normalizeRal(c.ral) === normalizeRal(colorParam)
        ) ?? RAL_PALETTE[0])
      : RAL_PALETTE[0];

  const [activeColor, setActiveColor] = useState<Color>(initialColor);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 3D viewer — takes all available space */}
      <div className="flex-1 min-h-0">
        <PanelViewer cfg={profile} color={activeColor.hex} />
      </div>

      {/* Color picker band — pinned to bottom */}
      <div className="flex-shrink-0 border-t border-zinc-100 bg-white">
        <EmbedColorPicker
          colors={RAL_PALETTE}
          activeColor={activeColor}
          onChange={setActiveColor}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmbedVisualizerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-[family-name:var(--font-geist-mono)]">
            Chargement…
          </p>
        </div>
      }
    >
      <EmbedVisualizer />
    </Suspense>
  );
}

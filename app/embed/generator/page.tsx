"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILES, RAL_PALETTE, ProfileConfig, Color } from "@/lib/data";
import EmbedColorPicker from "@/components/EmbedColorPicker";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildIframeSrc(profile: ProfileConfig, color: Color): string {
  const ralCode = color.ral.replace(/\s+/g, "");
  return `/embed/visualizer?profile=${profile.id}&color=${ralCode}`;
}

function buildIframeCode(src: string, origin: string): string {
  const fullSrc = `${origin}${src}`;
  return `<iframe\n  src="${fullSrc}"\n  width="800"\n  height="500"\n  frameborder="0"\n  style="border:none;border-radius:8px;"\n  allowfullscreen\n></iframe>`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmbedGeneratorPage() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileConfig>(PROFILES[0]);
  const [selectedColor, setSelectedColor] = useState<Color>(RAL_PALETTE[0]);
  const [copied, setCopied] = useState(false);

  const iframeSrc = buildIframeSrc(selectedProfile, selectedColor);
  const iframeCode = buildIframeCode(
    iframeSrc,
    typeof window !== "undefined" ? window.location.origin : ""
  );

  function handleCopy() {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="min-h-dvh bg-zinc-50 p-6 font-[family-name:var(--font-geist-sans)]"
      style={{ colorScheme: "light" }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-2 border-b border-zinc-200">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Générateur d'iframe
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Configurez le visualiseur et copiez le code HTML pour l'intégrer sur votre site.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── Config panel ─────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Profile selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Profil
              </label>
              <select
                value={selectedProfile.id}
                onChange={(e) => {
                  const p = PROFILES.find((p) => p.id === e.target.value);
                  if (p) setSelectedProfile(p);
                }}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
              >
                {PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Color selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Couleur initiale
              </label>
              <div className="bg-white rounded-lg border border-zinc-200 shadow-sm">
                <EmbedColorPicker
                  colors={RAL_PALETTE}
                  activeColor={selectedColor}
                  onChange={setSelectedColor}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 font-[family-name:var(--font-geist-mono)]">
                {selectedColor.name} · {selectedColor.ral}
              </p>
            </div>

            {/* Code output */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Code HTML
                </label>
                <motion.button
                  onClick={handleCopy}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-xs font-medium px-3 py-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-700 transition-colors overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "copied" : "copy"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      {copied ? "Copié ✓" : "Copier le code"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
              <pre className="bg-zinc-900 text-zinc-300 rounded-lg p-4 text-[11px] font-[family-name:var(--font-geist-mono)] overflow-x-auto leading-relaxed whitespace-pre select-all">
                {iframeCode}
              </pre>
            </div>
          </div>

          {/* ── Live preview ─────────────────────────────────────────── */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Aperçu live
            </label>
            <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-sm bg-white aspect-video">
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                className="w-full h-full border-0"
                title="Aperçu du visualiseur"
              />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              <span className="font-medium text-zinc-600">{selectedProfile.name}</span>
              {" · "}
              <span
                className="inline-block w-2.5 h-2.5 rounded-full border border-zinc-200 align-middle mx-0.5"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="font-medium text-zinc-600">{selectedColor.name}</span>
              {" · "}
              <span className="font-[family-name:var(--font-geist-mono)]">{selectedColor.ral}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

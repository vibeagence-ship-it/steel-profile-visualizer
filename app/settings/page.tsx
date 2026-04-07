"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  CheckCircle,
  UploadSimple,
  SlidersHorizontal,
  Palette,
  Buildings,
  GearSix,
  CaretRight,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UnitSystem = "mm" | "cm" | "m" | "in";
type ExportFormat = "png" | "pdf" | "dxf";
type Language = "fr" | "en";

interface Settings {
  units: UnitSystem;
  showGrid: boolean;
  showAxes: boolean;
  darkBackground: boolean;
  exportFormat: ExportFormat;
  companyName: string;
  companyLogo: string | null;
  contactEmail: string;
  contactPhone: string;
  language: Language;
  accentColor: string;
}

const DEFAULT_SETTINGS: Settings = {
  units: "mm",
  showGrid: false,
  showAxes: false,
  darkBackground: false,
  exportFormat: "png",
  companyName: "Galva Service",
  companyLogo: null,
  contactEmail: "contact@galvaservice.com",
  contactPhone: "+33 1 71 92 10 00",
  language: "fr",
  accentColor: "#18181b",
};

const SETTINGS_KEY = "steel-viz-settings";

// ─── Accent palette ───────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  { hex: "#18181b", label: "Zinc (défaut)" },
  { hex: "#E31837", label: "Rouge principal" },
  { hex: "#374B52", label: "Gris acier" },
  { hex: "#284428", label: "Vert industriel" },
  { hex: "#1d4ed8", label: "Bleu marine" },
  { hex: "#7B3B2A", label: "Brun terre" },
  { hex: "#4B4D4E", label: "Gris ombrage" },
  { hex: "#587246", label: "Vert réséda" },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
  accentColor,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-zinc-100 last:border-0">
      <div className="min-w-0 pr-6">
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {description && (
          <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 w-10 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        style={{ backgroundColor: checked ? (accentColor ?? "#18181b") : "#e4e4e7" }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm ${
            checked ? "left-[calc(100%-1.375rem)]" : "left-0.5"
          }`}
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.12)",
          }}
        />
      </button>
    </div>
  );
}

// ─── Chip Select ─────────────────────────────────────────────────────────────

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
  accentColor,
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  accentColor?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => !opt.disabled && onChange(opt.value)}
          disabled={opt.disabled}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
            value === opt.value
              ? "text-white border-transparent shadow-sm"
              : opt.disabled
              ? "bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 active:scale-[0.97]"
          }`}
          style={
            value === opt.value
              ? { backgroundColor: accentColor ?? "#18181b", borderColor: accentColor ?? "#18181b" }
              : undefined
          }
        >
          {opt.label}
          {opt.disabled && (
            <span className="ml-1.5 text-[9px] font-bold tracking-wider text-zinc-300 uppercase">
              bientôt
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden scroll-mt-24">
      <div className="px-6 py-5 border-b border-zinc-100">
        <h2 className="text-sm font-semibold text-zinc-950 tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-zinc-400 mt-1 leading-snug">{description}</p>
        )}
      </div>
      <div className="px-6 py-1">{children}</div>
    </section>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="py-3.5 border-b border-zinc-100 last:border-0">
      <label className="block text-xs font-medium text-zinc-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all placeholder:text-zinc-300 font-[family-name:var(--font-geist-sans)]"
      />
    </div>
  );
}

// ─── Logo Upload — drag & drop zone ──────────────────────────────────────────

function LogoUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > 2 * 1024 * 1024) {
        setError("Fichier trop volumineux — maximum 2 Mo");
        return;
      }
      if (!["image/png", "image/svg+xml", "image/jpeg"].includes(file.type)) {
        setError("Format non supporté — utilisez PNG, SVG ou JPG");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => onChange((ev.target?.result as string) ?? null);
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="py-4 border-b border-zinc-100 last:border-0">
      <label className="block text-xs font-medium text-zinc-500 mb-3">Logo société</label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-zinc-900 bg-zinc-50 scale-[1.01]"
            : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Logo société"
              className="max-h-16 max-w-[160px] object-contain"
            />
            <p className="text-xs text-zinc-400">
              {dragging ? "Déposez pour remplacer" : "Cliquer ou déposer pour changer"}
            </p>
          </>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              dragging ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
            }`}>
              <UploadSimple size={22} weight={dragging ? "bold" : "regular"} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700">
                {dragging ? "Déposez ici" : "Déposez votre logo ici"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">ou cliquez pour parcourir</p>
              <p className="text-[10px] text-zinc-300 mt-2">PNG, SVG, JPG — max 2 Mo</p>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Remove */}
      {value && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          className="mt-2 text-xs text-zinc-400 hover:text-red-500 transition-colors"
        >
          Supprimer le logo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}

// ─── Accent Color Picker ──────────────────────────────────────────────────────

function AccentColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="py-4">
      <p className="text-xs font-medium text-zinc-500 mb-3">
        Couleur d&apos;accentuation
      </p>
      <div className="flex flex-wrap gap-2.5">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => onChange(color.hex)}
            title={color.label}
            className="relative w-9 h-9 rounded-xl border-2 transition-all duration-150 active:scale-90"
            style={{
              backgroundColor: color.hex,
              borderColor: value === color.hex ? color.hex : "transparent",
              outline: value === color.hex ? `3px solid ${color.hex}` : "none",
              outlineOffset: "2px",
              boxShadow: value !== color.hex ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <AnimatePresence>
              {value === color.hex && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-400 mt-3 leading-relaxed">
        Appliqué aux boutons actifs, indicateurs et sélections dans l&apos;interface.
      </p>
    </div>
  );
}

// ─── Sidebar nav items ─────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "units", label: "Unités", icon: SlidersHorizontal },
  { id: "display", label: "Affichage", icon: GearSix },
  { id: "export", label: "Export", icon: CaretRight },
  { id: "company", label: "Entreprise", icon: Buildings },
  { id: "accent", label: "Interface", icon: Palette },
  { id: "language", label: "Langue", icon: CaretRight },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-zinc-950 text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-2xl shadow-black/20"
        >
          <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0" />
          Paramètres enregistrés
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("units");

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore malformed data
    }
    setLoaded(true);
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [settings, loaded]);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loaded]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  const accent = settings.accentColor;

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      {/* Toast */}
      <Toast visible={saved} />

      {/* Topbar */}
      <header className="sticky top-0 z-20 bg-white border-b border-zinc-100 px-5 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center h-14">
          <Link
            href="/visualizer"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
          >
            <House size={14} weight="bold" className="group-hover:-translate-x-0.5 transition-transform" />
            Visualiseur
          </Link>
          <span className="text-zinc-200 mx-2 select-none">/</span>
          <span className="text-sm font-semibold text-zinc-900">Paramètres</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-14 items-start">

          {/* ── Left: sticky sidebar nav ─────────────────────────────────── */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-3 pl-3">
                Sections
              </p>
              <nav className="flex flex-col gap-0.5">
                {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setActiveSection(id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      activeSection === id
                        ? "text-zinc-950 bg-zinc-100"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon
                      size={13}
                      weight={activeSection === id ? "bold" : "regular"}
                      style={{ color: activeSection === id ? accent : undefined }}
                    />
                    {label}
                    {activeSection === id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1 h-1 rounded-full"
                        style={{ backgroundColor: accent }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      />
                    )}
                  </a>
                ))}
              </nav>

              {/* Divider */}
              <div className="mt-6 pt-6 border-t border-zinc-200">
                <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-3 pl-3">
                  Danger
                </p>
                <button
                  onClick={() => {
                    if (confirm("Réinitialiser tous les paramètres aux valeurs par défaut ?")) {
                      setSettings(DEFAULT_SETTINGS);
                      localStorage.removeItem(SETTINGS_KEY);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </aside>

          {/* ── Right: content ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Page title */}
            <div className="mb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Paramètres</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Préférences enregistrées localement dans votre navigateur.
              </p>
            </div>

            {/* ── Unités */}
            <SettingsSection
              id="units"
              title="Unités de mesure"
              description="Système d'unités utilisé pour les dimensions et les longueurs."
            >
              <div className="py-4">
                <ChipGroup<UnitSystem>
                  value={settings.units}
                  onChange={(v) => update("units", v)}
                  accentColor={accent}
                  options={[
                    { value: "mm", label: "mm" },
                    { value: "cm", label: "cm" },
                    { value: "m", label: "m" },
                    { value: "in", label: "Pouces" },
                  ]}
                />
              </div>
            </SettingsSection>

            {/* ── Affichage */}
            <SettingsSection
              id="display"
              title="Affichage"
              description="Options visuelles de la scène 3D."
            >
              <Toggle
                checked={settings.showGrid}
                onChange={(v) => update("showGrid", v)}
                label="Grille de référence"
                description="Affiche une grille au sol sous le panneau"
                accentColor={accent}
              />
              <Toggle
                checked={settings.showAxes}
                onChange={(v) => update("showAxes", v)}
                label="Axes de coordonnées"
                description="Affiche les axes X, Y, Z dans la scène"
                accentColor={accent}
              />
              <Toggle
                checked={settings.darkBackground}
                onChange={(v) => update("darkBackground", v)}
                label="Fond sombre par défaut"
                description="Démarre le visualiseur avec un fond sombre au lieu du dégradé gris"
                accentColor={accent}
              />
            </SettingsSection>

            {/* ── Export */}
            <SettingsSection
              id="export"
              title="Export"
              description="Format de fichier utilisé pour les exports depuis le visualiseur."
            >
              <div className="py-4">
                <ChipGroup<ExportFormat>
                  value={settings.exportFormat}
                  onChange={(v) => update("exportFormat", v)}
                  accentColor={accent}
                  options={[
                    { value: "png", label: "PNG" },
                    { value: "pdf", label: "PDF", disabled: true },
                    { value: "dxf", label: "DXF", disabled: true },
                  ]}
                />
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  PDF et DXF seront disponibles dans une prochaine version.
                </p>
              </div>
            </SettingsSection>

            {/* ── Profil entreprise */}
            <SettingsSection
              id="company"
              title="Profil entreprise"
              description="Informations affichées dans les exports PDF et les en-têtes de documents."
            >
              <LogoUpload
                value={settings.companyLogo}
                onChange={(v) => update("companyLogo", v)}
              />
              <Field
                label="Nom de la société"
                value={settings.companyName}
                onChange={(v) => update("companyName", v)}
                placeholder="Galva Service"
              />
              <Field
                label="Email de contact"
                value={settings.contactEmail}
                onChange={(v) => update("contactEmail", v)}
                placeholder="contact@example.com"
                type="email"
              />
              <Field
                label="Téléphone"
                value={settings.contactPhone}
                onChange={(v) => update("contactPhone", v)}
                placeholder="+33 1 00 00 00 00"
                type="tel"
              />
            </SettingsSection>

            {/* ── Interface / Accent color */}
            <SettingsSection
              id="accent"
              title="Couleurs de l'interface"
              description="Personnalisez la teinte d'accentuation de l'application."
            >
              <AccentColorPicker
                value={settings.accentColor}
                onChange={(v) => update("accentColor", v)}
              />
            </SettingsSection>

            {/* ── Langue */}
            <SettingsSection
              id="language"
              title="Langue"
              description="Langue de l'interface. La traduction complète sera disponible prochainement."
            >
              <div className="py-4">
                <ChipGroup<Language>
                  value={settings.language}
                  onChange={(v) => update("language", v)}
                  accentColor={accent}
                  options={[
                    { value: "fr", label: "Français" },
                    { value: "en", label: "English", disabled: true },
                  ]}
                />
                <p className="text-xs text-zinc-400 mt-3">
                  L&apos;anglais sera disponible dans une prochaine version.
                </p>
              </div>
            </SettingsSection>

            {/* ── Reset (mobile only — desktop uses sidebar) */}
            <div className="md:hidden border-t border-zinc-200 pt-6 flex flex-col gap-2">
              <p className="text-xs font-medium text-zinc-500">Zone dangereuse</p>
              <button
                onClick={() => {
                  if (confirm("Réinitialiser tous les paramètres aux valeurs par défaut ?")) {
                    setSettings(DEFAULT_SETTINGS);
                    localStorage.removeItem(SETTINGS_KEY);
                  }
                }}
                className="w-fit px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all duration-150"
              >
                Réinitialiser les paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

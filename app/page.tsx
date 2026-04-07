"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  ArrowRight,
} from "@phosphor-icons/react";

// ─── Steel Wave Profile Illustration ─────────────────────────────────────────

function SteelWaveSVG({ className }: { className?: string }) {
  const profilePath =
    "M0,120 L50,120 L66,40 L102,40 L118,120 L217,120 L233,40 L269,40 L285,120 L384,120 L400,40 L436,40 L452,120 L500,120";
  const innerPath =
    "M0,127 L50,127 L64,47 L104,47 L120,127 L217,127 L231,47 L271,47 L287,127 L384,127 L398,47 L438,47 L454,127 L500,127";

  return (
    <svg
      viewBox="-10 20 520 150"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8C3BB" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#5A5A5A" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8A8680" stopOpacity="0.4" />
          <stop offset="35%" stopColor="#E7E3DC" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#E7E3DC" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#8A8680" stopOpacity="0.4" />
        </linearGradient>
        <filter id="profileGlow" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={`${profilePath} L500,145 L0,145 Z`} fill="url(#fillGrad)" />
      <path
        d={profilePath}
        stroke="rgba(231,227,220,0.25)"
        strokeWidth="7"
        fill="none"
        filter="url(#profileGlow)"
      />
      <path
        d={profilePath}
        stroke="url(#strokeGrad)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={innerPath}
        stroke="rgba(160,155,148,0.35)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="58" y1="40" x2="58" y2="120"
        stroke="rgba(150,145,138,0.28)"
        strokeWidth="0.8"
        strokeDasharray="3,3"
      />
      <text x="62" y="85" fill="rgba(190,185,178,0.55)" fontSize="8" fontFamily="monospace">
        39mm
      </text>
      <line x1="0" y1="148" x2="500" y2="148" stroke="rgba(150,145,138,0.22)" strokeWidth="0.8" />
      <line x1="0" y1="145" x2="0" y2="151" stroke="rgba(150,145,138,0.22)" strokeWidth="0.8" />
      <line x1="500" y1="145" x2="500" y2="151" stroke="rgba(150,145,138,0.22)" strokeWidth="0.8" />
      <text x="250" y="160" fill="rgba(190,185,178,0.45)" fontSize="8" fontFamily="monospace" textAnchor="middle">
        1000 mm
      </text>
    </svg>
  );
}

// ─── Fade-in section wrapper ───────────────────────────────────────────────────

function FadeInSection({
  children,
  delay = 0,
  className,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const initial =
    direction === "left"
      ? { opacity: 0, x: -24 }
      : direction === "right"
      ? { opacity: 0, x: 24 }
      : { opacity: 0, y: 24 };

  const animate = inView
    ? { opacity: 1, x: 0, y: 0 }
    : direction === "left"
    ? { opacity: 0, x: -24 }
    : direction === "right"
    ? { opacity: 0, x: 24 }
    : { opacity: 0, y: 24 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── 3D Tilt Card ──────────────────────────────────────────────────────────────
// Isolated to avoid useState in hover loop — uses only MotionValues

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rawRotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rawRotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const rotateX = useSpring(rawRotateX, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(rawRotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div style={{ perspective: "1200px" }} className={className}>
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Magnetic CTA wrapper ─────────────────────────────────────────────────────

function MagneticWrap({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 22 });
  const springY = useSpring(y, { stiffness: 250, damping: 22 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.28);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.28);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={wrapRef}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter (scroll-triggered) ──────────────────────────────────────

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 55, damping: 18 });

  useEffect(() => {
    if (inView) count.set(target);
  }, [inView, target, count]);

  useMotionValueEvent(spring, "change", (v) => {
    if (spanRef.current) {
      spanRef.current.textContent = prefix + Math.round(v).toString() + suffix;
    }
  });

  return (
    <div ref={ref}>
      <span
        ref={spanRef}
        className="font-[family-name:var(--font-geist-mono)] tabular-nums"
      >
        {prefix}0{suffix}
      </span>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <nav className="fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex items-center gap-1 px-2.5 py-1.5 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md rounded-full border border-zinc-200/80 dark:border-white/10 shadow-sm shadow-black/[0.06]"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 pl-0.5 pr-1">
          <div className="w-6 h-6 rounded-md bg-zinc-950 dark:bg-white/15 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-white tracking-tighter">AM</span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-900 dark:text-white/90 tracking-tight hidden sm:block whitespace-nowrap">
            ArcelorMittal Building Solutions
          </span>
          <span className="text-[11px] font-semibold text-zinc-900 dark:text-white/90 sm:hidden">
            AMBS
          </span>
        </div>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-white/10 mx-1" />

        <Link
          href="/settings"
          className="px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:text-white/50 hover:text-zinc-950 dark:hover:text-white/90 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-white/5"
        >
          Paramètres
        </Link>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Basculer le mode sombre"
          className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-500 dark:text-white/50 hover:text-zinc-950 dark:hover:text-white/90 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all active:scale-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            {darkMode ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: -30 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 30 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <Sun size={13} weight="bold" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: 30 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -30 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <Moon size={13} weight="bold" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* CTA */}
        <Link
          href="/visualizer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150 ml-0.5"
        >
          Ouvrir le visualiseur
          <ArrowRight size={10} weight="bold" />
        </Link>
      </motion.div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.065, delayChildren: 0.25 },
  },
};

const heroWord = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

function Hero() {
  const LINE_1 = ["Visualisez", "vos", "profils"];
  const LINE_2 = ["acier", "en", "3D"];

  return (
    <section className="min-h-[100dvh] bg-zinc-950 dark:bg-zinc-950 flex items-center pt-20 overflow-hidden relative">
      {/* Ambient radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 62% 40%, rgba(90,100,110,0.14) 0%, transparent 70%)",
        }}
      />
      {/* Subtle ArcelorMittal red accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E31837]/30 to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-20 items-center py-20">
        {/* Left — Text content */}
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-500 mb-7"
          >
            <span className="w-4 h-px bg-[#E31837]/60" />
            ArcelorMittal Building Solutions
          </motion.p>

          {/* Title with word stagger */}
          <motion.h1
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-semibold tracking-tighter leading-[1.0] mb-7"
          >
            <span className="block">
              {LINE_1.map((word, i) => (
                <motion.span
                  key={i}
                  variants={heroWord}
                  className="inline-block text-white mr-[0.25em] last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {LINE_2.map((word, i) => (
                <motion.span
                  key={i}
                  variants={heroWord}
                  className="inline-block text-zinc-400 mr-[0.25em] last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-base text-zinc-400 leading-relaxed max-w-[46ch] mb-10"
          >
            Configurez vos panneaux sandwich et bardages en temps réel. Géométrie exacte,
            couleurs RAL certifiées, export PNG professionnel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4"
          >
            <MagneticWrap>
              <Link
                href="/visualizer"
                className="group flex items-center gap-2.5 px-6 py-3.5 bg-white text-zinc-950 font-semibold rounded-full hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 text-sm shadow-lg shadow-white/10"
              >
                Ouvrir le visualiseur
                <span className="w-5 h-5 rounded-full bg-zinc-950/8 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform">
                  <ArrowRight size={11} weight="bold" />
                </span>
              </Link>
            </MagneticWrap>
            <Link
              href="/settings"
              className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Paramètres
            </Link>
          </motion.div>
        </div>

        {/* Right — Floating profile card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:block w-[440px] lg:w-[500px] shrink-0"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Outer bezel */}
            <div
              className="relative rounded-[1.5rem] border border-white/[0.08] p-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                boxShadow: "0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Inner core */}
              <div
                className="rounded-[calc(1.5rem-0.375rem)] p-7"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-600 mb-5">
                  Sandwich T39 — Coupe transversale
                </p>
                <SteelWaveSVG className="w-full" />
                <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/[0.06]">
                  {[
                    { label: "Hauteur", value: "39 mm" },
                    { label: "Largeur utile", value: "1000 mm" },
                    { label: "Isolation", value: "100 mm PIR" },
                  ].map((spec) => (
                    <div key={spec.label}>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        {spec.label}
                      </p>
                      <p className="text-xs font-semibold text-zinc-300 font-[family-name:var(--font-geist-mono)]">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="py-24 md:py-32 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <FadeInSection>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-500 mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-3xl md:text-[2.6rem] font-semibold tracking-tighter text-zinc-950 dark:text-white mb-16 leading-tight">
            Conçu pour la précision technique
          </h2>
        </FadeInSection>

        {/* Asymmetric grid: 60% left + 40% right stacked */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3">
          {/* Primary feature — large tilt card */}
          <FadeInSection delay={0.05}>
            <TiltCard className="h-full">
              <div className="h-full rounded-2xl bg-zinc-950 dark:bg-zinc-950 p-8 md:p-10 flex flex-col justify-between min-h-[340px] overflow-hidden relative cursor-default">
                {/* Background wave */}
                <div className="absolute bottom-0 left-0 right-0 opacity-[0.15] pointer-events-none">
                  <SteelWaveSVG className="w-full" />
                </div>
                {/* Red accent */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#E31837]/25 to-transparent" />

                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-6">
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                    Géométrie exacte
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-[40ch]">
                    Chaque profil est calculé à partir des fiches techniques ArcelorMittal — hauteur
                    de vague, nervures de rigidification, rayons de pliage et épaisseurs de tôle.
                  </p>
                </div>

                <div className="relative flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                  {[
                    { label: "Profils disponibles", value: "6" },
                    { label: "Précision", value: "±0.5mm" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold text-white font-[family-name:var(--font-geist-mono)]">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </FadeInSection>

          {/* Secondary features — two stacked tilt cards */}
          <div className="flex flex-col gap-3">
            <FadeInSection delay={0.12}>
              <TiltCard className="h-full">
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 p-7 flex flex-col gap-4 cursor-default h-full">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center shadow-sm">
                    <div className="grid grid-cols-2 gap-0.5">
                      {["#374B52", "#587246", "#383E42", "#E7E3DC"].map((c) => (
                        <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-2 tracking-tight">
                      12 teintes RAL
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Palette de coloris certifiés ArcelorMittal, visualisés avec matière métallique
                      laquée et reflets HDR.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <TiltCard className="h-full">
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 p-7 flex flex-col gap-4 cursor-default h-full">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center shadow-sm">
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      className="text-zinc-800 dark:text-zinc-200"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-2 tracking-tight">
                      Export professionnel
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      PNG haute résolution sur fond blanc, prêt pour vos présentations clients et
                      dossiers techniques.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </FadeInSection>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Band ────────────────────────────────────────────────────────────────

const STATS = [
  { value: 204, suffix: "", label: "profils configurés" },
  { value: 17, suffix: "+", label: "pays livrés" },
  { value: 6, suffix: "", label: "typologies de profils" },
];

function Stats() {
  return (
    <section className="bg-zinc-950 dark:bg-zinc-950 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24">
        {/* Top accent */}
        <div className="w-8 h-px bg-[#E31837]/60 mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          {STATS.map((stat, i) => (
            <FadeInSection key={stat.label} delay={i * 0.1}>
              <div>
                <div className="text-[clamp(3rem,6vw,4.5rem)] font-bold tracking-tighter text-white leading-none mb-2">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-sm text-zinc-500 font-medium">
                  {stat.label}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Choisissez le profil",
    body: "Sélectionnez parmi les panneaux sandwich toiture ou les bardages de façade dans le catalogue intégré.",
  },
  {
    number: "02",
    title: "Configurez l'aspect",
    body: "Ajustez la longueur du panneau de 1 à 12 mètres, puis appliquez une couleur RAL directement sur la géométrie 3D.",
  },
  {
    number: "03",
    title: "Exportez la vue",
    body: "Positionnez la caméra avec les préréglages, activez le fond blanc et téléchargez un PNG haute résolution.",
  },
];

function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-12 md:gap-20 items-start">
          {/* Left — sticky header */}
          <FadeInSection direction="left">
            <div className="md:sticky md:top-32">
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                Mode d&apos;emploi
              </p>
              <h2 className="text-3xl md:text-[2.6rem] font-semibold tracking-tighter text-zinc-950 dark:text-white leading-tight mb-6">
                Trois étapes,
                <br />
                zéro friction
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10 max-w-[34ch]">
                Du choix du profil à l&apos;export PNG, le flux de travail est conçu pour aller à l&apos;essentiel.
              </p>
              <MagneticWrap>
                <Link
                  href="/visualizer"
                  className="group inline-flex items-center gap-2.5 px-6 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 text-sm"
                >
                  Commencer maintenant
                  <span className="w-5 h-5 rounded-full bg-white/10 dark:bg-zinc-950/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform">
                    <ArrowRight size={11} weight="bold" />
                  </span>
                </Link>
              </MagneticWrap>
            </div>
          </FadeInSection>

          {/* Right — vertical timeline steps */}
          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <FadeInSection key={step.number} delay={i * 0.12} direction="right">
                <div className="flex gap-5 relative pb-10 last:pb-0">
                  {/* Vertical connector line (not on last) */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-[1.3rem] top-11 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
                  )}

                  {/* Step circle */}
                  <div className="shrink-0 w-[2.6rem] h-[2.6rem] rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold font-[family-name:var(--font-geist-mono)] text-zinc-400 dark:text-zinc-500">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-2.5">
                    <h3 className="text-base font-semibold text-zinc-950 dark:text-white tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-10 md:gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white tracking-tighter">AM</span>
              </div>
              <span className="text-sm font-semibold text-white/80 tracking-tight">
                Building Solutions
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-[30ch]">
              Outil interne de visualisation 3D des profils acier pour la couverture et le bardage.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-600 mb-4">
              Application
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/visualizer", label: "Visualiseur 3D" },
                { href: "/settings", label: "Paramètres" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-600 mb-4">
              Profils
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Sandwich T39",
                "Sandwich TS 1000",
                "Tôle T79",
                "Bardage T29",
                "Bardage B32",
                "Bardage B18",
              ].map((name) => (
                <Link
                  key={name}
                  href="/visualizer"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © 2026 ArcelorMittal Building Solutions — Usage interne uniquement
          </p>
          <p className="text-xs text-zinc-600 font-[family-name:var(--font-geist-mono)]">
            Rendu 3D · Géométrie paramétrique exacte
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  // Hydrate dark mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("steel-viz-dark-mode");
      if (saved === "true") setDarkMode(true);
    } catch {
      // ignore
    }
  }, []);

  // Persist dark mode + propagate to html element for global Tailwind dark: classes
  useEffect(() => {
    try {
      localStorage.setItem("steel-viz-dark-mode", String(darkMode));
      document.documentElement.classList.toggle("dark", darkMode);
    } catch {
      // ignore
    }
  }, [darkMode]);

  return (
    <div className={`flex flex-col min-h-[100dvh]${darkMode ? " dark" : ""}`}>
      <Nav darkMode={darkMode} setDarkMode={setDarkMode} />
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <Footer />
    </div>
  );
}

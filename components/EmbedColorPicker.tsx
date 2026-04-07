"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Color } from "@/lib/data";

interface EmbedColorPickerProps {
  colors: Color[];
  activeColor: Color;
  onChange: (color: Color) => void;
}

export default function EmbedColorPicker({
  colors,
  activeColor,
  onChange,
}: EmbedColorPickerProps) {
  const [hoveredRal, setHoveredRal] = useState<string | null>(null);

  return (
    <div className="px-3 py-2.5">
      <div
        className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {colors.map((color) => {
          const isActive = color.ral === activeColor.ral;
          const isHovered = hoveredRal === color.ral;

          return (
            <div key={color.ral} className="relative flex-shrink-0">
              <motion.button
                onClick={() => onChange(color)}
                onHoverStart={() => setHoveredRal(color.ral)}
                onHoverEnd={() => setHoveredRal(null)}
                whileTap={{ scale: 0.88 }}
                style={{ backgroundColor: color.hex }}
                className={`w-7 h-7 rounded-full cursor-pointer transition-shadow duration-200 ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-zinc-900"
                    : "hover:ring-2 hover:ring-offset-1 hover:ring-zinc-400"
                }`}
                aria-label={`${color.name} (${color.ral})`}
                aria-pressed={isActive}
              />

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.1 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                  >
                    <div className="bg-zinc-900 text-white rounded-md px-2 py-1 text-center whitespace-nowrap shadow-lg">
                      <p className="text-[10px] font-semibold leading-tight">
                        {color.name}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-[family-name:var(--font-geist-mono)] leading-tight mt-0.5">
                        {color.ral}
                      </p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-zinc-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

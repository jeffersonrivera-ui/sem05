import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { COLORS } from "../config";
import { threatLevel } from "../lib/anim";

/**
 * Fondo global persistente: negro profundo, resplandor ambiental y piso de
 * cuadrícula en perspectiva. Su color sigue el estado de amenaza (azul ↔ rojo).
 */
/** Convierte "rgba(r, g, b, a)" o "#rrggbb" a rgba con la opacidad indicada */
const withAlpha = (color: string, a: number) => {
  const alpha = Math.max(0, Math.min(1, a));
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1, 7), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const [r, g, b] = color.replace(/[^\d.,]/g, "").split(",");
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const lvl = threatLevel(frame);
  const glowColor = interpolateColors(lvl, [0, 1], [COLORS.blue, COLORS.red]);
  const gridColor = interpolateColors(lvl, [0, 1], [COLORS.neon, COLORS.red]);
  const intro = Math.min(1, frame / 60);
  const pulse = 0.9 + 0.1 * Math.sin(frame * (lvl > 0.5 ? 0.3 : 0.08));
  const glowAmt = 0.28 - lvl * 0.12; // el rojo es más luminoso: menos intensidad

  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 45%, ${withAlpha(glowColor, glowAmt * intro * pulse)} 0%, ${withAlpha(glowColor, 0.06 * intro)} 45%, transparent 75%)`,
        }}
      />
      {/* Piso de cuadrícula */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "62%",
          width: 4000,
          height: 700,
          marginLeft: -2000,
          perspective: 900,
          perspectiveOrigin: "50% 0%",
          opacity: 0.55 * intro,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: "rotateX(-74deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `linear-gradient(${withAlpha(gridColor, 0.22)} 2px, transparent 2px), linear-gradient(90deg, ${withAlpha(gridColor, 0.22)} 2px, transparent 2px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0px ${(frame * 1.2) % 90}px`,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 75%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 75%, transparent 100%)",
          }}
        />
      </div>
      {/* Horizonte luminoso */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "61.5%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${withAlpha(gridColor, 0.53)}, transparent)`,
          opacity: 0.6 * intro,
          boxShadow: `0 0 30px ${gridColor}`,
        }}
      />
    </AbsoluteFill>
  );
};

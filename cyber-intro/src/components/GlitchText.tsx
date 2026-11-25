import React from "react";
import { random, useCurrentFrame } from "remotion";

type Props = {
  text: string;
  intensity: number; // 0 = limpio, 1 = glitch fuerte
  style: React.CSSProperties;
  color?: string;
  seed?: string;
  splitA?: string;
  splitB?: string;
};

/**
 * Texto con efecto glitch: separación RGB, cortes horizontales desplazados
 * y parpadeo. Todo determinista por frame (seguro para el render).
 */
export const GlitchText: React.FC<Props> = ({
  text,
  intensity,
  style,
  color = "#fff",
  seed = "g",
  splitA = "#ff2a3a",
  splitB = "#2ad8ff",
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2); // el glitch cambia cada 2 frames
  const r = (k: string) => random(`${seed}-${k}-${step}`);
  const off = intensity * 14;
  const dx = (r("dx") - 0.5) * off * 2;
  const slices = intensity > 0.05 ? 4 : 0;

  const base: React.CSSProperties = { ...style, margin: 0, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* capas de aberración cromática */}
      <div style={{ ...base, position: "absolute", inset: 0, color: splitA, opacity: 0.85 * Math.min(1, intensity * 2 + 0.15), transform: `translate(${-off - 2 + dx}px, ${(r("ay") - 0.5) * off * 0.4}px)`, mixBlendMode: "screen" }}>
        {text}
      </div>
      <div style={{ ...base, position: "absolute", inset: 0, color: splitB, opacity: 0.85 * Math.min(1, intensity * 2 + 0.15), transform: `translate(${off + 2 - dx}px, ${(r("by") - 0.5) * off * 0.4}px)`, mixBlendMode: "screen" }}>
        {text}
      </div>
      <div style={{ ...base, position: "relative", color, opacity: r("flick") < intensity * 0.25 ? 0.3 : 1 }}>{text}</div>
      {/* cortes desplazados */}
      {new Array(slices).fill(0).map((_, i) => {
        if (r(`on${i}`) > intensity) return null;
        const top = r(`t${i}`) * 90;
        const hgt = 3 + r(`h${i}`) * 14;
        const shift = (r(`s${i}`) - 0.5) * 80 * intensity;
        return (
          <div
            key={i}
            style={{
              ...base,
              position: "absolute",
              inset: 0,
              color: i % 2 ? splitB : color,
              clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - hgt)}% 0)`,
              transform: `translateX(${shift}px)`,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};

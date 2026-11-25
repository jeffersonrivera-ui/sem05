import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  count?: number;
  color?: string;
  seed?: string;
  /** desplazamiento vertical en px por frame (negativo = sube) */
  drift?: number;
  maxSize?: number;
  opacity?: number;
};

/** Polvo digital / bokeh flotante con profundidad (tamaño, velocidad y brillo según z). */
export const Particles: React.FC<Props> = ({
  count = 80,
  color = "#3FC8FF",
  seed = "p",
  drift = -0.6,
  maxSize = 7,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const parts = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const z = random(`${seed}-z-${i}`); // 0 lejos – 1 cerca
        return {
          x: random(`${seed}-x-${i}`) * width,
          y: random(`${seed}-y-${i}`) * height,
          z,
          size: 1 + z * z * maxSize,
          sway: 10 + random(`${seed}-s-${i}`) * 40,
          phase: random(`${seed}-ph-${i}`) * Math.PI * 2,
          tw: 0.04 + random(`${seed}-tw-${i}`) * 0.08,
        };
      }),
    [count, seed, width, height, maxSize],
  );

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {parts.map((p, i) => {
        const speed = 0.3 + p.z * 1.2;
        let y = (p.y + frame * drift * speed) % (height + 40);
        if (y < -20) y += height + 40;
        const x = p.x + Math.sin(frame * 0.015 + p.phase) * p.sway;
        const twinkle = 0.55 + 0.45 * Math.sin(frame * p.tw + p.phase);
        const s = p.size;
        const soft = p.z > 0.85; // partículas muy cercanas = bokeh desenfocado
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: soft ? s * 4 : s,
              height: soft ? s * 4 : s,
              borderRadius: "50%",
              background: soft
                ? `radial-gradient(circle, ${color}55 0%, ${color}22 45%, transparent 70%)`
                : color,
              boxShadow: soft ? undefined : `0 0 ${4 + s * 2}px ${color}`,
              opacity: (0.25 + p.z * 0.75) * twinkle,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

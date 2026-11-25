import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Viñeta cinematográfica */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.85 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 45%, rgba(0,0,0,${strength * 0.6}) 80%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Grano de película animado (determinista por frame) */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 640 360" preserveAspectRatio="none">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="640" height="360" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Líneas de escaneo sutiles */
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => (
  <AbsoluteFill
    style={{
      opacity,
      background:
        "repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 3px)",
      pointerEvents: "none",
    }}
  />
);

/** Destello de pantalla completa (flash de transición) */
export const Flash: React.FC<{ amount: number; color?: string }> = ({ amount, color = "#ffffff" }) =>
  amount <= 0.001 ? null : (
    <AbsoluteFill style={{ background: color, opacity: amount, mixBlendMode: "screen", pointerEvents: "none" }} />
  );

/** Destello de lente anamórfico horizontal */
export const AnamorphicFlare: React.FC<{ x: number; y: number; intensity: number; color: string; width?: number }> = ({
  x,
  y,
  intensity,
  color,
  width = 1400,
}) =>
  intensity <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: -width / 2,
          top: -3,
          width,
          height: 6,
          borderRadius: 6,
          background: `linear-gradient(90deg, transparent, ${color} 30%, #ffffff 50%, ${color} 70%, transparent)`,
          opacity: intensity,
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -width * 0.35,
          top: -40,
          width: width * 0.7,
          height: 80,
          background: `radial-gradient(ellipse at center, ${color}66 0%, transparent 70%)`,
          opacity: intensity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -90,
          top: -90,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, #ffffff 0%, ${color}aa 18%, transparent 60%)`,
          opacity: intensity,
        }}
      />
    </div>
  );

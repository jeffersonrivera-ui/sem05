import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, TEXTS } from "../config";
import { accent, clamp, threatLevel } from "../lib/anim";

const Corner: React.FC<{ x: "left" | "right"; y: "top" | "bottom"; color: string }> = ({ x, y, color }) => (
  <div
    style={{
      position: "absolute",
      [x]: 48,
      [y]: 48,
      width: 46,
      height: 46,
      [`border${y === "top" ? "Top" : "Bottom"}`]: `2px solid ${color}`,
      [`border${x === "left" ? "Left" : "Right"}`]: `2px solid ${color}`,
      opacity: 0.7,
    }}
  />
);

/** Interfaz HUD discreta: esquinas de encuadre, código de tiempo y etiqueta. */
export const HUD: React.FC<{ visibleUntil: number }> = ({ visibleUntil }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lvl = threatLevel(frame);
  const color = accent(lvl);
  const op = Math.min(interpolate(frame, [35, 60], [0, 1], clamp), interpolate(frame, [visibleUntil - 15, visibleUntil], [1, 0], clamp));
  if (op <= 0) return null;
  const secs = Math.floor(frame / fps);
  const ff = String(frame % fps).padStart(2, "0");
  const tc = `00:00:${String(secs).padStart(2, "0")}:${ff}`;
  const status = lvl > 0.5 ? "AMENAZA DETECTADA" : frame > 450 ? "PROTECCIÓN ACTIVA" : "SISTEMA EN LÍNEA";
  const blink = lvl > 0.5 ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0.35) : 1;

  return (
    <AbsoluteFill style={{ opacity: op, pointerEvents: "none", fontFamily: FONTS.mono, color: COLORS.muted, fontSize: 15, letterSpacing: 2 }}>
      <Corner x="left" y="top" color={color} />
      <Corner x="right" y="top" color={color} />
      <Corner x="left" y="bottom" color={color} />
      <Corner x="right" y="bottom" color={color} />
      <div style={{ position: "absolute", left: 66, top: 62 }}>{TEXTS.hudTag}</div>
      <div style={{ position: "absolute", right: 66, top: 62, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}`, opacity: blink }} />
        <span style={{ color }}>{status}</span>
      </div>
      <div style={{ position: "absolute", right: 66, bottom: 60 }}>{tc}</div>
      <div style={{ position: "absolute", left: 66, bottom: 60, color: lvl > 0.5 ? color : COLORS.muted }}>{lvl > 0.5 ? "NODO 07 · ENLACE COMPROMETIDO" : "NODO 07 · ENLACE CIFRADO"}</div>
    </AbsoluteFill>
  );
};

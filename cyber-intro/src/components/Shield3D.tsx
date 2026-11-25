import React from "react";
import { COLORS } from "../config";

export const SHIELD_PATH =
  "M100 8 L184 40 V112 C184 168 148 206 100 232 C52 206 16 168 16 112 V40 Z";
const INNER_PATH =
  "M100 26 L168 52 V112 C168 158 140 190 100 212 C60 190 32 158 32 112 V52 Z";

type Props = {
  size: number; // ancho en px
  draw?: number; // 0–1 trazo del contorno
  fill?: number; // 0–1 opacidad del cuerpo
  rotateY?: number; // grados
  rotateX?: number;
  sweep?: number; // 0–1 posición del brillo especular (fuera de rango = oculto)
  emblem?: "lock" | "check" | "none";
  emblemProgress?: number;
  glow?: number; // 0–1
  depth?: number; // capas de extrusión
  idSuffix?: string;
};

/**
 * Escudo digital 3D: extrusión por capas en CSS 3D + cara frontal SVG con
 * patrón hexagonal, contorno animado, emblema y reflejo especular.
 */
export const Shield3D: React.FC<Props> = ({
  size,
  draw = 1,
  fill = 1,
  rotateY = 0,
  rotateX = 0,
  sweep = -1,
  emblem = "lock",
  emblemProgress = 1,
  glow = 1,
  depth = 14,
  idSuffix = "a",
}) => {
  const h = size * 1.2;
  const id = (n: string) => `${n}-${idSuffix}`;
  const sweepX = -80 + sweep * 360;

  return (
    <div style={{ position: "relative", width: size, height: h }}>
      {/* Halo de energía detrás (fuera del contexto 3D para no aplanarlo) */}
      <div
        style={{
          position: "absolute",
          left: -size * 0.6,
          top: -h * 0.5,
          width: size * 2.2,
          height: h * 2,
          background: `radial-gradient(ellipse at center, ${COLORS.neon}${Math.round(90 * glow)
            .toString(16)
            .padStart(2, "0")} 0%, ${COLORS.blue}33 30%, transparent 62%)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          {/* Capas de extrusión (grosor del escudo) */}
          {new Array(depth).fill(0).map((_, i) => (
            <svg
              key={i}
              width={size}
              height={h}
              viewBox="0 0 200 240"
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateZ(${-(i + 1) * 2.2}px)`,
                opacity: fill,
              }}
            >
              <path d={SHIELD_PATH} fill={i === depth - 1 ? "#020611" : i % 3 === 0 ? "#0f4d86" : "#0a3563"} />
            </svg>
          ))}
          {/* Cara frontal */}
          <svg width={size} height={h} viewBox="0 0 200 240" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <linearGradient id={id("face")} x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="#1f8fe6" />
                <stop offset="45%" stopColor={COLORS.blue} />
                <stop offset="100%" stopColor="#06244a" />
              </linearGradient>
              <pattern id={id("hex")} width="14" height="24.25" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">
                <path d="M7 0 L14 4 V12 L7 16 L0 12 V4 Z M7 16 V24.25" fill="none" stroke={COLORS.neonSoft} strokeWidth="0.6" />
              </pattern>
              <clipPath id={id("clip")}>
                <path d={SHIELD_PATH} />
              </clipPath>
              <linearGradient id={id("spec")} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <filter id={id("glow")} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g opacity={fill}>
              <path d={SHIELD_PATH} fill={`url(#${id("face")})`} />
              <path d={SHIELD_PATH} fill={`url(#${id("hex")})`} opacity="0.35" />
              <path d={INNER_PATH} fill="none" stroke={COLORS.neonSoft} strokeWidth="1.2" opacity="0.6" />
              {/* sombreado lateral para volumen */}
              <path d="M100 8 L184 40 V112 C184 168 148 206 100 232 Z" fill="#000" opacity="0.18" />
            </g>
            {/* Contorno de energía */}
            <path
              d={SHIELD_PATH}
              fill="none"
              stroke={COLORS.neon}
              strokeWidth="3.5"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - draw}
              filter={`url(#${id("glow")})`}
            />
            {/* Emblema */}
            {emblem === "lock" && (
              <g
                fill="none"
                stroke="#EAF8FF"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${id("glow")})`}
                opacity={emblemProgress}
                transform={`translate(100 122) scale(${0.7 + 0.3 * emblemProgress}) translate(-100 -122)`}
              >
                <rect x="72" y="112" width="56" height="44" rx="7" />
                <path d="M84 112 V98 a16 16 0 0 1 32 0 V112" />
                <path d="M100 128 V140" />
              </g>
            )}
            {emblem === "check" && (
              <path
                d="M68 122 L92 146 L134 100"
                fill="none"
                stroke="#EAF8FF"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - emblemProgress}
                filter={`url(#${id("glow")})`}
              />
            )}
            {/* Brillo especular que recorre el escudo */}
            {sweep >= 0 && sweep <= 1 && (
              <g clipPath={`url(#${id("clip")})`}>
                <rect x={sweepX} y="-20" width="70" height="300" fill={`url(#${id("spec")})`} transform="skewX(-20)" />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

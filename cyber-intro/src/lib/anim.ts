import { Easing, interpolate, interpolateColors } from "remotion";
import { BEATS, COLORS } from "../config";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const ease = Easing.bezier(0.22, 1, 0.36, 1); // easeOutQuint-ish
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);

/** Interpolación con clamp y easing por defecto */
export const tween = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = ease,
) => interpolate(frame, input, output, { ...clamp, easing });

/** Fundido de entrada y salida de una escena */
export const sceneFade = (frame: number, duration: number, inLen = 15, outLen = 15) =>
  Math.min(tween(frame, [0, inLen], [0, 1], easeInOut), tween(frame, [duration - outLen, duration], [1, 0], easeInOut));

/** 0 = azul, 1 = rojo — estado global de iluminación */
export const threatLevel = (absFrame: number) =>
  Math.min(
    interpolate(absFrame, [BEATS.toRed - 6, BEATS.toRed + 10], [0, 1], { ...clamp, easing: easeInOut }),
    interpolate(absFrame, [BEATS.toBlue - 12, BEATS.toBlue + 22], [1, 0], { ...clamp, easing: easeInOut }),
  );

export const accent = (level: number) => interpolateColors(level, [0, 1], [COLORS.neon, COLORS.red]);
export const accentDeep = (level: number) => interpolateColors(level, [0, 1], [COLORS.blue, COLORS.redDeep]);

/** Ruido pseudo-aleatorio suave (para temblor de cámara, parpadeos) */
export const noise1D = (x: number, seed = 0) => {
  const s = (n: number) => {
    const v = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return (s(i) * (1 - u) + s(i + 1) * u) * 2 - 1;
};

/** Temblor de cámara que decae tras un impacto */
export const shake = (frame: number, hitFrame: number, strength = 18, decay = 18, seed = 1) => {
  const t = frame - hitFrame;
  if (t < 0) return { x: 0, y: 0, r: 0 };
  const k = Math.exp(-t / decay) * strength;
  return {
    x: noise1D(t * 0.9, seed) * k,
    y: noise1D(t * 0.9, seed + 7) * k,
    r: noise1D(t * 0.6, seed + 13) * k * 0.04,
  };
};

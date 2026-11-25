import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { GlitchText } from "../components/GlitchText";
import { FILE_KINDS, FileIcon, WarningIcon } from "../components/Icons";
import { Monitor } from "../components/Monitor";
import { Particles } from "../components/Particles";
import { BEATS, COLORS, FONTS, TEXTS } from "../config";
import { clamp, ease, easeInOut, noise1D, sceneFade, shake, tween } from "../lib/anim";

const CX = 960;
const CY = 470;

/** Archivos digitales que salen despedidos de la pantalla hacia la cámara y se desintegran. */
const ScatteringFiles: React.FC<{ frame: number; hit: number }> = ({ frame, hit }) => {
  const files = useMemo(
    () =>
      new Array(30).fill(0).map((_, i) => {
        const ang = random(`f-a-${i}`) * Math.PI * 2;
        return {
          ang,
          delay: random(`f-d-${i}`) * 70,
          speed: 0.6 + random(`f-s-${i}`) * 0.8,
          kind: FILE_KINDS[i % FILE_KINDS.length],
          spin: (random(`f-r-${i}`) - 0.5) * 8,
          size: 46 + random(`f-z-${i}`) * 40,
        };
      }),
    [],
  );
  return (
    <>
      {files.map((f, i) => {
        const t = frame - hit - 3 - f.delay;
        if (t < 0) return null;
        const life = 70 / f.speed;
        const k = Math.min(1, t / life);
        const dist = interpolate(k, [0, 1], [0, 1150], { easing: ease });
        const z = k * f.speed; // acercamiento a cámara
        const scale = 0.35 + z * 1.6;
        const x = CX + Math.cos(f.ang) * dist * 1.25;
        const y = CY + Math.sin(f.ang) * dist * 0.75;
        const op = interpolate(k, [0, 0.08, 0.55, 1], [0, 1, 0.9, 0]);
        const dissolve = interpolate(k, [0.45, 1], [0, 8], clamp);
        const color = k > 0.35 ? COLORS.red : COLORS.neonSoft;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${f.spin * t}deg)`,
              opacity: op,
              filter: `blur(${dissolve}px) drop-shadow(0 0 10px ${color})`,
            }}
          >
            <FileIcon kind={f.kind} size={f.size} color={color} />
          </div>
        );
      })}
    </>
  );
};

/** Explosión de partículas rojas desde la pantalla */
const RedBurst: React.FC<{ frame: number; hit: number }> = ({ frame, hit }) => {
  const parts = useMemo(
    () =>
      new Array(180).fill(0).map((_, i) => ({
        ang: random(`b-a-${i}`) * Math.PI * 2,
        v: 6 + random(`b-v-${i}`) * 26,
        size: 1.5 + random(`b-s-${i}`) * 4,
        delay: random(`b-d-${i}`) * 50,
      })),
    [],
  );
  return (
    <>
      {parts.map((p, i) => {
        const t = frame - hit - p.delay * (i % 3 === 0 ? 1 : 0);
        if (t < 0) return null;
        const d = (p.v * (1 - Math.exp(-t / 22))) * 22;
        const op = interpolate(t, [0, 4, 60, 90], [0, 1, 0.6, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CX + Math.cos(p.ang) * d * 1.3,
              top: CY + Math.sin(p.ang) * d * 0.85 + t * 0.6,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 5 === 0 ? "#FFD0D3" : COLORS.red,
              boxShadow: `0 0 ${p.size * 3}px ${COLORS.red}`,
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};

/** Contenido de la pantalla comprometida */
const HackedScreen: React.FC<{ frame: number; hit: number }> = ({ frame, hit }) => {
  const t = frame - hit;
  const pct = Math.floor(interpolate(t, [10, 140], [0, 87], { ...clamp, easing: easeInOut }));
  const blink = Math.floor(frame / 6) % 2 === 0;
  const gl = t < 14 ? 1 - t / 14 : noise1D(frame * 0.5, 3) > 0.7 ? 0.5 : 0.08;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 18, background: `${COLORS.redDeep}66` }}>
      <div style={{ opacity: blink ? 1 : 0.4, filter: `drop-shadow(0 0 18px ${COLORS.red})` }}>
        <WarningIcon size={120} color={COLORS.redHot} />
      </div>
      <GlitchText
        text={TEXTS.impactScreen}
        intensity={gl}
        seed="hs"
        style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 26, letterSpacing: 3, textShadow: `0 0 16px ${COLORS.red}` }}
      />
      <div style={{ width: 380, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 15, color: COLORS.redHot, letterSpacing: 2, marginBottom: 8 }}>
          <span>{TEXTS.encrypting}</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 8, background: "#2a0a0e", border: `1px solid ${COLORS.red}88` }}>
          <div style={{ width: `${pct}%`, height: "100%", background: COLORS.red, boxShadow: `0 0 12px ${COLORS.red}` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Señales de advertencia con etiqueta que aparecen sincronizadas con los pitidos. */
const WarningTag: React.FC<{ frame: number; at: number; text: string; x: number; y: number; align: "left" | "right" }> = ({
  frame,
  at,
  text,
  x,
  y,
  align,
}) => {
  const t = frame - at;
  if (t < 0) return null;
  const pop = interpolate(t, [0, 5, 10], [0, 1.15, 1], { ...clamp, easing: ease });
  const line = tween(t, [4, 18], [0, 1]);
  const typed = Math.floor(interpolate(t, [6, 22], [0, text.length], clamp));
  const blink = t < 18 ? (Math.floor(t / 3) % 2 ? 0.4 : 1) : 1;
  return (
    <div style={{ position: "absolute", [align]: x, top: y, display: "flex", flexDirection: align === "left" ? "row" : "row-reverse", alignItems: "center", gap: 18 }}>
      <div style={{ transform: `scale(${pop})`, opacity: blink, filter: `drop-shadow(0 0 14px ${COLORS.red})` }}>
        <WarningIcon size={74} color={COLORS.redHot} />
      </div>
      <div style={{ width: 34 * line, height: 2, background: COLORS.red, boxShadow: `0 0 8px ${COLORS.red}` }} />
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: 2,
          color: COLORS.white,
          padding: "10px 16px",
          border: `1px solid ${COLORS.red}aa`,
          background: "rgba(40,5,10,0.65)",
          opacity: line,
          whiteSpace: "nowrap",
          minWidth: 20,
        }}
      >
        {text.slice(0, typed)}
      </div>
    </div>
  );
};

/** ESCENA 3 — EL IMPACTO (10–15 s) */
export const Scene3Impact: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const hit = BEATS.impact - from;
  const fade = sceneFade(frame, duration, 6, 16);

  const k = shake(frame, hit, 34, 16, 5);
  const k2 = shake(frame, 384 - from, 10, 8, 8); // pequeño golpe adicional (glitch)
  const push = interpolate(frame, [hit, duration], [1.0, 1.12], { ...clamp, easing: easeInOut });
  const dutch = interpolate(frame, [hit, duration], [0, -2.2], { ...clamp, easing: easeInOut });
  const punch = interpolate(frame, [hit, hit + 4, hit + 20], [1, 1.07, 1], clamp);

  // Ondas expansivas del impacto
  const ring = interpolate(frame, [hit, hit + 35], [0, 1], { ...clamp, easing: ease });
  // Distorsión: desplazamiento cromático que decae
  const distort = Math.max(interpolate(frame, [hit, hit + 22], [1, 0], clamp), noise1D(frame * 0.3, 21) > 0.82 ? 0.45 : 0);

  const tagsAt = [330, 368, 406].map((b) => b - from);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill
        style={{
          transform: `translate(${k.x + k2.x}px, ${k.y + k2.y}px) rotate(${dutch + k.r}deg) scale(${push * punch})`,
        }}
      >
        <Particles count={60} color={COLORS.red} seed="s3p" drift={-2.2} maxSize={5} />

        {/* Computadora comprometida con aberración cromática */}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "relative", transform: "translateY(20px)" }}>
            {distort > 0.05 && (
              <>
                <div style={{ position: "absolute", inset: 0, transform: `translateX(${-18 * distort}px)`, opacity: 0.5 * distort, mixBlendMode: "screen", filter: "sepia(1) saturate(8) hue-rotate(-50deg)" }}>
                  <Monitor width={580} glow={COLORS.red} reflection={false} />
                </div>
                <div style={{ position: "absolute", inset: 0, transform: `translateX(${18 * distort}px)`, opacity: 0.4 * distort, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(150deg)" }}>
                  <Monitor width={580} glow={COLORS.neon} reflection={false} />
                </div>
              </>
            )}
            <div style={{ transform: `skewX(${distort * 6 * noise1D(frame, 2)}deg)` }}>
              <Monitor width={580} glow={COLORS.red} glowIntensity={0.8 + 0.2 * Math.sin(frame * 0.6)}>
                <HackedScreen frame={frame} hit={hit} />
              </Monitor>
            </div>
          </div>
        </AbsoluteFill>

        {/* Onda expansiva */}
        {ring > 0 && ring < 1 && (
          <div
            style={{
              position: "absolute",
              left: CX,
              top: CY,
              width: 2400 * ring,
              height: 1500 * ring,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `${10 * (1 - ring) + 1}px solid ${COLORS.red}`,
              boxShadow: `0 0 60px ${COLORS.red}, inset 0 0 60px ${COLORS.red}`,
              opacity: 1 - ring,
            }}
          />
        )}

        <RedBurst frame={frame} hit={hit} />
        <ScatteringFiles frame={frame} hit={hit} />
      </AbsoluteFill>

      {/* Etiquetas de advertencia (fuera de la cámara para estabilidad de lectura) */}
      <WarningTag frame={frame} at={tagsAt[0]} text={TEXTS.impactTags[0]} x={64} y={230} align="left" />
      <WarningTag frame={frame} at={tagsAt[1]} text={TEXTS.impactTags[1]} x={64} y={430} align="right" />
      <WarningTag frame={frame} at={tagsAt[2]} text={TEXTS.impactTags[2]} x={64} y={630} align="left" />

      {/* Velo rojo y destello del impacto */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${COLORS.redDeep}aa 100%)`,
          opacity: 0.6 + 0.25 * Math.sin(frame * 0.25),
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [hit, hit + 3, hit + 12], [0, 0.55, 0], clamp), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

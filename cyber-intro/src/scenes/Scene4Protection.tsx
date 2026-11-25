import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CheckIcon } from "../components/Icons";
import { Monitor } from "../components/Monitor";
import { Particles } from "../components/Particles";
import { Shield3D } from "../components/Shield3D";
import { BEATS, COLORS, FONTS, TEXTS } from "../config";
import { clamp, ease, easeInOut, sceneFade, tween } from "../lib/anim";

const CX = 960;
const CY = 470;

/** Partículas azules que convergen hacia el escudo (carga de energía) */
const Converge: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const parts = useMemo(
    () =>
      new Array(140).fill(0).map((_, i) => ({
        ang: random(`c-a-${i}`) * Math.PI * 2,
        r0: 700 + random(`c-r-${i}`) * 700,
        delay: random(`c-d-${i}`) * 45,
        dur: 22 + random(`c-u-${i}`) * 20,
        size: 2 + random(`c-s-${i}`) * 3.5,
        swirl: 0.6 + random(`c-w-${i}`) * 0.8,
      })),
    [],
  );
  return (
    <>
      {parts.map((p, i) => {
        const t = (frame - start - p.delay) / p.dur;
        if (t < 0 || t > 1) return null;
        const e = easeInOut(t);
        const r = p.r0 * (1 - e) + 60;
        const a = p.ang + e * p.swirl * 1.6;
        const op = interpolate(t, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CX + Math.cos(a) * r * 1.3,
              top: CY + Math.sin(a) * r * 0.8,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 4 === 0 ? "#ffffff" : COLORS.neon,
              boxShadow: `0 0 ${p.size * 4}px ${COLORS.neon}`,
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};

/** Anillo orbital de energía en perspectiva con chispa viajera */
const OrbitRing: React.FC<{ frame: number; rx: number; tilt: number; spin: number; delay: number; color: string; reveal: number }> = ({
  frame,
  rx,
  tilt,
  spin,
  delay,
  color,
  reveal,
}) => {
  const ry = rx * 0.28;
  const a = (frame - delay) * spin;
  const sparkX = Math.cos(a) * rx;
  const sparkY = Math.sin(a) * ry;
  return (
    <svg
      width={rx * 2 + 80}
      height={rx * 2 + 80}
      viewBox={`${-rx - 40} ${-rx - 40} ${rx * 2 + 80} ${rx * 2 + 80}`}
      style={{ position: "absolute", left: CX - rx - 40, top: CY - rx - 40, transform: `rotate(${tilt}deg)`, overflow: "visible" }}
    >
      <ellipse rx={rx} ry={ry} fill="none" stroke={color} strokeOpacity={0.35 * reveal} strokeWidth={1.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - reveal} />
      <ellipse rx={rx} ry={ry} fill="none" stroke={color} strokeOpacity={0.8 * reveal} strokeWidth={2.5} pathLength={100} strokeDasharray="6 94" strokeDashoffset={-((frame * spin * 16) % 100)} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <circle cx={sparkX} cy={sparkY} r={5} fill="#fff" opacity={reveal} style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})` }} />
    </svg>
  );
};

/** Chip HUD de medida de protección */
const Chip: React.FC<{ frame: number; at: number; text: string; x: number; y: number }> = ({ frame, at, text, x, y }) => {
  const t = frame - at;
  if (t < 0) return null;
  const o = tween(t, [0, 12], [0, 1]);
  const typed = Math.floor(interpolate(t, [2, 16], [0, text.length], clamp));
  const lineLen = Math.hypot(CX - x, CY - y);
  const ang = (Math.atan2(CY - y, CX - x) * 180) / Math.PI;
  const lineP = tween(t, [0, 16], [0, 0.42]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: lineLen * lineP,
          height: 1,
          background: `linear-gradient(90deg, ${COLORS.neon}, transparent)`,
          transform: `rotate(${ang}deg)`,
          transformOrigin: "0 0",
          opacity: 0.7 * o,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%, -50%) translateY(${(1 - o) * 14}px)`,
          opacity: o,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          border: `1px solid ${COLORS.neon}99`,
          background: "rgba(6,22,44,0.72)",
          boxShadow: `0 0 18px ${COLORS.blue}66`,
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: 3,
          color: COLORS.white,
          whiteSpace: "nowrap",
        }}
      >
        <CheckIcon size={22} color={COLORS.neon} progress={tween(t, [6, 16], [0, 1])} />
        {text.slice(0, typed)}
      </div>
    </>
  );
};

/** ESCENA 4 — LA PROTECCIÓN (15–20 s) */
export const Scene4Protection: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const fade = sceneFade(frame, duration, 8, 22);
  const cleanse = BEATS.toBlue - from; // 10
  const formed = BEATS.shieldForm - from; // 42

  // Onda azul que "limpia" el rojo
  const wave = interpolate(frame, [cleanse - 4, cleanse + 30], [0, 1], { ...clamp, easing: ease });

  // Cámara: retroceso lento (revelación) con leve giro
  const zoom = interpolate(frame, [0, duration], [1.14, 1.0], { ...clamp, easing: easeInOut });
  const rot = interpolate(frame, [0, duration], [1.2, 0], clamp);

  const draw = tween(frame, [cleanse + 2, formed], [0, 1], easeInOut);
  const fill = tween(frame, [formed - 10, formed + 10], [0, 0.42]);
  const rotY = interpolate(frame, [0, duration], [-24, 14], { ...clamp, easing: easeInOut });
  const sweep = interpolate(frame, [formed, formed + 30], [0, 1], clamp);
  const ringsIn = tween(frame, [formed - 6, formed + 30], [0, 1]);
  const formedPulse = interpolate(frame, [formed, formed + 20], [1, 0], clamp);
  const breathe = 0.85 + 0.15 * Math.sin(frame * 0.18);

  const monitorOk = tween(frame, [formed + 6, formed + 22], [0, 1]);

  const chipPos = [
    { x: 330, y: 250 },
    { x: 1590, y: 250 },
    { x: 260, y: 520 },
    { x: 1660, y: 520 },
    { x: 960, y: 125 },
  ];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) rotate(${rot}deg)` }}>
        <Particles count={80} color={COLORS.neon} seed="s4p" drift={-0.8} opacity={wave} />

        {/* Anillos de energía detrás */}
        <OrbitRing frame={frame} rx={560} tilt={-8} spin={0.045} delay={0} color={COLORS.neon} reveal={ringsIn} />
        <OrbitRing frame={frame} rx={470} tilt={14} spin={-0.06} delay={20} color={COLORS.blue} reveal={ringsIn} />

        {/* Escudo de energía 3D envolviendo la computadora */}
        <div style={{ position: "absolute", left: CX - 300, top: CY - 360 }}>
          <Shield3D size={600} draw={draw} fill={fill * breathe} rotateY={rotY} rotateX={4} sweep={sweep} emblem="none" glow={0.6 + formedPulse * 0.4} depth={8} idSuffix="s4" />
        </div>

        {/* Computadora protegida */}
        <div style={{ position: "absolute", left: CX - 230, top: CY - 150 }}>
          <Monitor width={460} glow={COLORS.neon} glowIntensity={0.7 + 0.3 * monitorOk} reflection={false}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 10 }}>
              <div style={{ filter: `drop-shadow(0 0 14px ${COLORS.neon})`, opacity: monitorOk }}>
                <CheckIcon size={90} color={COLORS.neonSoft} progress={monitorOk} strokeWidth={7} />
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 19, letterSpacing: 3, color: COLORS.white, opacity: monitorOk, textShadow: `0 0 12px ${COLORS.neon}` }}>
                {TEXTS.protectedLabel}
              </div>
            </AbsoluteFill>
          </Monitor>
        </div>

        <OrbitRing frame={frame} rx={640} tilt={4} spin={0.03} delay={40} color={COLORS.neonSoft} reveal={ringsIn * 0.7} />

        <Converge frame={frame} start={cleanse} />

        {/* Pulso cuando el escudo se completa */}
        {formedPulse > 0 && formedPulse < 1 && (
          <div
            style={{
              position: "absolute",
              left: CX,
              top: CY,
              width: 1500 * (1 - formedPulse),
              height: 1500 * (1 - formedPulse),
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `3px solid ${COLORS.neon}`,
              boxShadow: `0 0 40px ${COLORS.neon}`,
              opacity: formedPulse,
            }}
          />
        )}
      </AbsoluteFill>

      {/* Chips de medidas de protección */}
      {TEXTS.protectionChips.map((c, i) => (
        <Chip key={c} frame={frame} at={formed + 12 + i * 11} text={c} x={chipPos[i].x} y={chipPos[i].y} />
      ))}

      {/* Onda azul de limpieza (de rojo a azul) */}
      {wave > 0 && wave < 1 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              left: CX,
              top: CY,
              width: 2600 * wave,
              height: 2600 * wave,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle, transparent 55%, ${COLORS.neon}55 68%, #ffffffaa 70%, ${COLORS.blue}33 74%, transparent 76%)`,
              opacity: (1 - wave) * 0.8,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

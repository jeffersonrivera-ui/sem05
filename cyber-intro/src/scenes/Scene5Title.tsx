import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AnamorphicFlare } from "../components/Overlays";
import { Particles } from "../components/Particles";
import { Shield3D } from "../components/Shield3D";
import { BEATS, COLORS, FONTS, TEXTS } from "../config";
import { clamp, ease, easeInOut, tween } from "../lib/anim";

/** Título principal: letras que se condensan desde el desenfoque + barrido de luz. */
const TitleLine: React.FC<{ text: string; t: number; size: number; weight: number; spacingFrom: number; spacingTo: number; sweepT: number }> = ({
  text,
  t,
  size,
  weight,
  spacingFrom,
  spacingTo,
  sweepT,
}) => {
  const letters = text.split("");
  const spacing = interpolate(t, [0, 40], [spacingFrom, spacingTo], { ...clamp, easing: ease });
  const sweepPos = interpolate(sweepT, [0, 1], [-30, 130], clamp);
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", whiteSpace: "nowrap" }}>
      {letters.map((ch, i) => {
        const mid = (letters.length - 1) / 2;
        const delay = Math.abs(i - mid) * 1.2; // desde el centro hacia afuera
        const o = interpolate(t - delay, [0, 12], [0, 1], clamp);
        const blur = interpolate(t - delay, [0, 14], [18, 0], clamp);
        const y = interpolate(t - delay, [0, 16], [26, 0], { ...clamp, easing: ease });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONTS.display,
              fontWeight: weight,
              fontSize: size,
              lineHeight: 1,
              marginRight: i < letters.length - 1 ? spacing : 0,
              opacity: o,
              filter: `blur(${blur}px)`,
              transform: `translateY(${y}px)`,
              backgroundImage: `linear-gradient(100deg, ${COLORS.white} ${sweepPos - 18}%, #ffffff ${sweepPos - 4}%, ${COLORS.neon} ${sweepPos}%, #ffffff ${sweepPos + 4}%, ${COLORS.white} ${sweepPos + 18}%)`,
              backgroundSize: `${letters.length * 100}% 100%`,
              backgroundPosition: `${(i / Math.max(1, letters.length - 1)) * 100}% 0`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: `0 0 40px ${COLORS.blue}aa`,
              minWidth: ch === " " ? size * 0.35 : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Rayos de luz giratorios detrás del escudo */
const LightRays: React.FC<{ frame: number; intensity: number }> = ({ frame, intensity }) => (
  <div
    style={{
      position: "absolute",
      left: 960 - 900,
      top: 285 - 900,
      width: 1800,
      height: 1800,
      borderRadius: "50%",
      background: `repeating-conic-gradient(from ${frame * 0.25}deg, ${COLORS.neon}18 0deg, transparent 4deg, transparent 15deg)`,
      WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
      maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
      opacity: intensity,
    }}
  />
);

/** ESCENA 5 — REVELACIÓN DEL TÍTULO (20–25 s) */
export const Scene5Title: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const hit = BEATS.titleHit - from; // 40

  const enter = tween(frame, [4, hit], [0, 1], easeInOut);
  const shieldScale = interpolate(frame, [4, hit, hit + 8, hit + 30], [0.55, 1.0, 1.06, 1.0], clamp);
  const shieldRotY = interpolate(frame, [4, hit + 10], [-110, 0], { ...clamp, easing: ease }) + Math.sin(frame * 0.04) * 6;
  const draw = tween(frame, [6, hit - 4], [0, 1], easeInOut);
  const fill = tween(frame, [hit - 16, hit], [0, 1]);
  const emblem = tween(frame, [hit, hit + 16], [0, 1]);
  const sweep = interpolate(frame, [hit + 2, hit + 26], [0, 1], clamp);
  const sweep2 = interpolate(frame, [hit + 80, hit + 104], [0, 1], clamp);

  const flare = interpolate(frame, [hit - 2, hit + 2, hit + 40], [0, 1, 0], clamp);
  const flash = interpolate(frame, [hit, hit + 2, hit + 14], [0, 0.6, 0], clamp);

  const t1 = frame - hit;
  const t2 = frame - (hit + 14);
  const line = tween(frame, [hit + 24, hit + 52], [0, 1], easeInOut);
  const sub = tween(frame, [hit + 34, hit + 56], [0, 1]);
  const credits = tween(frame, [hit + 52, hit + 76], [0, 1]);
  const titleSweep = interpolate(frame, [hit + 18, hit + 60], [0, 1], clamp);

  const push = interpolate(frame, [0, duration], [1.0, 1.045], { ...clamp, easing: easeInOut });
  const fadeIn = tween(frame, [0, 12], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${COLORS.blue}30 0%, ${COLORS.bg}00 60%)` }} />
        <LightRays frame={frame} intensity={enter} />
        <Particles count={110} color={COLORS.neon} seed="s5p" drift={-0.35} opacity={enter} maxSize={6} />

        {/* Escudo central */}
        <div style={{ position: "absolute", left: 960 - 95, top: 160, transform: `scale(${shieldScale})`, opacity: enter }}>
          <Shield3D size={190} draw={draw} fill={fill} rotateY={shieldRotY} rotateX={6} sweep={sweep > 0 && sweep < 1 ? sweep : sweep2} emblem="lock" emblemProgress={emblem} depth={14} idSuffix="s5" />
        </div>

        {/* Título */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {t1 >= 0 && <TitleLine text={TEXTS.titleLine1} t={t1} size={118} weight={900} spacingFrom={70} spacingTo={14} sweepT={titleSweep} />}
          <div style={{ height: 30 }} />
          {t2 >= 0 && (
            <div style={{ opacity: tween(t2, [0, 14], [0, 1]), transform: `translateY(${(1 - tween(t2, [0, 18], [0, 1])) * 20}px)` }}>
              <TitleLine text={TEXTS.titleLine2} t={t2} size={46} weight={700} spacingFrom={30} spacingTo={9} sweepT={titleSweep} />
            </div>
          )}
          {/* Línea divisoria */}
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 300 * line, height: 2, background: `linear-gradient(90deg, transparent, ${COLORS.neon})` }} />
            <div style={{ width: 10, height: 10, transform: "rotate(45deg)", background: COLORS.neon, boxShadow: `0 0 14px ${COLORS.neon}`, opacity: line }} />
            <div style={{ width: 300 * line, height: 2, background: `linear-gradient(270deg, transparent, ${COLORS.neon})` }} />
          </div>
          <div
            style={{
              marginTop: 26,
              fontFamily: FONTS.body,
              fontWeight: 500,
              fontSize: 44,
              letterSpacing: 4 + (1 - sub) * 10,
              color: COLORS.neonSoft,
              opacity: sub,
              filter: `blur(${(1 - sub) * 6}px)`,
            }}
          >
            {TEXTS.subtitle}
          </div>
        </div>

        {/* Créditos: instituto, integrantes, docente */}
        <div
          style={{
            position: "absolute",
            left: 130,
            right: 130,
            bottom: 92,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            opacity: credits,
            transform: `translateY(${(1 - credits) * 16}px)`,
            borderTop: `1px solid ${COLORS.blue}55`,
            paddingTop: 26,
          }}
        >
          {TEXTS.credits.map((c, i) => (
            <div key={c.label} style={{ flex: i === 1 ? 2 : 1, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 15, letterSpacing: 4, color: COLORS.neon, marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: 27, color: COLORS.white, letterSpacing: 1, whiteSpace: "nowrap" }}>{c.value}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <AnamorphicFlare x={960} y={268} intensity={flare} color={COLORS.neon} width={1700} />
      <AbsoluteFill style={{ background: COLORS.neonSoft, opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

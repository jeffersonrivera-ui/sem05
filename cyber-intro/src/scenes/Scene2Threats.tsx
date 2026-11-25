import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CodeRain } from "../components/CodeRain";
import { GlitchText } from "../components/GlitchText";
import { BugIcon, HookIcon, LockIcon } from "../components/Icons";
import { Particles } from "../components/Particles";
import { BEATS, COLORS, FONTS, TEXTS } from "../config";
import { clamp, ease, easeIn, noise1D, sceneFade, shake, tween } from "../lib/anim";

const ICONS = { bug: BugIcon, lock: LockIcon, hook: HookIcon };

/** Red de nodos que se va infectando: pulsos rojos viajan por las conexiones. */
const ThreatNetwork: React.FC<{ frame: number }> = ({ frame }) => {
  const { nodes, edges } = useMemo(() => {
    const n = new Array(34).fill(0).map((_, i) => ({
      x: 80 + random(`n-x-${i}`) * 1760,
      y: 80 + random(`n-y-${i}`) * 920,
      infectAt: 10 + random(`n-i-${i}`) * 130,
    }));
    const e: [number, number][] = [];
    n.forEach((a, i) => {
      const d = n
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2);
      d.forEach((o) => {
        if (!e.some(([p, q]) => (p === o.j && q === i) || (p === i && q === o.j))) e.push([i, o.j]);
      });
    });
    return { nodes: n, edges: e };
  }, []);

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {edges.map(([a, b], k) => {
        const A = nodes[a];
        const B = nodes[b];
        const p = ((frame * 0.025 + random(`e-${k}`)) % 1 + 1) % 1;
        const live = frame > Math.min(A.infectAt, B.infectAt);
        return (
          <g key={k}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={live ? COLORS.red : "#3a4a66"} strokeOpacity={live ? 0.45 : 0.25} strokeWidth={1.2} />
            {live && <circle cx={A.x + (B.x - A.x) * p} cy={A.y + (B.y - A.y) * p} r={3} fill={COLORS.redHot} style={{ filter: `drop-shadow(0 0 6px ${COLORS.red})` }} />}
          </g>
        );
      })}
      {nodes.map((n, i) => {
        const inf = interpolate(frame, [n.infectAt, n.infectAt + 8], [0, 1], clamp);
        const ring = ((frame - n.infectAt) % 40) / 40;
        return (
          <g key={i}>
            {inf > 0 && <circle cx={n.x} cy={n.y} r={6 + ring * 26} fill="none" stroke={COLORS.red} strokeOpacity={(1 - ring) * 0.6 * inf} />}
            <circle cx={n.x} cy={n.y} r={4 + inf * 2} fill={inf > 0.5 ? COLORS.red : "#4f6a92"} />
          </g>
        );
      })}
    </svg>
  );
};

/** Una palabra de amenaza que irrumpe con glitch, se sostiene y sale. */
const ThreatWord: React.FC<{ index: number; localStart: number; localEnd: number; frame: number; last: boolean }> = ({
  index,
  localStart,
  localEnd,
  frame,
  last,
}) => {
  const t = frame - localStart;
  if (t < 0 || frame > localEnd) return null;
  const item = TEXTS.threats[index];
  const Icon = ICONS[item.icon];
  const appear = tween(t, [0, 10], [0, 1], ease);
  const exit = last ? 1 : tween(frame, [localEnd - 7, localEnd], [1, 0], easeIn);
  const glitchIn = interpolate(t, [0, 12], [1, 0.08], clamp);
  const glitchOut = last ? 0 : interpolate(frame, [localEnd - 8, localEnd], [0, 1], clamp);
  const idle = 0.06 + (noise1D(frame * 0.4, index) > 0.75 ? 0.4 : 0);
  const intensity = Math.max(glitchIn, glitchOut, idle);
  const scale = interpolate(t, [0, 10, 60], [1.35, 1.0, 0.96], { ...clamp, easing: ease });
  const iconDraw = tween(t, [2, 28], [0, 1]);
  const captionIn = tween(t, [8, 20], [0, 1]);
  const typed = Math.floor(interpolate(t, [8, 26], [0, item.caption.length], clamp));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: appear * exit }}>
      {/* Ícono gigante de fondo */}
      <div style={{ position: "absolute", opacity: 0.22, transform: `scale(${1 + t * 0.003})` }}>
        <Icon size={620} color={COLORS.red} strokeWidth={2} progress={iconDraw} />
      </div>
      <div style={{ transform: `scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ fontFamily: FONTS.mono, color: COLORS.redHot, fontSize: 20, letterSpacing: 8, opacity: captionIn }}>
          {`AMENAZA 0${index + 1} / 03`}
        </div>
        <GlitchText
          text={item.word}
          intensity={intensity}
          seed={`w${index}`}
          style={{
            fontFamily: FONTS.display,
            fontWeight: 900,
            fontSize: item.word.length > 8 ? 168 : 196,
            letterSpacing: 10,
            lineHeight: 1,
            textShadow: `0 0 30px ${COLORS.red}, 0 0 80px ${COLORS.red}88`,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 38,
            letterSpacing: 6,
            color: COLORS.white,
            opacity: captionIn,
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: COLORS.red }}>[ </span>
          {item.caption.slice(0, typed)}
          <span style={{ color: COLORS.red }}> ]</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Barras de interferencia digital horizontales */
const Interference: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => {
  const step = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {new Array(7).fill(0).map((_, i) => {
        if (random(`if-${i}-${step}`) > amount) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: random(`it-${i}-${step}`) * 1080,
              height: 1 + random(`ih-${i}-${step}`) * 12,
              background: i % 2 ? `linear-gradient(90deg, transparent, ${COLORS.red}66, transparent)` : "linear-gradient(90deg, transparent, rgba(120,220,255,0.22), transparent)",
              transform: `translateX(${(random(`ix-${i}-${step}`) - 0.5) * 200}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** ESCENA 2 — LAS AMENAZAS (5–10 s) */
export const Scene2Threats: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const abs = frame + from;
  const fade = sceneFade(frame, duration, 10, 3);
  const starts = BEATS.threatWords.map((b) => b - from);

  // Cámara: deriva tipo "handheld" + sacudidas en cada palabra
  const s = starts.reduce(
    (acc, st, i) => {
      const k = shake(frame, st, 14, 10, i + 3);
      return { x: acc.x + k.x, y: acc.y + k.y, r: acc.r + k.r };
    },
    { x: 0, y: 0, r: 0 },
  );
  const driftX = noise1D(frame * 0.02, 9) * 14;
  const driftY = noise1D(frame * 0.02, 19) * 10;
  const zoom = interpolate(frame, [0, duration], [1.06, 1.0], clamp);

  const wordFlash = starts.reduce((m, st) => Math.max(m, interpolate(frame, [st - 1, st, st + 6], [0, 0.3, 0], clamp)), 0);
  const nearWord = starts.some((st) => frame >= st - 2 && frame < st + 12);
  const interference = nearWord ? 0.7 : 0.08 + (abs < BEATS.toRed + 10 ? 0.6 : 0);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `translate(${driftX + s.x}px, ${driftY + s.y}px) rotate(${s.r}deg) scale(${zoom})` }}>
        <CodeRain color={COLORS.red} headColor="#FFD6D8" fontSize={18} columns={60} seed="s2rain" speed={1.6} opacity={0.22} blur={1.2} />
        <AbsoluteFill style={{ opacity: 0.75 }}>
          <ThreatNetwork frame={frame} />
        </AbsoluteFill>
        <Particles count={70} color={COLORS.red} seed="s2p" drift={-1.4} opacity={0.8} />
        {starts.map((st, i) => (
          <ThreatWord
            key={i}
            index={i}
            frame={frame}
            localStart={st}
            localEnd={i < starts.length - 1 ? starts[i + 1] - 1 : duration}
            last={i === starts.length - 1}
          />
        ))}
      </AbsoluteFill>
      <Interference frame={frame} amount={interference} />
      <AbsoluteFill style={{ background: COLORS.red, opacity: wordFlash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

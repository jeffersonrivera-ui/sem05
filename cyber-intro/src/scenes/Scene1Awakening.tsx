import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeRain } from "../components/CodeRain";
import { Monitor } from "../components/Monitor";
import { Particles } from "../components/Particles";
import { COLORS, FONTS } from "../config";
import { clamp, easeInOut, sceneFade, tween } from "../lib/anim";

const SCREEN_LINES = [
  "> iniciando sistema seguro...",
  "> cargando perfil: usuario_personal",
  "> /fotos  /documentos  /banca_en_linea",
  "> sincronizando datos personales",
  "> [████████████████████] 100%",
  "> conexión establecida",
];

/** Texto que se escribe en la pantalla del monitor (sincronizado con el SFX de teclado). */
const TypedScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const start = 46;
  const cps = 2.8; // caracteres por frame
  let budget = Math.max(0, (frame - start) * cps);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  let cursorPlaced = false;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "34px 40px",
        fontFamily: FONTS.mono,
        fontSize: 21,
        lineHeight: 1.65,
        color: COLORS.neonSoft,
        textShadow: `0 0 8px ${COLORS.neon}`,
      }}
    >
      <div style={{ color: COLORS.muted, fontSize: 15, letterSpacing: 3, marginBottom: 14 }}>TERMINAL · PC-PERSONAL</div>
      {SCREEN_LINES.map((line, i) => {
        const shown = Math.min(line.length, Math.floor(budget));
        budget -= line.length + 6; // pequeña pausa entre líneas
        if (shown <= 0 && cursorPlaced) return null;
        const isLast = !cursorPlaced && (shown < line.length || i === SCREEN_LINES.length - 1);
        if (isLast) cursorPlaced = true;
        return (
          <div key={i} style={{ whiteSpace: "pre", color: i === 4 ? COLORS.neon : undefined }}>
            {line.slice(0, Math.max(0, shown))}
            {isLast && <span style={{ opacity: cursorOn ? 1 : 0, color: COLORS.white }}>▌</span>}
          </div>
        );
      })}
    </div>
  );
};

/** ESCENA 1 — EL DESPERTAR DIGITAL (0–5 s) */
export const Scene1Awakening: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const fade = sceneFade(frame, duration, 1, 18);

  // Cámara: zoom cinematográfico lento + leve paneo
  const zoom = interpolate(frame, [0, duration], [1.0, 1.16], { ...clamp, easing: easeInOut });
  const camY = interpolate(frame, [0, duration], [20, -10], clamp);
  const camR = interpolate(frame, [0, duration], [-0.6, 0.3], clamp);

  // Aparición de la computadora desde la oscuridad
  const monitorIn = tween(frame, [18, 80], [0, 1], easeInOut);
  const power = tween(frame, [40, 70], [0.15, 1]);
  const flicker = frame > 40 && frame < 56 && frame % 4 < 2 ? 0.55 : 1;
  const rainIn = tween(frame, [0, 60], [0, 1], easeInOut);
  const beam = tween(frame, [30, 110], [0, 1], easeInOut);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${zoom}) rotate(${camR}deg)` }}>
        {/* Lluvia de código: capa lejana desenfocada + capa cercana */}
        <AbsoluteFill
          style={{
            WebkitMaskImage: "radial-gradient(ellipse 38% 45% at 50% 46%, transparent 30%, black 85%)",
            maskImage: "radial-gradient(ellipse 38% 45% at 50% 46%, transparent 30%, black 85%)",
          }}
        >
          <CodeRain color={COLORS.blue} fontSize={15} columns={70} seed="s1far" speed={0.7} opacity={0.42 * rainIn} blur={1.6} />
          <CodeRain color={COLORS.neon} fontSize={24} columns={34} seed="s1near" speed={1.1} opacity={0.5 * rainIn} />
        </AbsoluteFill>

        {/* Haz de luz volumétrica desde arriba */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -200,
            width: 1100,
            height: 1100,
            marginLeft: -550,
            background: `conic-gradient(from 180deg at 50% 0%, transparent 160deg, ${COLORS.neon}22 172deg, ${COLORS.neon}33 180deg, ${COLORS.neon}22 188deg, transparent 200deg)`,
            opacity: beam * 0.9,
            filter: "blur(18px)",
          }}
        />

        {/* Computadora */}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              opacity: monitorIn,
              transform: `translateY(${(1 - monitorIn) * 40 + 30}px) scale(${0.94 + monitorIn * 0.06})`,
              filter: `brightness(${0.4 + 0.6 * monitorIn})`,
            }}
          >
            <Monitor width={780} glow={COLORS.neon} glowIntensity={power * flicker}>
              <div style={{ opacity: power * flicker }}>
                <TypedScreen frame={frame} />
              </div>
            </Monitor>
          </div>
        </AbsoluteFill>

        <Particles count={90} color={COLORS.neon} seed="s1p" drift={-0.5} opacity={rainIn} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS, NARRATION } from "../config";
import { clamp, ease, threatLevel, accent } from "../lib/anim";

/** Subtítulos cinematográficos de la narración, con revelado palabra por palabra. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const line = NARRATION.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const local = frame - line.from;
  const len = line.to - line.from;
  const words = line.text.split(" ");
  const revealFrames = Math.min(len * 0.55, 70);
  const out = interpolate(frame, [line.to - 10, line.to], [1, 0], clamp);
  const barColor = accent(threatLevel(frame));

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 72, pointerEvents: "none" }}>
      <div
        style={{
          opacity: out,
          maxWidth: 1300,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize: 42,
          lineHeight: 1.25,
          letterSpacing: 0.5,
          color: COLORS.white,
          textShadow: "0 2px 18px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,1)",
          position: "relative",
          padding: "10px 28px",
          isolation: "isolate",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -6,
            width: interpolate(local, [0, 18], [0, 120], { ...clamp, easing: ease }),
            height: 2,
            transform: "translateX(-50%)",
            background: barColor,
            boxShadow: `0 0 12px ${barColor}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-30px -120px",
            background: "radial-gradient(ellipse at center, rgba(3,6,13,0.72) 0%, rgba(3,6,13,0.45) 45%, transparent 72%)",
            zIndex: -1,
          }}
        />
        {words.map((w, i) => {
          const start = (i / words.length) * revealFrames;
          const o = interpolate(local, [start, start + 8], [0, 1], clamp);
          const y = interpolate(local, [start, start + 10], [10, 0], { ...clamp, easing: ease });
          return (
            <span key={i} style={{ display: "inline-block", opacity: o, transform: `translateY(${y}px)`, filter: `blur(${(1 - o) * 4}px)`, marginRight: 11 }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

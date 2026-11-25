import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../config";

const GLYPHS = "01ABCDEF0123456789<>/{}[]#$%&*=+;:アイウエオカキクケコ";

type Props = {
  color: string;
  headColor?: string;
  fontSize?: number;
  columns?: number;
  seed?: string;
  speed?: number;
  opacity?: number;
  blur?: number;
};

/** Lluvia de código digital (columnas de caracteres con cabeza brillante). */
export const CodeRain: React.FC<Props> = ({
  color,
  headColor = "#E8F7FF",
  fontSize = 20,
  columns = 48,
  seed = "rain",
  speed = 1,
  opacity = 1,
  blur = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rows = Math.ceil(height / (fontSize * 1.15)) + 2;

  const cols = useMemo(
    () =>
      new Array(columns).fill(0).map((_, c) => ({
        x: (c + 0.5) * (width / columns) + (random(`${seed}-jx-${c}`) - 0.5) * 12,
        speed: (0.25 + random(`${seed}-sp-${c}`) * 0.55) * speed,
        offset: random(`${seed}-of-${c}`) * rows * 2,
        len: 8 + Math.floor(random(`${seed}-ln-${c}`) * 18),
        dim: 0.35 + random(`${seed}-dm-${c}`) * 0.65,
      })),
    [columns, width, rows, seed, speed],
  );

  return (
    <AbsoluteFill style={{ opacity, filter: blur ? `blur(${blur}px)` : undefined, overflow: "hidden" }}>
      {cols.map((col, c) => {
        const head = ((frame * col.speed + col.offset) % (rows + col.len)) - 1;
        const chars: React.ReactNode[] = [];
        for (let r = 0; r < rows; r++) {
          const d = head - r;
          if (d < 0 || d > col.len) continue;
          const swap = Math.floor(frame / 4 + random(`${seed}-sw-${c}-${r}`) * 10);
          const g = GLYPHS[Math.floor(random(`${seed}-g-${c}-${r}-${swap}`) * GLYPHS.length)];
          const isHead = d < 1;
          chars.push(
            <span
              key={r}
              style={{
                position: "absolute",
                top: r * fontSize * 1.15,
                left: 0,
                color: isHead ? headColor : color,
                opacity: isHead ? 1 : (1 - d / col.len) * col.dim,
                textShadow: isHead ? `0 0 12px ${color}, 0 0 4px ${headColor}` : `0 0 8px ${color}`,
              }}
            >
              {g}
            </span>,
          );
        }
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: col.x,
              top: 0,
              fontFamily: FONTS.mono,
              fontSize,
              lineHeight: 1,
            }}
          >
            {chars}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

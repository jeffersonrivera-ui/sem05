import React from "react";

type IconProps = { size: number; color: string; strokeWidth?: number; progress?: number };

const dash = (progress = 1, len = 600) => ({
  strokeDasharray: len,
  strokeDashoffset: len * (1 - progress),
});

export const BugIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 3, progress = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <g style={dash(progress)}>
      <ellipse cx="50" cy="58" rx="20" ry="26" />
      <path d="M38 36 Q50 22 62 36" />
      <path d="M50 34 V84" />
      <path d="M30 50 H14 M30 64 H12 M32 76 L18 88 M70 50 H86 M70 64 H88 M68 76 L82 88 M40 28 L32 14 M60 28 L68 14" />
    </g>
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 3, progress = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <g style={dash(progress)}>
      <rect x="22" y="44" width="56" height="42" rx="6" />
      <path d="M34 44 V32 a16 16 0 0 1 32 0 V44" />
      <circle cx="50" cy="62" r="5" />
      <path d="M50 67 V76" />
    </g>
  </svg>
);

export const HookIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 3, progress = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <g style={dash(progress)}>
      <path d="M58 10 V62 a16 16 0 0 1 -32 0 V52" />
      <path d="M26 52 L18 60 M26 52 L34 60" />
      <rect x="44" y="70" width="40" height="24" rx="3" />
      <path d="M44 72 L64 86 L84 72" />
    </g>
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 4 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 8 L94 88 H6 Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={`${color}22`} />
    <path d="M50 36 V62" stroke={color} strokeWidth={strokeWidth * 1.6} strokeLinecap="round" />
    <circle cx="50" cy="74" r={strokeWidth * 1.1} fill={color} />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size, color, strokeWidth = 6, progress = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 52 L42 72 L80 30" style={dash(progress, 100)} />
  </svg>
);

type FileKind = "doc" | "img" | "folder" | "pdf" | "key";

/** Ícono de archivo digital (documento, imagen, carpeta, pdf, credenciales). */
export const FileIcon: React.FC<{ kind: FileKind; size: number; color: string }> = ({ kind, size, color }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none">
    {kind === "folder" ? (
      <path d="M6 28 H40 L48 38 H94 V104 H6 Z" stroke={color} strokeWidth="4" fill={`${color}26`} strokeLinejoin="round" />
    ) : (
      <>
        <path d="M14 6 H66 L88 28 V114 H14 Z" stroke={color} strokeWidth="4" fill={`${color}22`} strokeLinejoin="round" />
        <path d="M66 6 V28 H88" stroke={color} strokeWidth="4" strokeLinejoin="round" />
      </>
    )}
    {kind === "doc" && <path d="M28 50 H74 M28 64 H74 M28 78 H62 M28 92 H70" stroke={color} strokeWidth="4" strokeLinecap="round" />}
    {kind === "img" && (
      <>
        <circle cx="38" cy="54" r="8" stroke={color} strokeWidth="4" />
        <path d="M24 98 L46 72 L58 86 L66 78 L80 98 Z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
      </>
    )}
    {kind === "pdf" && (
      <text x="51" y="84" textAnchor="middle" fill={color} fontFamily="Orbitron" fontWeight="700" fontSize="24">
        PDF
      </text>
    )}
    {kind === "key" && (
      <>
        <circle cx="38" cy="70" r="12" stroke={color} strokeWidth="4" />
        <path d="M50 70 H78 M70 70 V82 M62 70 V78" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </>
    )}
    {kind === "folder" && <path d="M22 60 H78 M22 76 H64" stroke={color} strokeWidth="4" strokeLinecap="round" />}
  </svg>
);

export const FILE_KINDS: FileKind[] = ["doc", "img", "folder", "pdf", "key"];

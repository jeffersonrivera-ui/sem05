/**
 * ===================================================================
 *  CONFIGURACIÓN CENTRAL DE LA INTRO
 *  Edita este archivo para cambiar textos, colores, tiempos y audio.
 *  (Todos los tiempos están en FRAMES: 30 frames = 1 segundo)
 * ===================================================================
 */

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 750, // 25 s exactos
};

/** Paleta de colores */
export const COLORS = {
  bg: "#080E1A", // negro profundo
  bgDeep: "#03060D",
  blue: "#147DCE", // azul eléctrico
  neon: "#3FC8FF", // azul neón
  neonSoft: "#8FE3FF",
  red: "#E23A43", // rojo de alerta
  redDeep: "#7A0E16",
  redHot: "#FF5A62",
  white: "#F4F8FF",
  muted: "#8BA3C7",
};

/** Tipografías (archivos locales en public/fonts) */
export const FONTS = {
  display: "Orbitron", // títulos tecnológicos
  body: "Rajdhani", // subtítulos y narración
  mono: "JetBrains Mono", // código y HUD
};

/**
 * Línea de tiempo de escenas.
 * `from` = frame de inicio, `duration` = duración en frames.
 * Las escenas se solapan unos frames para lograr transiciones suaves.
 */
export const TIMELINE = {
  scene1: { from: 0, duration: 165 }, //  0 – 5 s  El despertar digital
  scene2: { from: 145, duration: 157 }, //  5 – 10 s Las amenazas
  scene3: { from: 295, duration: 162 }, // 10 – 15 s El impacto
  scene4: { from: 440, duration: 175 }, // 15 – 20 s La protección
  scene5: { from: 590, duration: 160 }, // 20 – 25 s Revelación del título
};

/** Momentos clave globales (frames absolutos) */
export const BEATS = {
  toRed: 150, // la luz cambia de azul a rojo
  toBlue: 450, // la luz cambia de rojo a azul
  threatWords: [168, 208, 248], // MALWARE, RANSOMWARE, PHISHING
  impact: 300, // golpe del ataque
  shieldForm: 482, // el escudo se completa
  titleHit: 630, // impacto sonoro del título
};

/** Narración (se muestra como subtítulos y sirve de guion para la voz en off) */
export const NARRATION: { from: number; to: number; text: string }[] = [
  {
    from: 18,
    to: 142,
    text: "En la era digital, nuestra información se ha convertido en uno de nuestros recursos más valiosos.",
  },
  {
    from: 160,
    to: 294,
    text: "Pero existen amenazas invisibles capaces de robar, bloquear y comprometer nuestros datos.",
  },
  {
    from: 308,
    to: 442,
    text: "Los ciberataques pueden afectar nuestra privacidad, nuestros archivos y la seguridad de nuestros equipos.",
  },
  {
    from: 458,
    to: 592,
    text: "Conocer los riesgos y aplicar medidas de protección es fundamental para mantenernos seguros.",
  },
];

/** Textos en pantalla */
export const TEXTS = {
  hudTag: "SEGURIDAD INFORMÁTICA · INFORME 2026",
  threats: [
    { word: "MALWARE", caption: "Software malicioso", icon: "bug" as const },
    { word: "RANSOMWARE", caption: "Secuestro y cifrado de datos", icon: "lock" as const },
    { word: "PHISHING", caption: "Engaño y suplantación de identidad", icon: "hook" as const },
  ],
  impactTags: ["PRIVACIDAD COMPROMETIDA", "ARCHIVOS CIFRADOS", "EQUIPO VULNERABLE"],
  impactScreen: "ACCESO NO AUTORIZADO",
  encrypting: "CIFRANDO ARCHIVOS",
  protectionChips: ["ANTIVIRUS", "FIREWALL", "ACTUALIZACIONES", "CONTRASEÑAS SEGURAS", "COPIAS DE SEGURIDAD"],
  protectedLabel: "SISTEMA PROTEGIDO",
  titleLine1: "CIBERATAQUES",
  titleLine2: "A COMPUTADORAS PERSONALES",
  subtitle: "Cómo ocurren y cómo protegerse",
  credits: [
    { label: "INSTITUTO", value: "[Nombre del instituto]" },
    { label: "INTEGRANTES", value: "[Integrante 1] · [Integrante 2] · [Integrante 3]" },
    { label: "DOCENTE", value: "[Nombre del docente]" },
  ],
};

/** Mostrar la narración como subtítulos en pantalla */
export const SHOW_SUBTITLES = true;

/**
 * AUDIO
 * - Todos los archivos viven en public/audio/.
 * - Los SFX y la música incluidos son ORIGINALES (sintetizados con
 *   scripts/generate_audio.py) y libres de derechos.
 * - Para añadir voz en off: coloca public/audio/voice/narracion.mp3 (25 s,
 *   o 4 clips) y pon `voiceOver.enabled = true`.
 * - Para cambiar la música: reemplaza el archivo o cambia `src`.
 */
export const AUDIO = {
  music: { src: "audio/music/music_bed.wav", volume: 0.55, enabled: true },
  /** Volumen de la música mientras habla el narrador (ducking) */
  musicDuckedVolume: 0.3,
  voiceOver: {
    enabled: false,
    // Opción A: una sola pista de 25 s
    src: "audio/voice/narracion.mp3",
    volume: 1,
    // Opción B: un clip por escena (deja `src` vacío y llena `clips`)
    clips: [] as { src: string; from: number }[],
  },
  sfxMaster: 0.9,
  sfx: [
    // Escena 1
    { src: "audio/sfx/sub_drone.wav", from: 0, volume: 0.9 },
    { src: "audio/sfx/keyboard_typing.wav", from: 50, volume: 0.35 },
    { src: "audio/sfx/whoosh_1.wav", from: 118, volume: 0.6 },
    // Escena 2
    { src: "audio/sfx/bass_hit.wav", from: 150, volume: 0.8 },
    { src: "audio/sfx/glitch_1.wav", from: 148, volume: 0.6 },
    { src: "audio/sfx/glitch_2.wav", from: 167, volume: 0.65 },
    { src: "audio/sfx/bass_hit.wav", from: 168, volume: 0.45 },
    { src: "audio/sfx/glitch_3.wav", from: 207, volume: 0.65 },
    { src: "audio/sfx/bass_hit.wav", from: 208, volume: 0.45 },
    { src: "audio/sfx/glitch_1.wav", from: 247, volume: 0.65 },
    { src: "audio/sfx/bass_hit.wav", from: 248, volume: 0.45 },
    { src: "audio/sfx/electronic_alert.wav", from: 270, volume: 0.35 },
    // Escena 3
    { src: "audio/sfx/cinematic_boom.wav", from: 300, volume: 0.85 },
    { src: "audio/sfx/glitch_2.wav", from: 300, volume: 0.5 },
    { src: "audio/sfx/warning_beep.wav", from: 330, volume: 0.45 },
    { src: "audio/sfx/warning_beep.wav", from: 368, volume: 0.45 },
    { src: "audio/sfx/warning_beep.wav", from: 406, volume: 0.45 },
    { src: "audio/sfx/glitch_3.wav", from: 384, volume: 0.4 },
    { src: "audio/sfx/whoosh_2.wav", from: 428, volume: 0.7 },
    // Escena 4
    { src: "audio/sfx/bass_hit.wav", from: 450, volume: 0.6 },
    { src: "audio/sfx/digital_energy.wav", from: 455, volume: 0.6 },
    { src: "audio/sfx/bass_hit.wav", from: 482, volume: 0.5 },
    // Escena 5
    { src: "audio/sfx/whoosh_3.wav", from: 578, volume: 0.6 },
    { src: "audio/sfx/riser.wav", from: 570, volume: 0.45 },
    { src: "audio/sfx/cinematic_boom.wav", from: 630, volume: 0.9 },
    { src: "audio/sfx/title_shimmer.wav", from: 632, volume: 0.55 },
  ],
};

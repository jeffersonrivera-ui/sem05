# Ciberataques a computadoras personales: intro cinematográfica

Intro audiovisual de **25 s** (750 frames · 30 fps · 1920×1080 · MP4 H.264), hecha con **Remotion + React + TypeScript**.

**Video final:** [`out/cyber-intro.mp4`](out/cyber-intro.mp4)

---

## 1. Requisitos e instalación

- Node.js 18 o superior
- (Opcional) Python 3 + numpy, solo si quieres volver a generar el audio

```bash
cd cyber-intro
npm install
```

## 2. Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Abre **Remotion Studio**, la vista previa interactiva con línea de tiempo, en http://localhost:3000 |
| `npm run render` | Exporta `out/cyber-intro.mp4` (H.264, CRF 16, AAC 320 kbps) |
| `npm run still` | Exporta un fotograma suelto (`out/frame.png`) |
| `npm run audio` | Vuelve a sintetizar la música y los efectos originales |
| `npm run typecheck` | Revisa los tipos de TypeScript |

## 3. Estructura

```
cyber-intro/
├── public/
│   ├── audio/
│   │   ├── music/music_bed.wav     ← cama musical original (25 s)
│   │   ├── sfx/*.wav               ← efectos originales
│   │   └── voice/                  ← aquí va tu voz en off
│   └── fonts/                      ← Orbitron, Rajdhani, JetBrains Mono (SIL OFL)
├── scripts/
│   ├── generate_audio.py           ← sintetizador del diseño sonoro
│   └── stills.mjs                  ← exporta fotogramas para revisión
├── src/
│   ├── config.ts                   ← ★ TEXTOS, COLORES, TIEMPOS Y AUDIO
│   ├── CyberIntro.tsx              ← composición principal + pista de audio
│   ├── Root.tsx / index.ts         ← registro de la composición
│   ├── scenes/
│   │   ├── Scene1Awakening.tsx     ← 0–5 s   El despertar digital
│   │   ├── Scene2Threats.tsx       ← 5–10 s  Las amenazas
│   │   ├── Scene3Impact.tsx        ← 10–15 s El impacto
│   │   ├── Scene4Protection.tsx    ← 15–20 s La protección
│   │   └── Scene5Title.tsx         ← 20–25 s Revelación del título
│   ├── components/                 ← piezas reutilizables
│   │   ├── Backdrop.tsx            ← fondo global, resplandor y cuadrícula (azul ↔ rojo)
│   │   ├── CodeRain.tsx            ← lluvia de código
│   │   ├── Particles.tsx           ← partículas / bokeh con profundidad
│   │   ├── Monitor.tsx             ← computadora iluminada + reflejo
│   │   ├── Shield3D.tsx            ← escudo digital 3D (extrusión CSS 3D + SVG)
│   │   ├── GlitchText.tsx          ← texto con glitch RGB
│   │   ├── Icons.tsx               ← íconos SVG (bug, candado, anzuelo, archivos…)
│   │   ├── HUD.tsx                 ← esquinas, estado y código de tiempo
│   │   ├── Subtitles.tsx           ← narración como subtítulos
│   │   └── Overlays.tsx            ← viñeta, grano, scanlines, flashes, lens flare
│   └── lib/
│       ├── anim.ts                 ← easing, temblor de cámara, estado de amenaza
│       └── fonts.ts                ← carga de tipografías locales
└── remotion.config.ts              ← calidad de exportación
```

Todas las animaciones dependen solo de `useCurrentFrame()`, sin temporizadores ni CSS animations, así que el render es determinista y cada frame sale idéntico.

## 4. Cómo modificar

Casi todo se cambia en **`src/config.ts`**.

### Textos
- **Título, subtítulo y créditos:** `TEXTS.titleLine1`, `TEXTS.titleLine2`, `TEXTS.subtitle`, `TEXTS.credits`.
  Reemplaza `[Nombre del instituto]`, `[Integrante 1]`… y `[Nombre del docente]`.
- **Palabras de amenaza:** `TEXTS.threats` (palabra, descripción e ícono: `bug` | `lock` | `hook`).
- **Etiquetas del ataque y de protección:** `TEXTS.impactTags` y `TEXTS.protectionChips`.
- **Narración / subtítulos:** `NARRATION` (texto y frames de inicio y fin). Para ocultar los subtítulos usa `SHOW_SUBTITLES = false`.

### Colores
`COLORS`: `bg` (#080E1A), `blue` (#147DCE), `neon`, `red` (#E23A43), `white`… Todo el proyecto usa estos valores.

### Tiempos
- 30 frames = 1 segundo. La duración total se fija en `VIDEO.durationInFrames` (750).
- `TIMELINE`: inicio y duración de cada escena. Se solapan unos frames para que las transiciones sean suaves.
- `BEATS`: momentos clave (cambio a rojo, palabras, impacto, escudo, golpe del título).
  Si mueves un beat, mueve también el efecto de sonido correspondiente en `AUDIO.sfx`.

### Audio
- **Música:** reemplaza `public/audio/music/music_bed.wav` (mismo nombre) o cambia `AUDIO.music.src`. El volumen se ajusta en `AUDIO.music.volume`.
- **Voz en off:**
  1. Graba la narración (el guion está en `NARRATION`).
  2. Guárdala como `public/audio/voice/narracion.mp3` (25 s, alineada con los subtítulos).
     También puedes usar un clip por escena en `AUDIO.voiceOver.clips`, por ejemplo `[{ src: "audio/voice/escena1.mp3", from: 18 }, …]`.
  3. Pon `AUDIO.voiceOver.enabled = true`. La música baja sola a `musicDuckedVolume` mientras se narra.
- **Efectos:** `AUDIO.sfx` es la lista de `{ src, from, volume }`. Puedes añadir, mover o quitar entradas, o reemplazar los `.wav`.

| Efecto pedido | Archivo(s) | Dónde suena |
|---|---|---|
| Suspenso grave | `sub_drone.wav` | Escena 1 |
| Keyboard Typing | `keyboard_typing.wav` | Escena 1 (texto que se escribe en el monitor) |
| Whoosh Transitions | `whoosh_1/2/3.wav`, `riser.wav` | Transiciones 1→2, 3→4, 4→5 |
| Digital Glitch | `glitch_1/2/3.wav` | Cambio a rojo, cada palabra, impacto |
| Cinematic Bass Hit | `bass_hit.wav`, `cinematic_boom.wav` | Palabras, impacto, escudo, título |
| Electronic Alert | `electronic_alert.wav`, `warning_beep.wav` | Final de la escena 2, señales de la escena 3 |
| Digital Energy | `digital_energy.wav`, `title_shimmer.wav` | Escudo (escena 4) y título |

> **Licencia del audio:** toda la música y los efectos incluidos los genera `scripts/generate_audio.py` con osciladores, ruido y filtros. Son **originales, sin muestras de terceros y libres de derechos**. Si prefieres audio profesional, usa bibliotecas con licencia (Pixabay Audio, YouTube Audio Library, Freesound CC0, etc.) y reemplaza los archivos.

## 5. Exportación

```bash
npm run render
```
Salida: `out/cyber-intro.mp4` · H.264 High · yuv420p · 1920×1080 · 30 fps · 750 frames · audio AAC 48 kHz estéreo.

Tipografías: Orbitron, Rajdhani y JetBrains Mono, bajo licencia SIL Open Font License (incluidas localmente, no necesitan internet).

import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { HUD } from "./components/HUD";
import { FilmGrain, Flash, Scanlines, Vignette } from "./components/Overlays";
import { Subtitles } from "./components/Subtitles";
import { AUDIO, BEATS, COLORS, NARRATION, SHOW_SUBTITLES, TIMELINE } from "./config";
import { clamp } from "./lib/anim";
import { loadFonts } from "./lib/fonts";
import { Scene1Awakening } from "./scenes/Scene1Awakening";
import { Scene2Threats } from "./scenes/Scene2Threats";
import { Scene3Impact } from "./scenes/Scene3Impact";
import { Scene4Protection } from "./scenes/Scene4Protection";
import { Scene5Title } from "./scenes/Scene5Title";

loadFonts();

/** Pista de audio: música + voz en off + efectos sincronizados */
const Soundtrack: React.FC = () => {
  const vo = AUDIO.voiceOver;
  const speaking = (f: number) => NARRATION.some((n) => f >= n.from - 6 && f <= n.to + 6);
  return (
    <>
      {AUDIO.music.enabled && (
        <Audio
          src={staticFile(AUDIO.music.src)}
          volume={(f) => (vo.enabled && speaking(f) ? AUDIO.musicDuckedVolume : AUDIO.music.volume)}
        />
      )}
      {vo.enabled && vo.src && <Audio src={staticFile(vo.src)} volume={vo.volume} />}
      {vo.enabled &&
        vo.clips.map((c, i) => (
          <Sequence key={`vo${i}`} from={c.from} layout="none">
            <Audio src={staticFile(c.src)} volume={vo.volume} />
          </Sequence>
        ))}
      {AUDIO.sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={s.from} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume * AUDIO.sfxMaster} />
        </Sequence>
      ))}
    </>
  );
};

/** Composición principal: 750 frames (25 s) a 30 fps */
export const CyberIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { scene1, scene2, scene3, scene4, scene5 } = TIMELINE;

  const fromBlack = interpolate(frame, [0, 24], [1, 0], clamp);
  const blueFlash = interpolate(frame, [BEATS.toBlue - 2, BEATS.toBlue + 2, BEATS.toBlue + 16], [0, 0.28, 0], clamp);
  const titleFlash = interpolate(frame, [scene5.from + 2, scene5.from + 8, scene5.from + 22], [0, 0.22, 0], clamp);
  const redFlash = interpolate(frame, [BEATS.toRed - 2, BEATS.toRed + 1, BEATS.toRed + 12], [0, 0.55, 0], clamp);

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Backdrop />

      <Sequence from={scene1.from} durationInFrames={scene1.duration} name="1 · El despertar digital">
        <Scene1Awakening duration={scene1.duration} />
      </Sequence>
      <Sequence from={scene2.from} durationInFrames={scene2.duration} name="2 · Las amenazas">
        <Scene2Threats from={scene2.from} duration={scene2.duration} />
      </Sequence>
      <Sequence from={scene3.from} durationInFrames={scene3.duration} name="3 · El impacto">
        <Scene3Impact from={scene3.from} duration={scene3.duration} />
      </Sequence>
      <Sequence from={scene4.from} durationInFrames={scene4.duration} name="4 · La protección">
        <Scene4Protection from={scene4.from} duration={scene4.duration} />
      </Sequence>
      <Sequence from={scene5.from} durationInFrames={scene5.duration} name="5 · Revelación del título">
        <Scene5Title from={scene5.from} duration={scene5.duration} />
      </Sequence>

      {/* Capas globales de acabado cinematográfico */}
      <HUD visibleUntil={scene5.from + 8} />
      {SHOW_SUBTITLES && <Subtitles />}
      <Flash amount={redFlash} color={COLORS.red} />
      <Flash amount={blueFlash} color={COLORS.neon} />
      <Flash amount={titleFlash} color={COLORS.neon} />
      <Scanlines opacity={0.08} />
      <Vignette strength={0.85} />
      <FilmGrain opacity={0.06} />
      <AbsoluteFill style={{ background: "#000", opacity: fromBlack }} />

      <Soundtrack />
    </AbsoluteFill>
  );
};

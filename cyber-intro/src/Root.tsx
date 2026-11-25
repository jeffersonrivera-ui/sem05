import React from "react";
import { Composition } from "remotion";
import { CyberIntro } from "./CyberIntro";
import { VIDEO } from "./config";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CyberIntro"
    component={CyberIntro}
    durationInFrames={VIDEO.durationInFrames}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);

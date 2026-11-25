import { Config } from "@remotion/cli/config";
import fs from "node:fs";

// Calidad de exportación Full HD
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // usa los núcleos disponibles

// En el entorno de desarrollo en la nube se usa el Chromium preinstalado.
// En tu computadora Remotion descarga automáticamente su propio navegador.
const localShell = "/opt/pw-browsers/chromium_headless_shell";
if (fs.existsSync(localShell)) {
  Config.setBrowserExecutable(localShell);
}

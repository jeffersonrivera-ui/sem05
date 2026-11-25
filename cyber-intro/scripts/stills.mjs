// Renderiza fotogramas sueltos para revisión: node scripts/stills.mjs 30 120 200 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const frames = process.argv.slice(2).map(Number);
const outDir = path.resolve("out/frames");
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = fs.existsSync("/opt/pw-browsers/chromium_headless_shell") ? "/opt/pw-browsers/chromium_headless_shell" : null;
const composition = await selectComposition({ serveUrl, id: "CyberIntro", browserExecutable });
for (const f of frames) {
  const output = path.join(outDir, `f${String(f).padStart(3, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame: f, browserExecutable, scale: 0.5 });
  console.log("✓", output);
}

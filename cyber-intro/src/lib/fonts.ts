import { continueRender, delayRender, staticFile } from "remotion";

/** Carga las tipografías locales (licencia SIL OFL) antes de renderizar. */
const FACES: { family: string; file: string; weight: string }[] = [
  ...["400", "600", "700", "800", "900"].map((w) => ({ family: "Orbitron", file: `Orbitron-${w}.woff2`, weight: w })),
  ...["300", "400", "500", "600", "700"].map((w) => ({ family: "Rajdhani", file: `Rajdhani-${w}.woff2`, weight: w })),
  ...["400", "600"].map((w) => ({ family: "JetBrains Mono", file: `JetBrainsMono-${w}.woff2`, weight: w })),
];

let started = false;

export const loadFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Cargando tipografías");
  Promise.all(
    FACES.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format("woff2")`, {
        weight: f.weight,
        style: "normal",
      });
      return face.load().then((loaded) => {
        document.fonts.add(loaded);
      });
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};

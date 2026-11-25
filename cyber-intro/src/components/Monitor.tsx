import React from "react";

type Props = {
  width?: number;
  glow: string; // color de la luz emitida por la pantalla
  glowIntensity?: number; // 0–1
  children?: React.ReactNode; // contenido de la pantalla
  reflection?: boolean;
};

/**
 * Computadora estilizada (monitor de bisel fino + soporte) iluminada por su pantalla.
 * Incluye luz ambiental proyectada, borde de luz (rim light) y reflejo en el piso.
 */
export const Monitor: React.FC<Props> = ({ width = 820, glow, glowIntensity = 1, children, reflection = true }) => {
  const h = width * 0.6;
  const bezel = Math.max(10, width * 0.014);
  const body = (
    <div style={{ position: "relative", width, height: h + width * 0.2 }}>
      {/* Luz proyectada por la pantalla */}
      <div
        style={{
          position: "absolute",
          left: -width * 0.45,
          top: -h * 0.5,
          width: width * 1.9,
          height: h * 2,
          background: `radial-gradient(ellipse at center, ${glow}${hex(0.33 * glowIntensity)} 0%, ${glow}${hex(
            0.1 * glowIntensity,
          )} 35%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      {/* Carcasa del monitor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height: h,
          borderRadius: width * 0.018,
          background: "linear-gradient(160deg, #1a2333 0%, #0b111c 45%, #05080e 100%)",
          boxShadow: `0 0 0 1.5px ${glow}${hex(0.55 * glowIntensity)}, 0 0 ${60 * glowIntensity}px ${glow}${hex(
            0.35 * glowIntensity,
          )}, 0 40px 80px rgba(0,0,0,0.8)`,
          padding: bezel,
          boxSizing: "border-box",
        }}
      >
        {/* Pantalla */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: width * 0.008,
            overflow: "hidden",
            background: `radial-gradient(ellipse at 50% 40%, ${glow}${hex(0.22 * glowIntensity)} 0%, #050a14 70%)`,
          }}
        >
          {children}
          {/* Líneas de escaneo + reflejo de vidrio */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 2px, transparent 4px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 30%, transparent 31%)",
            }}
          />
        </div>
        {/* Luz de encendido */}
        <div
          style={{
            position: "absolute",
            bottom: bezel * 0.25,
            left: "50%",
            width: 6,
            height: 3,
            marginLeft: -3,
            borderRadius: 2,
            background: glow,
            boxShadow: `0 0 8px ${glow}`,
            opacity: glowIntensity,
          }}
        />
      </div>
      {/* Soporte */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - width * 0.035,
          top: h,
          width: width * 0.07,
          height: width * 0.13,
          background: "linear-gradient(90deg, #0a0f18, #1b2638 50%, #0a0f18)",
          clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width / 2 - width * 0.17,
          top: h + width * 0.125,
          width: width * 0.34,
          height: width * 0.022,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #1d2a3f, #070b12)",
          boxShadow: `0 -1px 0 ${glow}${hex(0.5 * glowIntensity)}, 0 10px 30px rgba(0,0,0,0.9)`,
        }}
      />
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {body}
      {reflection && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: h + width * 0.15,
            transform: "scaleY(-1)",
            transformOrigin: "top",
            opacity: 0.18,
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 35%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 35%)",
            filter: "blur(3px)",
            pointerEvents: "none",
          }}
        >
          {body}
        </div>
      )}
    </div>
  );
};

/** convierte opacidad 0–1 a sufijo hexadecimal de 2 dígitos */
export const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

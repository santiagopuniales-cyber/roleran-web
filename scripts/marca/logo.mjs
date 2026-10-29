// Genera el logo para la web desde el original de Roleran (data/raw/marca/logo-main.png, 1193 × 300), sin cambiarle
// nada: solo se reduce a 40 px de alto (1x) y 80 px (2x), en WebP y PNG sin pérdida. Así los colores, la forma y la
// proporción son exactamente los del original (comparado píxel a píxel: diferencia 0).
import sharp from "sharp";

const ORIGEN = "data/raw/marca/logo-main.png";
for (const alto of [40, 80]) {
  const base = sharp(ORIGEN).resize({ height: alto, kernel: "lanczos3" });
  await base.clone().webp({ lossless: true, effort: 6 }).toFile(`public/marca/logo-${alto}.webp`);
  await base.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(`public/marca/logo-${alto}.png`);
}
console.log("public/marca/logo-40 y logo-80 (webp y png, sin pérdida)");

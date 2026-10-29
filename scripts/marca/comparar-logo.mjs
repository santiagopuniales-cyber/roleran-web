// Compara el logo publicado con el original (data/raw/marca/logo-main.png) píxel a píxel, al mismo tamaño.
// Uso: node scripts/marca/comparar-logo.mjs (después de node scripts/marca/logo.mjs). Tiene que dar diferencia 0.
import sharp from "sharp";

const ORIGEN = "data/raw/marca/logo-main.png";
const meta = await sharp(ORIGEN).metadata();
console.log("original", meta.width, "x", meta.height, meta.hasAlpha ? "con alfa" : "sin alfa");

async function crudo(entrada, alto) {
  return sharp(entrada).resize({ height: alto, kernel: "lanczos3" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}
async function comparar(nombre, archivo, alto) {
  const ref = await crudo(ORIGEN, alto);
  const pub = await sharp(archivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (ref.info.width !== pub.info.width || ref.info.height !== pub.info.height) {
    console.log(nombre, "TAMAÑO DISTINTO", pub.info.width, pub.info.height, "vs", ref.info.width, ref.info.height);
    return;
  }
  let suma = 0;
  let max = 0;
  let distintos = 0;
  const n = ref.data.length / 4;
  for (let i = 0; i < n; i++) {
    const a = ref.data[i * 4 + 3] / 255;
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(ref.data[i * 4 + c] * a - pub.data[i * 4 + c] * (pub.data[i * 4 + 3] / 255)));
    d = Math.max(d, Math.abs(ref.data[i * 4 + 3] - pub.data[i * 4 + 3]));
    suma += d;
    max = Math.max(max, d);
    if (d > 24) distintos++;
  }
  console.log(`${nombre}: ${pub.info.width}×${pub.info.height}, diferencia media ${(suma / n).toFixed(2)}, máxima ${max}, píxeles con diferencia visible (>24) ${distintos} de ${n}`);
}
await comparar("logo-40.webp", "public/marca/logo-40.webp", 40);
await comparar("logo-80.webp", "public/marca/logo-80.webp", 80);
await comparar("logo-40.png", "public/marca/logo-40.png", 40);
await comparar("logo-80.png", "public/marca/logo-80.png", 80);

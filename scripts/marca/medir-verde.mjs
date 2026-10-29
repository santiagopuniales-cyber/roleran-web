// Mide los colores dominantes del logo (zona del texto "Roleran" y del círculo).
// Uso: node scripts/marca/medir-verde.mjs
import sharp from "sharp";

const archivo = "data/raw/marca/logo-main.png";
const { data, info } = await sharp(archivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

function histograma(x0, x1, y0, y1) {
  const cuenta = new Map();
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * info.width + x) * 4;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 250) continue;
      if (r > 235 && g > 235 && b > 235) continue; // fondo blanco
      const clave = `${r},${g},${b}`;
      cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
    }
  }
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

const hex = (rgb) =>
  "#" + rgb.split(",").map((n) => Number(n).toString(16).padStart(2, "0")).join("");

console.log(`Logo ${info.width}x${info.height}`);
console.log("Texto 'Roleran' (x 330-1193):");
for (const [c, n] of histograma(330, info.width, 0, info.height)) console.log(`  ${hex(c)}  rgb(${c})  ${n} px`);
console.log("Círculo (x 0-300):");
for (const [c, n] of histograma(0, 300, 0, info.height)) console.log(`  ${hex(c)}  rgb(${c})  ${n} px`);

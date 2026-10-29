// Arma hojas de contacto (grillas de 36 miniaturas con id, SKU y nombre de archivo) para revisar las imágenes.
// Uso: node scripts/imagenes/hojas-contacto.mjs [--recortes]
// Salida: tmp/hojas/hoja-XX.png (no se versiona)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = process.cwd();
const RECORTES = process.argv.includes("--recortes");
const dirImg = path.join(RAIZ, "data", "raw", "imagenes");
const manifiesto = JSON.parse(fs.readFileSync(path.join(dirImg, "manifiesto.json"), "utf8"));
const salida = path.join(RAIZ, "tmp", RECORTES ? "hojas-recortes" : "hojas");
fs.mkdirSync(salida, { recursive: true });

const COLS = 6;
const FILAS = 6;
const LADO = 200;
const ALTO_ETIQUETA = 36;
const GAP = 10;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let items = Object.values(manifiesto).sort((a, b) => a.id - b.id);
if (RECORTES) {
  const recortes = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "imagenes-recortes.json"), "utf8"));
  items = items.filter((i) => recortes[i.id]).map((i) => ({ ...i, recorte: recortes[i.id] }));
}

async function miniatura(item) {
  let img = sharp(path.join(dirImg, item.archivo), { animated: false }).flatten({ background: "#ffffff" });
  if (item.recorte) {
    const meta = await sharp(path.join(dirImg, item.archivo)).metadata();
    const [x, y, w, h] = item.recorte.caja; // proporciones 0..1
    img = img.extract({
      left: Math.round(x * meta.width),
      top: Math.round(y * meta.height),
      width: Math.round(w * meta.width),
      height: Math.round(h * meta.height),
    });
  }
  return img.resize(LADO, LADO, { fit: "contain", background: "#ffffff" }).png().toBuffer();
}

const porHoja = COLS * FILAS;
for (let h = 0; h * porHoja < items.length; h++) {
  const lote = items.slice(h * porHoja, (h + 1) * porHoja);
  const ancho = COLS * (LADO + GAP) + GAP;
  const alto = FILAS * (LADO + ALTO_ETIQUETA + GAP) + GAP;
  const capas = [];
  for (let i = 0; i < lote.length; i++) {
    const it = lote[i];
    const x = GAP + (i % COLS) * (LADO + GAP);
    const y = GAP + Math.floor(i / COLS) * (LADO + ALTO_ETIQUETA + GAP);
    try {
      capas.push({ input: await miniatura(it), left: x, top: y });
    } catch (e) {
      console.error("no se pudo leer", it.archivo, e.message);
    }
    const skus = [...new Set(it.usos.map((u) => u.sku || `wp${u.wpId}`))];
    const l1 = `#${it.id} ${skus.slice(0, 3).join(", ")}${skus.length > 3 ? ` +${skus.length - 3}` : ""}`;
    const l2 = `${it.ancho}×${it.alto} ${it.nombreArchivo}`.slice(0, 38);
    const svg = `<svg width="${LADO}" height="${ALTO_ETIQUETA}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f1f1f1"/><text x="3" y="14" font-family="Arial" font-size="12" font-weight="bold" fill="#111">${esc(l1.slice(0, 32))}</text><text x="3" y="30" font-family="Arial" font-size="10" fill="#444">${esc(l2)}</text></svg>`;
    capas.push({ input: Buffer.from(svg), left: x, top: y + LADO });
  }
  const archivo = path.join(salida, `hoja-${String(h + 1).padStart(2, "0")}.png`);
  await sharp({ create: { width: ancho, height: alto, channels: 3, background: "#d9d9d9" } })
    .composite(capas)
    .png()
    .toFile(archivo);
  console.log(archivo, lote.length);
}

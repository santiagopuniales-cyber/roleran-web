// Descarga única de las imágenes originales de la web vieja (solo lectura, 2 a la vez, con pausa).
// Uso: node scripts/imagenes/descargar.mjs
// Salida: data/raw/imagenes/<idImagen>.<ext> y data/raw/imagenes/manifiesto.json
// Si un archivo ya existe en disco, no se vuelve a pedir.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const RAIZ = process.cwd();
const base = path.join(RAIZ, "data", "raw");
const fecha = fs.readdirSync(base).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1);
const crudos = fs
  .readdirSync(path.join(base, fecha))
  .filter((f) => /^p\d+\.json$/.test(f))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(base, fecha, f), "utf8")));

const destino = path.join(base, "imagenes");
fs.mkdirSync(destino, { recursive: true });
const rutaManifiesto = path.join(destino, "manifiesto.json");
const manifiesto = fs.existsSync(rutaManifiesto) ? JSON.parse(fs.readFileSync(rutaManifiesto, "utf8")) : {};

const imagenes = new Map();
for (const p of crudos) {
  p.images.forEach((im, orden) => {
    if (!imagenes.has(im.id)) imagenes.set(im.id, { id: im.id, src: im.src, nombre: im.name, usos: [] });
    imagenes.get(im.id).usos.push({ wpId: p.id, sku: p.sku || null, orden });
  });
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
async function bajar(im) {
  const ext = path.extname(new URL(im.src).pathname).toLowerCase() || ".jpg";
  const archivo = `${im.id}${ext}`;
  const ruta = path.join(destino, archivo);
  if (!fs.existsSync(ruta)) {
    const res = await fetch(im.src, { headers: { "User-Agent": "Roleran-web-migracion/1.0 (lectura)" } });
    if (!res.ok) throw new Error(`${res.status} ${im.src}`);
    fs.writeFileSync(ruta, Buffer.from(await res.arrayBuffer()));
  }
  const buf = fs.readFileSync(ruta);
  let meta = {};
  try {
    meta = await sharp(buf).metadata();
  } catch {
    meta = {};
  }
  manifiesto[im.id] = {
    id: im.id,
    archivo,
    src: im.src,
    nombreArchivo: decodeURIComponent(path.basename(new URL(im.src).pathname)),
    titulo: im.nombre,
    bytes: buf.length,
    ancho: meta.width ?? null,
    alto: meta.height ?? null,
    sha1: crypto.createHash("sha1").update(buf).digest("hex"),
    usos: im.usos,
  };
}

const lista = [...imagenes.values()];
let hechas = 0;
for (let i = 0; i < lista.length; i += 2) {
  const lote = lista.slice(i, i + 2);
  const pedidas = lote.filter((im) => !fs.existsSync(path.join(destino, `${im.id}${path.extname(new URL(im.src).pathname).toLowerCase()}`)));
  await Promise.all(lote.map((im) => bajar(im).catch((e) => console.error("FALLÓ", im.id, e.message))));
  hechas += lote.length;
  if (pedidas.length) await espera(400);
  if (hechas % 100 === 0) console.log(`${hechas}/${lista.length}`);
}
fs.writeFileSync(rutaManifiesto, JSON.stringify(manifiesto, null, 2) + "\n");
console.log(`Listo: ${Object.keys(manifiesto).length} imágenes en ${path.relative(RAIZ, destino)}`);

// Clasifica las imágenes descargadas y genera las versiones web.
// Uso: node scripts/imagenes/procesar.mjs [--forzar] [--solo-propias]
// --solo-propias: deja como están las imágenes de la web vieja (data/imagenes.json) y rehace solo las
// fotos propias (las del sistema). Es lo que corre al publicar.
// Entradas: data/raw/imagenes/manifiesto.json · data/imagenes-revision.json · data/imagenes-recortes.json
// Salidas:  data/imagenes.json (estado y origen de cada imagen) · public/img/p/<id>-<ancho>.(avif|webp)
// Proceso de cada imagen usable: recorte manual (si tiene) → recorte de bordes → lienzo cuadrado blanco
// con margen parejo → 320/640/960 px en AVIF y WebP. No agranda más de 1,35× el original.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = process.cwd();
const FORZAR = process.argv.includes("--forzar");
const SOLO_PROPIAS = process.argv.includes("--solo-propias");
const dirImg = path.join(RAIZ, "data", "raw", "imagenes");
const dirSalida = path.join(RAIZ, "public", "img", "p");
fs.mkdirSync(dirSalida, { recursive: true });

const manifiesto = JSON.parse(fs.readFileSync(path.join(dirImg, "manifiesto.json"), "utf8"));
const revision = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "imagenes-revision.json"), "utf8")).imagenes;
const recortes = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "imagenes-recortes.json"), "utf8"));

const TAMANOS = [320, 640, 960];
const MARGEN = 0.07; // 7 % por lado

const RE = {
  marketplace: /D_NQ_NP|MLU\d|MLA\d|mercado.?li|cuotas.?sin|parcelamento|magazine.?luiza|^sg-11134|temu|global.?sources/i,
  competidor: /todoplas|fibanel|full.?packing|garrido|delsur|liderplast/i,
  captura: /screenshot|captura-de-pantalla/i,
  google: /buscar-con-google/i,
  whatsapp: /-WA\d{4}/i,
  fabricante: /^(\d{6}[-_][vp]|105\d{3}_[vp]|106\d{3}|10\d{4}[A-Z]?_[vp]|M2971|2941-|4380-|110[A-Z]{2,3}|D2\d{5}|X106501|BYT158|1\d{2}(pp|p)?\.|1\d{2}PP|14[2-7]\.|10[2357](pp|p|r)?\.)/i,
};

function clasificar(it) {
  const n = it.nombreArchivo;
  let origen = "desconocido";
  if (RE.whatsapp.test(n)) origen = "whatsapp";
  else if (RE.marketplace.test(n)) origen = "marketplace";
  else if (RE.competidor.test(n)) origen = "competidor";
  else if (RE.captura.test(n)) origen = RE.google.test(n) ? "captura-google" : "captura";
  else if (RE.fabricante.test(n)) origen = "fabricante";

  const w = it.ancho ?? 0;
  const h = it.alto ?? 0;
  const baja = Math.max(w, h) < 300 || (Math.min(w, h) < 220 && Math.max(w, h) < 400);

  let estado = "usar";
  let motivo = null;
  if (origen === "marketplace") [estado, motivo] = ["descartar", "Imagen de un marketplace (MercadoLibre u otro)."];
  else if (origen === "competidor") [estado, motivo] = ["descartar", "Imagen tomada del sitio de un competidor."];
  else if (origen.startsWith("captura")) [estado, motivo] = ["descartar", "Captura de pantalla de otra web, con interfaz."];
  else if (baja) [estado, motivo] = ["descartar", "Resolución demasiado baja."];
  else if (!w || !h) [estado, motivo] = ["descartar", "Archivo ilegible."];

  const rev = revision[it.id];
  // La revisión manual no puede rehabilitar imágenes de marketplace o competidores.
  const bloqueada = origen === "marketplace" || origen === "competidor";
  if (rev?.estado && !bloqueada) {
    estado = rev.estado;
    motivo = rev.motivo ?? motivo;
  }
  if (estado === "usar" && !motivo && origen.startsWith("captura")) motivo = "Captura ya recortada al producto.";
  return { origen, estado, motivo, productos: rev?.productos ?? {} };
}

async function generar(it, recorte) {
  const archivo = path.join(dirImg, it.archivo);
  let img = sharp(archivo, { animated: false }).rotate().flatten({ background: "#ffffff" });
  if (recorte) {
    const [x, y, w, h] = recorte.caja;
    img = img.extract({
      left: Math.round(x * it.ancho),
      top: Math.round(y * it.alto),
      width: Math.min(it.ancho - Math.round(x * it.ancho), Math.round(w * it.ancho)),
      height: Math.min(it.alto - Math.round(y * it.alto), Math.round(h * it.alto)),
    });
  }
  let buf = await img.png().toBuffer();
  try {
    buf = await sharp(buf).trim({ background: "#ffffff", threshold: 18 }).png().toBuffer();
  } catch {
    // imagen sin bordes que recortar
  }
  const meta = await sharp(buf).metadata();
  const lado = Math.max(meta.width, meta.height) / (1 - 2 * MARGEN);
  const tamanos = TAMANOS.filter((t, i) => i === 0 || t <= lado * 1.35);
  for (const t of tamanos) {
    const interior = Math.round(t * (1 - 2 * MARGEN));
    const base = await sharp(buf)
      .resize(interior, interior, { fit: "contain", background: "#ffffff", withoutEnlargement: false })
      .extend({
        top: Math.floor((t - interior) / 2),
        bottom: Math.ceil((t - interior) / 2),
        left: Math.floor((t - interior) / 2),
        right: Math.ceil((t - interior) / 2),
        background: "#ffffff",
      })
      .flatten({ background: "#ffffff" })
      .toBuffer();
    const destino = path.join(dirSalida, `${it.id}-${t}`);
    if (FORZAR || !fs.existsSync(`${destino}.webp`)) await sharp(base).webp({ quality: 80 }).toFile(`${destino}.webp`);
    if (FORZAR || !fs.existsSync(`${destino}.avif`)) await sharp(base).avif({ quality: 55, effort: 4 }).toFile(`${destino}.avif`);
  }
  return tamanos;
}

const anterior = SOLO_PROPIAS ? JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "imagenes.json"), "utf8")) : null;
const salida = anterior ? anterior.imagenes : {};
const conteo = {};
let hechas = 0;
for (const it of SOLO_PROPIAS ? [] : Object.values(manifiesto).sort((a, b) => a.id - b.id)) {
  const c = clasificar(it);
  const recorte = c.estado === "recortar" ? recortes[it.id] : null;
  if (c.estado === "recortar" && !recorte) throw new Error(`Falta la caja de recorte de ${it.id}`);
  const estadoFinal = c.estado === "recortar" ? "usar" : c.estado;
  let tamanos = [];
  if (estadoFinal === "usar") tamanos = await generar(it, recorte);
  salida[it.id] = {
    id: it.id,
    archivoOriginal: it.nombreArchivo,
    origen: c.origen,
    estadoRevision: c.estado,
    estado: estadoFinal,
    motivo: c.motivo,
    base: estadoFinal === "usar" ? `/img/p/${it.id}` : null,
    tamanos,
    ancho: tamanos.at(-1) ?? null,
    alto: tamanos.at(-1) ?? null,
    productos: c.productos,
  };
  const k = `${c.origen}:${c.estado}`;
  conteo[k] = (conteo[k] ?? 0) + 1;
  if (++hechas % 100 === 0) console.log(`${hechas} procesadas`);
}

// ── Fotos propias: data/fotos-propias/<CÓDIGO>.jpg (o .png/.webp) ───────────
// Se procesan igual y pasan a ser la primera foto del producto con ese código.
const dirPropias = path.join(RAIZ, "data", "fotos-propias");
const propias = {};
if (fs.existsSync(dirPropias)) {
  const slug = (s) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\//g, "-").replace(/\+/g, "mas")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  for (const archivo of fs.readdirSync(dirPropias).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
    // <código>__<orden>[__<huella>]: la huella (fotos del sistema) cambia si se cambia la foto.
    const [codigo, orden = "1", huella] = path.basename(archivo, path.extname(archivo)).split("__");
    const productoId = slug(codigo);
    const meta = await sharp(path.join(dirPropias, archivo)).metadata();
    const id = `propia-${productoId}-${orden}${huella ? `-${huella}` : ""}`;
    const it = { id, archivo: path.join("..", "..", "fotos-propias", archivo), ancho: meta.width, alto: meta.height };
    const tamanos = await generar(it, null);
    (propias[productoId] ??= []).push({ id, base: `/img/p/${id}`, tamanos, ancho: tamanos.at(-1), alto: tamanos.at(-1), origen: "propia" });
  }
  console.log(`Fotos propias: ${Object.values(propias).flat().length}`);
}
// Las versiones de fotos propias que ya no están (se borraron o se cambiaron en el sistema), afuera.
const vigentes = new Set(Object.values(propias).flat().map((p) => p.id));
for (const archivo of fs.readdirSync(dirSalida)) {
  const m = archivo.match(/^(propia-.+)-\d+\.(webp|avif)$/);
  if (m && !vigentes.has(m[1])) fs.rmSync(path.join(dirSalida, archivo));
}

fs.writeFileSync(
  path.join(RAIZ, "data", "imagenes.json"),
  // Con --solo-propias y las mismas fotos, el archivo queda igual (sin cambiar la fecha en cada publicación).
  JSON.stringify({ generado: anterior && JSON.stringify(anterior.propias ?? {}) === JSON.stringify(propias) ? anterior.generado : new Date().toISOString().slice(0, 10), imagenes: salida, propias }, null, 1) + "\n",
);
console.log(conteo);

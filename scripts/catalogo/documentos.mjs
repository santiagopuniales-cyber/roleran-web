// Genera los documentos de trabajo de fotos a partir del catálogo y la clasificación de imágenes.
// Uso: node scripts/catalogo/documentos.mjs
// Salidas: docs/FOTOS-PENDIENTES.md · docs/IMAGENES-DESCARTADAS.md
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const { productos } = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "catalogo.json"), "utf8"));
const categorias = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "categorias.json"), "utf8"));
const { imagenes } = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "imagenes.json"), "utf8"));
const manifiesto = JSON.parse(fs.readFileSync(path.join(RAIZ, "data", "raw", "imagenes", "manifiesto.json"), "utf8"));
const porWp = new Map(productos.map((p) => [p.wpId, p]));
const nombreCat = (s) => categorias.find((c) => c.slug === s)?.nombre ?? s;
const raizDe = (s) => {
  let c = categorias.find((x) => x.slug === s);
  while (c?.padre) c = categorias.find((x) => x.slug === c.padre);
  return c;
};

// ── Fotos pendientes ─────────────────────────────────────────────────────────
const sinFoto = productos.filter((p) => p.visible && p.imagenes.length === 0);
const grupos = new Map();
for (const p of sinFoto) {
  const r = raizDe(p.categoria);
  const clave = `${String(r.orden).padStart(2, "0")}|${r.nombre}`;
  if (!grupos.has(clave)) grupos.set(clave, []);
  grupos.get(clave).push(p);
}
const lineas = [
  "# Fotos pendientes",
  "",
  `Lista para la sesión de fotos en el local. Son **${sinFoto.length} productos** publicados sin una foto usable (no tenían foto en la web vieja o la que tenían se descartó). Mientras tanto, la web muestra un dibujo por categoría.`,
  "",
  "**Cómo sacar las fotos** (para que queden parejas con el resto):",
  "",
  "- Fondo blanco liso (una cartulina blanca alcanza), luz de día o dos lámparas a los costados, sin flash directo.",
  "- El producto centrado, entero y sin cortar, de frente o en un leve ángulo de tres cuartos. Una sola unidad o un paquete cerrado.",
  "- Sin manos, sin texto agregado, sin marcas de agua.",
  "- Nombrar cada archivo con el **código** de la primera columna (por ejemplo `V550X1000.jpg`). Así se cargan solas al regenerar el catálogo.",
  "- Si un producto tiene variantes de medida que se ven iguales (por ejemplo, rodales de distintos diámetros), alcanza con una foto por línea: marcalo en la columna «Foto».",
  "",
  "Marcá con una cruz en la columna «Foto» a medida que avanzás.",
  "",
];
for (const clave of [...grupos.keys()].sort()) {
  const [, nombre] = clave.split("|");
  const lista = grupos.get(clave).sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre, "es"));
  lineas.push(`## ${nombre} (${lista.length})`, "", "| Código | Producto | Subcategoría | Foto |", "|---|---|---|:-:|");
  for (const p of lista) lineas.push(`| ${p.sku ?? `(sin código, id ${p.id})`} | ${p.nombre} | ${nombreCat(p.categoria)} | ☐ |`);
  lineas.push("");
}
fs.mkdirSync(path.join(RAIZ, "docs"), { recursive: true });
fs.writeFileSync(path.join(RAIZ, "docs", "FOTOS-PENDIENTES.md"), lineas.join("\n"));

// ── Imágenes descartadas ─────────────────────────────────────────────────────
const descartadas = Object.values(imagenes).filter((i) => i.estado === "descartar");
const motivos = new Map();
for (const i of descartadas) motivos.set(i.motivo, (motivos.get(i.motivo) ?? 0) + 1);
const parciales = Object.values(imagenes).filter((i) => i.estado === "usar" && Object.keys(i.productos ?? {}).length);
const total = Object.keys(imagenes).length;
const usadas = Object.values(imagenes).filter((i) => i.estado === "usar");
const recortadas = usadas.filter((i) => i.estadoRevision === "recortar");
const out = [
  "# Imágenes descartadas",
  "",
  `De las **${total} imágenes** de productos de la web vieja se usan **${usadas.length}** (${recortadas.length} de ellas recortadas para sacar interfaz o agregados) y se descartan **${descartadas.length}**. Todas se revisaron en hojas de contacto (\`scripts/imagenes/hojas-contacto.mjs\`).`,
  "",
  "Criterio: no se publican imágenes de MercadoLibre ni de otros marketplaces, ni de sitios de la competencia, ni capturas con interfaz o texto agregado que no se pueda limpiar, ni imágenes de muy baja resolución o que no corresponden al producto. Las capturas que ya estaban recortadas al producto, sin interfaz, se usan y quedan marcadas con origen «captura» en `data/imagenes.json`.",
  "",
  "## Resumen por motivo",
  "",
  "| Motivo | Cantidad |",
  "|---|--:|",
  ...[...motivos.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `| ${m} | ${n} |`),
  "",
  "## Detalle",
  "",
  "| Imagen | Archivo original | Productos | Motivo |",
  "|---|---|---|---|",
];
for (const i of descartadas.sort((a, b) => a.id - b.id)) {
  const prods = manifiesto[i.id].usos.map((u) => porWp.get(u.wpId)).map((p) => p.sku ?? p.id).join(", ");
  out.push(`| #${i.id} | ${i.archivoOriginal.replace(/\|/g, "/").slice(0, 70)} | ${prods} | ${i.motivo} |`);
}
if (parciales.length) {
  out.push("", "## Usadas solo en algunos productos", "", "Estas imágenes se usan, pero no en los productos indicados porque no les corresponden.", "", "| Imagen | Producto | Motivo |", "|---|---|---|");
  for (const i of parciales) for (const [pid, v] of Object.entries(i.productos)) out.push(`| #${i.id} | ${pid} | ${v.motivo} |`);
}
fs.writeFileSync(path.join(RAIZ, "docs", "IMAGENES-DESCARTADAS.md"), out.join("\n") + "\n");
console.log(`Fotos pendientes: ${sinFoto.length} · descartadas: ${descartadas.length} · usadas: ${usadas.length}`);

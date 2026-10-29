// Verifica que todos los enlaces internos (href y src) del sitio exportado apunten a archivos que existen.
// Uso: node scripts/qa/enlaces.mjs  (después de npm run build)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
if (!existsSync(OUT)) {
  console.error("No existe out/. Corré npm run build primero.");
  process.exit(1);
}

function* paginas(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (n.endsWith(".html")) yield p;
  }
}

const decodificar = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
const ids = new Map(); // archivo → Set de ids

function idsDe(archivo) {
  if (!ids.has(archivo)) {
    const html = readFileSync(archivo, "utf8");
    ids.set(archivo, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return ids.get(archivo);
}

function destino(ruta) {
  const limpia = decodeURIComponent(ruta.split(/[?#]/)[0]);
  if (limpia.endsWith("/")) return join(OUT, limpia, "index.html");
  const directo = join(OUT, limpia);
  if (existsSync(directo) && statSync(directo).isFile()) return directo;
  if (existsSync(join(OUT, limpia, "index.html"))) return join(OUT, limpia, "index.html");
  return null;
}

const rotos = [];
let revisados = 0;
const vistos = new Set();
let total = 0;

for (const archivo of paginas(OUT)) {
  total++;
  const html = readFileSync(archivo, "utf8");
  const pagina = "/" + relative(OUT, archivo).split(sep).join("/").replace(/index\.html$/, "");
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"|\ssrcSet="([^"]+)"|\ssrcset="([^"]+)"/g)) {
    const valores = m[1] ? [m[1]] : (m[2] ?? m[3]).split(",").map((x) => x.trim().split(/\s+/)[0]);
    for (const crudo of valores) {
      const v = decodificar(crudo);
      if (!v || /^(https?:|mailto:|tel:|data:|javascript:)/.test(v)) continue;
      if (v.startsWith("#")) {
        const id = v.slice(1);
        if (id && !idsDe(archivo).has(id)) rotos.push({ pagina, enlace: v, motivo: "ancla inexistente" });
        continue;
      }
      if (!v.startsWith("/")) {
        rotos.push({ pagina, enlace: v, motivo: "ruta relativa" });
        continue;
      }
      const clave = v;
      revisados++;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      const d = destino(v);
      if (!d) {
        rotos.push({ pagina, enlace: v, motivo: "no existe" });
        continue;
      }
      // Enlaces a páginas sin barra final generarían una redirección de más.
      if (d.endsWith("index.html") && !v.split(/[?#]/)[0].endsWith("/") && !/\.[a-z0-9]+$/i.test(v.split(/[?#]/)[0])) {
        rotos.push({ pagina, enlace: v, motivo: "falta la barra final" });
      }
      const ancla = v.split("#")[1];
      if (ancla && !idsDe(d).has(ancla)) rotos.push({ pagina, enlace: v, motivo: "ancla inexistente en destino" });
    }
  }
}

console.log(`${total} páginas, ${revisados} enlaces internos revisados (${vistos.size} distintos).`);
if (rotos.length) {
  console.log(`\n${rotos.length} problemas:`);
  for (const r of rotos.slice(0, 50)) console.log(`  ${r.pagina}  →  ${r.enlace}  (${r.motivo})`);
  process.exit(1);
}
console.log("Sin enlaces rotos.");

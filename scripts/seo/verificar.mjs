// Verificación de SEO técnico sobre el sitio exportado (out/). Uso: node scripts/seo/verificar.mjs (después de npm run build)
// 1. Redirecciones: el 100 % de las URLs de productos y categorías del sitemap viejo lleva a una página que existe.
// 2. Sitemap y robots: cada URL del sitemap nuevo existe.
// 3. Metadatos: título, descripción, canónica, imagen para compartir y un solo h1 por página; sin duplicados.
// 4. JSON-LD: válido y sin Product con precio.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
// Dirección con la que se hizo el build (www.roleran.com.uy o la de Vercel): la de la canónica de la portada,
// o NEXT_PUBLIC_SITIO_URL si se pasa. Todas las páginas, el sitemap y robots tienen que coincidir con ella.
const BASE = (
  process.env.NEXT_PUBLIC_SITIO_URL ||
  /<link rel="canonical" href="(https:\/\/[^/"]+)\/"/.exec(readFileSync(join("out", "index.html"), "utf8"))?.[1] ||
  "https://www.roleran.com.uy"
).replace(/\/+$/, "");
console.log(`Dirección del build: ${BASE}`);
const CRUDOS = "data/raw/2026-10-07";
const problemas = [];
const fallo = (texto) => problemas.push(texto);

const existe = (ruta) => {
  const limpia = ruta.split(/[?#]/)[0];
  if (limpia.endsWith("/")) return existsSync(join(OUT, limpia, "index.html"));
  // Sin barra final: Cloudflare Pages manda solo a la versión con barra si existe esa página.
  return (existsSync(join(OUT, limpia)) && statSync(join(OUT, limpia)).isFile()) || existsSync(join(OUT, limpia, "index.html"));
};

// ── 1. Redirecciones ─────────────────────────────────────────────────────────
const reglas = new Map();
for (const linea of readFileSync(join(OUT, "_redirects"), "utf8").split(/\r?\n/)) {
  const [desde, hacia, codigo] = linea.trim().split(/\s+/);
  if (!desde || desde.startsWith("#")) continue;
  if (reglas.has(desde)) fallo(`Regla duplicada: ${desde}`);
  reglas.set(desde, { hacia, codigo: Number(codigo) });
}
if (reglas.size > 2000) fallo(`_redirects tiene ${reglas.size} reglas (máximo de Cloudflare: 2000)`);

function resolver(ruta) {
  let actual = ruta;
  for (let saltos = 0; saltos < 3; saltos++) {
    if (existe(actual)) return { destino: actual, saltos };
    const r = reglas.get(actual);
    if (!r) return null;
    if (r.codigo !== 301) fallo(`${actual} redirige con ${r.codigo}, no 301`);
    actual = r.hacia;
  }
  return null;
}

const urls = (archivo) => [...readFileSync(join(CRUDOS, archivo), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const grupos = {
  productos: urls("sitemap-wp-sitemap-posts-product-1.xml"),
  categorias: urls("sitemap-wp-sitemap-taxonomies-product_cat-1.xml"),
  paginas: urls("sitemap-wp-sitemap-posts-page-1.xml"),
};
const resumen = {};
const sin404 = [];
for (const [grupo, lista] of Object.entries(grupos)) {
  let ok = 0;
  for (const ruta of new Set(lista)) {
    const conBarra = resolver(ruta);
    const sinBarra = ruta.endsWith("/") && ruta !== "/" ? resolver(ruta.slice(0, -1)) : conBarra;
    if (conBarra && sinBarra) {
      ok++;
      if (conBarra.saltos > 1) fallo(`${ruta} hace ${conBarra.saltos} redirecciones seguidas`);
    } else if (grupo === "paginas") sin404.push(ruta);
    else fallo(`Sin destino: ${ruta}`);
  }
  resumen[grupo] = `${ok}/${new Set(lista).size}`;
}

// ── 2. Sitemap y robots ──────────────────────────────────────────────────────
const sitemap = [...readFileSync(join(OUT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const u of sitemap) {
  if (!u.startsWith(BASE + "/")) fallo(`Sitemap con dominio raro: ${u}`);
  if (!existe(u.slice(BASE.length))) fallo(`Sitemap apunta a algo que no existe: ${u}`);
}
const robots = readFileSync(join(OUT, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${BASE}/sitemap.xml`)) fallo("robots.txt no declara el sitemap");

// ── 3 y 4. Metadatos y JSON-LD por página ────────────────────────────────────
function* paginas(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (n.endsWith(".html")) yield p;
  }
}
const atributo = (html, re) => re.exec(html)?.[1]?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const titulos = new Map();
const descripciones = new Map();
const tipos = {};
let indexables = 0;
for (const archivo of paginas(OUT)) {
  const ruta = "/" + relative(OUT, archivo).split(sep).join("/").replace(/index\.html$/, "");
  const html = readFileSync(archivo, "utf8");
  if (ruta.endsWith(".html")) continue; // 404.html y _not-found
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  const titulo = atributo(html, /<title>([^<]*)<\/title>/);
  const desc = atributo(html, /<meta name="description" content="([^"]*)"/);
  const canonica = atributo(html, /<link rel="canonical" href="([^"]*)"/);
  const og = atributo(html, /<meta property="og:image" content="([^"]*)"/);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (!titulo) fallo(`${ruta}: sin <title>`);
  if (h1 !== 1) fallo(`${ruta}: ${h1} h1`);
  if (!/<html lang="es-UY"/.test(html)) fallo(`${ruta}: sin lang="es-UY"`);
  if (!/http-equiv="Content-Security-Policy"/.test(html)) fallo(`${ruta}: sin CSP`);
  if (!noindex) {
    indexables++;
    if (!desc) fallo(`${ruta}: sin descripción`);
    else if (desc.length < 50 || desc.length > 170) fallo(`${ruta}: descripción de ${desc.length} caracteres`);
    if (canonica !== BASE + ruta) fallo(`${ruta}: canónica ${canonica}`);
    if (!og || !og.startsWith(BASE)) fallo(`${ruta}: sin imagen para compartir`);
    titulos.set(titulo, [...(titulos.get(titulo) ?? []), ruta]);
    descripciones.set(desc, [...(descripciones.get(desc) ?? []), ruta]);
    if (!sitemap.includes(BASE + ruta)) fallo(`${ruta}: indexable pero no está en el sitemap`);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let datos;
    try {
      datos = JSON.parse(m[1]);
    } catch {
      fallo(`${ruta}: JSON-LD inválido`);
      continue;
    }
    for (const d of [datos].flat()) {
      tipos[d["@type"]] = (tipos[d["@type"]] ?? 0) + 1;
      if (d["@context"] !== "https://schema.org") fallo(`${ruta}: JSON-LD sin @context`);
      if (d["@type"] === "Product" || /"price"/.test(m[1])) fallo(`${ruta}: JSON-LD con producto o precio`);
    }
  }
}
for (const [t, rutas] of titulos) if (rutas.length > 1) fallo(`Título repetido «${t}»: ${rutas.slice(0, 4).join(", ")}`);
for (const [d, rutas] of descripciones) if (rutas.length > 1) fallo(`Descripción repetida en ${rutas.length} páginas: ${rutas.slice(0, 3).join(", ")} («${d?.slice(0, 60)}…»)`);

console.log(`Redirecciones (${reglas.size} reglas): productos ${resumen.productos}, categorías ${resumen.categorias}, páginas ${resumen.paginas}.`);
console.log(`Páginas viejas de plantilla que quedan en 404 a propósito: ${sin404.join(", ") || "ninguna"}.`);
console.log(`Sitemap: ${sitemap.length} URLs. Páginas indexables revisadas: ${indexables}.`);
console.log(`JSON-LD: ${Object.entries(tipos).map(([t, n]) => `${t} ${n}`).join(", ")}.`);
if (problemas.length) {
  console.log(`\n${problemas.length} problemas:`);
  for (const p of problemas.slice(0, Number(process.env.MAX ?? 60))) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("Todo en orden.");

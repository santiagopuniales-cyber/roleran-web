// Descarga de solo lectura de la API pública de WooCommerce de la web actual.
// Uso: node scripts/catalogo/descargar.mjs [carpeta-destino]
// Reglas: como mucho 2 pedidos a la vez y una pausa corta entre lotes.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://www.roleran.com.uy";
const hoy = new Date().toISOString().slice(0, 10);
const destino = process.argv[2] ?? path.join("data", "raw", hoy);
const PAUSA_MS = 800;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function bajar(url, archivo) {
  const res = await fetch(url, { headers: { "User-Agent": "Roleran-web-migracion/1.0 (lectura)" } });
  if (!res.ok) throw new Error(`${res.status} en ${url}`);
  const texto = await res.text();
  await writeFile(path.join(destino, archivo), texto);
  return { total: res.headers.get("x-wp-total"), paginas: res.headers.get("x-wp-totalpages"), bytes: texto.length };
}

async function enLotes(tareas) {
  const resultados = [];
  for (let i = 0; i < tareas.length; i += 2) {
    resultados.push(...(await Promise.all(tareas.slice(i, i + 2).map((t) => t()))));
    await espera(PAUSA_MS);
  }
  return resultados;
}

await mkdir(destino, { recursive: true });

const primera = await bajar(`${BASE}/wp-json/wc/store/v1/products?per_page=100&page=1`, "p1.json");
const paginas = Number(primera.paginas ?? 8);
console.log(`Productos: ${primera.total} en ${paginas} páginas`);

const tareas = [];
for (let n = 2; n <= paginas; n++) {
  tareas.push(() => bajar(`${BASE}/wp-json/wc/store/v1/products?per_page=100&page=${n}`, `p${n}.json`));
}
tareas.push(() => bajar(`${BASE}/wp-json/wc/store/v1/products/categories?per_page=100`, "cats.json"));
for (let n = 1; n <= paginas; n++) {
  tareas.push(() =>
    bajar(`${BASE}/wp-json/wp/v2/product?per_page=100&page=${n}&_fields=id,slug,date,modified`, `fechas${n}.json`),
  );
}
tareas.push(() => bajar(`${BASE}/wp-sitemap.xml`, "wp-sitemap.xml"));
await enLotes(tareas);

// Sitemaps hijos
const { readFile } = await import("node:fs/promises");
const indice = await readFile(path.join(destino, "wp-sitemap.xml"), "utf8");
const hijos = [...indice.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
await enLotes(
  hijos.map((url) => () => bajar(url, "sitemap-" + url.split("/").pop().replace(/[^a-z0-9.-]/gi, "_"))),
);
console.log(`Sitemaps hijos: ${hijos.length}`);
console.log(`Listo en ${destino}`);

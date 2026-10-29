// Genera public/_redirects (Cloudflare Pages) a partir de data/redirecciones.json más las páginas de la web vieja.
// Cada regla va con y sin barra final, porque Cloudflare compara la ruta tal cual. Límite de Cloudflare: 2000 reglas estáticas.
import { readFileSync, writeFileSync } from "node:fs";

const LIMITE = 2000;
const catalogo = JSON.parse(readFileSync("data/redirecciones.json", "utf8"));

// Páginas de la web vieja (WordPress/WooCommerce) que tienen un equivalente en la nueva.
// /nosotros/ y /contacto/ existen con la misma ruta: no necesitan regla.
// Las páginas de plantilla (blog, entradas «lorem ipsum», autores, etiquetas) no se redirigen: dan 404.
const PAGINAS = [
  ["/tienda/", "/productos/"],
  ["/shop/", "/productos/"],
  ["/cart/", "/pedido/"],
  ["/cart-2/", "/pedido/"],
  ["/checkout/", "/pedido/"],
  ["/checkout-2/", "/pedido/"],
  ["/wishlist/", "/pedido/"],
  ["/my-account/", "/"],
  ["/yith-compare/", "/productos/"],
  ["/product/", "/productos/"],
  ["/product-category/", "/productos/"],
];

const reglas = [];
const vistas = new Set();
function agregar(desde, hacia) {
  for (const d of new Set([desde, desde.replace(/\/$/, "")])) {
    if (!d || d === hacia || vistas.has(d)) continue;
    vistas.add(d);
    reglas.push(`${d} ${hacia} 301`);
  }
}

for (const [d, h] of PAGINAS) agregar(d, h);
// Los productos ocultos (/productos/<slug>/) no van acá: scripts/build/ocultos.mjs les deja una página
// que redirige, para que ocultar productos no acerque _redirects al tope.
for (const r of catalogo) if (!r.desde.startsWith("/productos/")) agregar(r.desde, r.hacia);
reglas.push("/wp-sitemap.xml /sitemap.xml 301");

if (reglas.length > LIMITE) {
  console.error(`Son ${reglas.length} reglas: Cloudflare Pages acepta hasta ${LIMITE}.`);
  process.exit(1);
}

writeFileSync(
  "public/_redirects",
  `# Generado por scripts/seo/redirecciones.mjs — no editar a mano.\n# Rutas de la web vieja (WooCommerce) → web nueva. ${reglas.length} reglas (límite de Cloudflare Pages: ${LIMITE}).\n${reglas.join("\n")}\n`,
);
console.log(`public/_redirects: ${reglas.length} reglas.`);

// Después del build: cada producto oculto desde el sistema deja en /productos/<slug>/ una página mínima que
// lleva al momento a su categoría (meta refresh inmediato, que Google trata como redirección permanente).
// Así ocultar productos no gasta reglas de out/_redirects, que en Cloudflare tiene un tope de 2000.
// Las URLs viejas de WordPress siguen en _redirects (scripts/seo/redirecciones.mjs).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const escapar = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const ocultos = JSON.parse(readFileSync("data/redirecciones.json", "utf8")).filter((r) => r.desde.startsWith("/productos/"));
for (const { desde, hacia } of ocultos) {
  const destino = escapar(hacia);
  const html =
    `<!DOCTYPE html><html lang="es-UY"><head><meta charSet="utf-8"/>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
    `<title>Producto no disponible — Roleran</title><meta name="robots" content="noindex"/>` +
    `<meta http-equiv="refresh" content="0; url=${destino}"/></head>` +
    `<body><h1>Este producto ya no está disponible</h1><p><a href="${destino}">Ver productos parecidos</a></p></body></html>`;
  if (existsSync(join(OUT, desde, "index.html"))) throw new Error(`${desde} está oculto pero tiene página publicada`);
  mkdirSync(join(OUT, desde), { recursive: true });
  writeFileSync(join(OUT, desde, "index.html"), html);
}
console.log(`Productos ocultos con página de redirección: ${ocultos.length}.`);

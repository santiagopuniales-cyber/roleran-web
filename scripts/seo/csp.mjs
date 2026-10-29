// Después del build: agrega a cada página una Content-Security-Policy con el hash de cada script en línea.
// En una exportación estática no hay servidor que genere un nonce por pedido, así que se usan hashes (sha256).
// Lo que un <meta> no admite (frame-ancestors, etc.) va en public/_headers.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";

// Mismo orden de prioridad que Next para las variables de entorno del build.
for (const f of [".env.production.local", ".env.local", ".env.production", ".env"]) {
  if (existsSync(f)) process.loadEnvFile(f);
}
const GA = Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());

const GA_SCRIPT = ["https://www.googletagmanager.com"];
// Cloudflare Web Analytics (src/components/ContadorVisitas.tsx): el script y adónde manda las visitas.
const CONTADOR_SCRIPT = "https://static.cloudflareinsights.com";
const CONTADOR_CONEXION = "https://cloudflareinsights.com";
const GA_CONEXION = ["https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"];

function* paginas(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (n.endsWith(".html")) yield p;
  }
}

const esJs = (atributos) => {
  const tipo = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(atributos)?.[1]?.toLowerCase();
  return !tipo || tipo === "text/javascript" || tipo === "module" || tipo === "application/javascript";
};

let total = 0;
let maxHashes = 0;
for (const archivo of paginas(OUT)) {
  let html = readFileSync(archivo, "utf8");
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "");
  const hashes = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, atributos, contenido] = m;
    if (/\bsrc\s*=/.test(atributos) || !esJs(atributos) || !contenido) continue;
    hashes.add(`'sha256-${createHash("sha256").update(contenido, "utf8").digest("base64")}'`);
  }
  const ruta = "/" + relative(OUT, archivo).split(sep).join("/");
  const conMapa = ruta === "/index.html" || ruta.startsWith("/contacto/");
  const directivas = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(" ")} ${CONTADOR_SCRIPT}${GA ? ` ${GA_SCRIPT.join(" ")}` : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data:${GA ? ` ${GA_CONEXION.join(" ")}` : ""}`,
    "font-src 'self'",
    `connect-src 'self' ${CONTADOR_CONEXION}${GA ? ` ${GA_CONEXION.join(" ")}` : ""}`,
    `frame-src ${conMapa ? "https://www.google.com" : "'none'"}`,
    "manifest-src 'self'",
    "worker-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];
  const meta = `<meta http-equiv="Content-Security-Policy" content="${directivas.join("; ")}"/>`;
  // Va pegado al charset, antes de cualquier script.
  const ancla = /<meta charSet="utf-8"\/>/i;
  html = ancla.test(html) ? html.replace(ancla, (m) => m + meta) : html.replace(/<head>/i, `<head>${meta}`);
  writeFileSync(archivo, html);
  total++;
  maxHashes = Math.max(maxHashes, hashes.size);
}
console.log(`CSP agregada a ${total} páginas (hasta ${maxHashes} scripts en línea por página). Analytics: ${GA ? "prendido" : "apagado"}.`);

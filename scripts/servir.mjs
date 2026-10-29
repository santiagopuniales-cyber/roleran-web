// Servidor estático local que imita a Cloudflare Pages: barra final, 404.html, _headers y _redirects.
// Uso: node scripts/servir.mjs [puerto] [carpeta]   (por defecto 4173 y out/)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";

const PUERTO = Number(process.argv[2] ?? process.env.PUERTO ?? 4173);
const RAIZ = path.resolve(process.argv[3] ?? "out");

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};
const COMPRIMIBLE = /\.(html|js|css|json|txt|xml|svg|webmanifest)$/;

// _headers: bloques «ruta» + líneas «  Cabecera: valor». Soporta comodín * al final.
function leerHeaders() {
  const f = path.join(RAIZ, "_headers");
  if (!fs.existsSync(f)) return [];
  const reglas = [];
  let actual = null;
  for (const linea of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    if (!linea.trim() || linea.trim().startsWith("#")) continue;
    if (!/^\s/.test(linea)) {
      actual = { patron: linea.trim(), cabeceras: [] };
      reglas.push(actual);
    } else if (actual) {
      const i = linea.indexOf(":");
      actual.cabeceras.push([linea.slice(0, i).trim(), linea.slice(i + 1).trim()]);
    }
  }
  return reglas;
}
function leerRedirects() {
  const f = path.join(RAIZ, "_redirects");
  if (!fs.existsSync(f)) return new Map();
  const m = new Map();
  for (const linea of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const [desde, hacia, codigo] = linea.trim().split(/\s+/);
    if (desde && hacia && !desde.startsWith("#")) m.set(desde, { hacia, codigo: Number(codigo ?? 301) });
  }
  return m;
}
const coincide = (patron, ruta) => (patron.endsWith("*") ? ruta.startsWith(patron.slice(0, -1)) : patron === ruta);

const headers = leerHeaders();
const redirects = leerRedirects();

function enviar(req, res, archivo, estado = 200, ruta) {
  const ext = path.extname(archivo);
  const extra = headers.filter((r) => coincide(r.patron, ruta)).flatMap((r) => r.cabeceras);
  let cuerpo = fs.readFileSync(archivo);
  const cabeceras = { "Content-Type": TIPOS[ext] ?? "application/octet-stream" };
  for (const [k, v] of extra) cabeceras[k] = v;
  if (COMPRIMIBLE.test(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
    cuerpo = zlib.gzipSync(cuerpo);
    cabeceras["Content-Encoding"] = "gzip";
  }
  res.writeHead(estado, cabeceras);
  res.end(req.method === "HEAD" ? undefined : cuerpo);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://local");
    let ruta = decodeURIComponent(url.pathname);
    const r = redirects.get(ruta);
    if (r) {
      res.writeHead(r.codigo, { Location: r.hacia + url.search });
      return res.end();
    }
    let archivo = path.join(RAIZ, ruta);
    if (!archivo.startsWith(RAIZ)) {
      res.writeHead(403);
      return res.end();
    }
    if (fs.existsSync(archivo) && fs.statSync(archivo).isDirectory()) {
      if (!ruta.endsWith("/")) {
        res.writeHead(308, { Location: `${ruta}/${url.search}` });
        return res.end();
      }
      archivo = path.join(archivo, "index.html");
    }
    if (fs.existsSync(archivo) && fs.statSync(archivo).isFile()) return enviar(req, res, archivo, 200, ruta);
    if (fs.existsSync(`${archivo}.html`)) return enviar(req, res, `${archivo}.html`, 200, ruta);
    return enviar(req, res, path.join(RAIZ, "404.html"), 404, ruta);
  })
  .listen(PUERTO, () => console.log(`Sirviendo ${RAIZ} en http://localhost:${PUERTO}`));

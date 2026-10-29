// Genera public/og.png (1200 × 630), la imagen que aparece al compartir un enlace de la web.
// Usa la fuente y los colores del sitio, el logo real y fotos del catálogo. Requiere un build previo (toma la fuente de out/).
// Uso: node scripts/marca/og.mjs
import "../pw-entorno.mjs"; // primero: navegadores aislados (../.pw-browsers)
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const media = resolve("out/_next/static/media");
const fuente = readdirSync(media).find((f) => f.includes(".p.") && f.endsWith(".woff2"));
if (!fuente) throw new Error("No encontré la fuente en out/: corré npm run build primero.");
const url = (p) => pathToFileURL(resolve(p)).href;
const catalogo = JSON.parse(readFileSync("data/catalogo.json", "utf8")).productos;
const foto = (sku) => {
  const img = catalogo.find((p) => p.sku === sku)?.imagenes[0];
  return url(`public${img.base}-${img.tamanos.at(-1)}.webp`);
};
const FOTOS = ["BESP110EPX200", "V550X1000", "D7", "PIZMAR33"].map(foto);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; src: url(${url(`out/_next/static/media/${fuente}`)}) format("woff2"); font-weight: 100 900; font-stretch: 62% 125%; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; font-family: Archivo, sans-serif; background: #f5f5f0; color: #1a1f19; display: grid; grid-template-columns: 1fr 470px; overflow: hidden; }
.texto { padding: 64px 0 56px 72px; display: flex; flex-direction: column; }
.logo { height: 76px; width: auto; align-self: flex-start; }
h1 { margin-top: 56px; font-size: 92px; line-height: .92; font-stretch: 72%; font-weight: 800; letter-spacing: -.5px; }
h1 span { color: #0c6a08; }
p { margin-top: 26px; font-size: 30px; color: #545b51; line-height: 1.25; }
.pie { margin-top: auto; display: flex; gap: 14px; font-size: 24px; font-weight: 600; }
.chip { background: #0c6a08; color: #fff; padding: 10px 18px; border-radius: 8px; }
.chip.claro { background: #f3e9da; color: #6b4e2e; }
.fotos { background: #eaf4e7; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 40px 40px 40px 30px; align-content: center; }
.fotos div { background: #fff; border-radius: 14px; aspect-ratio: 1; display: grid; place-items: center; box-shadow: 0 1px 2px rgba(20,38,27,.08); }
.fotos img { width: 86%; height: 86%; object-fit: contain; }
</style></head><body>
<div class="texto">
  <img class="logo" src="${url("data/raw/marca/logo-main.png")}" alt="">
  <h1>Casi todo en <span>descartables</span></h1>
  <p>Envases para tu negocio y para tu casa,<br>en Montevideo.</p>
  <div class="pie"><span class="chip">Pedí por WhatsApp</span><span class="chip claro">Martín García 2287</span></div>
</div>
<div class="fotos">${FOTOS.map((f) => `<div><img src="${f}" alt=""></div>`).join("")}</div>
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
// Desde un archivo local (con setContent el navegador no deja leer imágenes file://).
mkdirSync("tmp", { recursive: true });
writeFileSync("tmp/og.html", html);
await pagina.goto(url("tmp/og.html"), { waitUntil: "load" });
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: "public/og.png", type: "png" });
await navegador.close();
console.log("public/og.png");

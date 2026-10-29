// Lighthouse en modo celular (emulación y red simulada por defecto de Lighthouse) sobre el sitio servido localmente.
// Uso: node scripts/qa/lighthouse.mjs [base]   (con node scripts/servir.mjs corriendo; base por defecto http://localhost:4173)
// Corre cada página 5 veces y se queda con la mediana de rendimiento (Lighthouse varía entre corridas; es lo que recomienda Google).
// Guarda el resumen en docs/qa/lighthouse.json y los informes completos en .lighthouse/ (ignorado por git).
import "../pw-entorno.mjs"; // primero: navegadores aislados (../.pw-browsers)
import { chromium } from "@playwright/test";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4173";
const PAGINAS = {
  inicio: "/",
  categoria: "/categorias/bandejas-de-espumaplast/",
  ficha: "/productos/estuche-de-espumaplast-110-ep/",
  pedido: "/pedido/",
  catalogo: "/productos/",
  busqueda: "/buscar/?q=vaso",
};
const CATEGORIAS = ["performance", "accessibility", "best-practices", "seo"];

mkdirSync(".lighthouse", { recursive: true });
mkdirSync("docs/qa", { recursive: true });
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new", "--no-sandbox"] });
const resumen = {};
try {
  for (const [nombre, ruta] of Object.entries(PAGINAS)) {
    const corridas = [];
    for (let i = 0; i < 5; i++) corridas.push(await lighthouse(BASE + ruta, { port: chrome.port, output: "html", logLevel: "error", onlyCategories: CATEGORIAS }));
    corridas.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score);
    const r = corridas[2];
    const lhr = r.lhr;
    writeFileSync(`.lighthouse/${nombre}.html`, r.report);
    const puntajes = Object.fromEntries(CATEGORIAS.map((c) => [c, Math.round(lhr.categories[c].score * 100)]));
    const a = lhr.audits;
    resumen[nombre] = {
      ruta,
      ...puntajes,
      lcp: a["largest-contentful-paint"].displayValue,
      cls: a["cumulative-layout-shift"].displayValue,
      tbt: a["total-blocking-time"].displayValue,
      peso: a["total-byte-weight"].displayValue,
      rendimientoEnLasCincoCorridas: corridas.map((c) => Math.round(c.lhr.categories.performance.score * 100)),
    };
    console.log(`${nombre.padEnd(10)} rend ${puntajes.performance} · acc ${puntajes.accessibility} · bp ${puntajes["best-practices"]} · seo ${puntajes.seo} · LCP ${resumen[nombre].lcp} · CLS ${resumen[nombre].cls} · TBT ${resumen[nombre].tbt} · ${resumen[nombre].peso}`);
    const bajos = Object.values(lhr.audits).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== "informative" && x.scoreDisplayMode !== "notApplicable" && x.scoreDisplayMode !== "manual");
    if (bajos.length) console.log(`           a mejorar: ${bajos.map((x) => x.id).join(", ")}`);
  }
} finally {
  await chrome.kill();
}
writeFileSync("docs/qa/lighthouse.json", JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), modo: "celular (emulación y red simulada por defecto de Lighthouse), servidor local, mediana de 5 corridas", resumen }, null, 2) + "\n");

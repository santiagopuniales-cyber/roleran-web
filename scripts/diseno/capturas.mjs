// Capturas de diseño con Playwright (el sitio tiene que estar servido: node scripts/servir.mjs).
// Uso: node scripts/diseno/capturas.mjs <carpeta-salida> [anchos separados por coma] [rutas separadas por coma]
import "../pw-entorno.mjs"; // primero: navegadores aislados (../.pw-browsers)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:4173";
const salida = process.argv[2] ?? "docs/diseno";
const anchos = (process.argv[3] ?? "390,1280").split(",").map(Number);
const rutas = (process.argv[4] ?? "/,/categorias/bandejas-de-espumaplast/,/productos/estuche-de-espumaplast-110-ep/,/pedido/").split(",");
fs.mkdirSync(salida, { recursive: true });

// Pedido de ejemplo para la vista «Mi pedido».
const PEDIDO = {
  codigo: "R-7K2F",
  renglones: [
    { producto: { id: "besp110epx200", slug: "estuche-de-espumaplast-110-ep", nombre: "Estuche de espumaplast 110 EP", sku: "BESP110EPX200", presentacion: "Funda × 200", imagen: "/img/p/4267-320", placeholder: "bandeja", paso: 1, minimo: 1 }, cantidad: 2, nota: "" },
    { producto: { id: "v550x1000", slug: "vaso-550-cc", nombre: "Vaso 550 cc", sku: "V550X1000", presentacion: "Paquete × 1.000", imagen: "/img/p/3345-320", placeholder: "vaso", paso: 1, minimo: 1 }, cantidad: 1, nota: "Si hay, transparentes" },
    { producto: { id: "sulf0-50", slug: "rollo-de-papel-sulfito-50-cm", nombre: "Rollo de papel sulfito 50 cm", sku: "SULF0,50", presentacion: "Por kg", imagen: "/img/p/3413-320", placeholder: "rollo", paso: 0.5, minimo: 0.5 }, cantidad: 2.5, nota: "" },
    { producto: { id: "pizmar33", slug: "caja-para-pizza-marron-33-x-33-cm", nombre: "Caja para pizza marrón 33 × 33 cm", sku: "PIZMAR33", presentacion: "Presentación a confirmar", imagen: "/img/p/3294-320", placeholder: "caja", paso: 1, minimo: 1 }, cantidad: 50, nota: "" },
  ],
  notaGeneral: "Paso a buscarlo el jueves de mañana.",
  cliente: { nombre: "", empresa: "", rut: "", entrega: "retiro", direccion: "" },
};

const navegador = await chromium.launch();
for (const ancho of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ancho < 600 ? 844 : 900 }, deviceScaleFactor: ancho < 600 ? 2 : 1 });
  await ctx.addInitScript((p) => {
    if (location.pathname.startsWith("/pedido") && !sessionStorage.getItem("vacio")) localStorage.setItem("roleran:pedido:v1", JSON.stringify(p));
  }, PEDIDO);
  const pagina = await ctx.newPage();
  for (const ruta of rutas) {
    await pagina.goto(BASE + ruta, { waitUntil: "networkidle" });
    // Recorre la página para que carguen las imágenes diferidas y vuelve arriba.
    await pagina.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await pagina.waitForLoadState("networkidle");
    await pagina.waitForTimeout(400);
    const nombre = (ruta === "/" ? "inicio" : ruta.replace(/[?=]/g, "-").split("/").filter(Boolean).slice(0, 2).join("-")).slice(0, 60);
    // En screenshots/ van en JPEG (las páginas largas en PNG pesan varios MB cada una).
    const ext = process.env.FORMATO ?? (path.basename(salida) === "screenshots" ? "jpg" : "png");
    const archivo = path.join(salida, `${nombre}-${ancho}.${ext}`);
    await pagina.screenshot({ path: archivo, fullPage: true, ...(ext === "jpg" ? { type: "jpeg", quality: 80 } : {}) });
    console.log(archivo);
  }
  await ctx.close();
}
await navegador.close();

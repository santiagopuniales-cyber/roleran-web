// Botones, avisos cortos y etiquetas de un renglón no se parten en dos («En tu / cotización»), en ningún
// ancho. Se mide con los rectángulos del texto: si las letras de un mismo control caen en dos alturas
// distintas, se partió.
import { expect, test } from "./base";

const PAGINAS = ["/", "/categorias/bandejas-de-espumaplast/", "/productos/estuche-de-espumaplast-110-ep/", "/productos/", "/rubros/rotiserias-y-delivery/", "/buscar/?q=bolsa", "/pedido/", "/contacto/"];
const ANCHOS = [320, 360, 390, 640, 768, 1024, 1280, 1440];

test.skip(({ browserName, viewport }) => browserName !== "chromium" || (viewport?.width ?? 0) < 1000, "Alcanza con un proyecto: el test cambia el ancho él mismo.");

/** Textos de un renglón que quedaron en dos o más (botones, avisos, chips). */
async function partidos(page: import("@playwright/test").Page): Promise<string[]> {
  return page.evaluate(() => {
    const SELECTOR = 'button, [role="button"], a[class*="inline-flex"], [class*="whitespace-nowrap"], [class*="rounded-full"]';
    const malos: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
      if (!el.offsetParent || el.closest(".sr-only, [aria-hidden='true']")) continue
      const texto = (el.innerText ?? "").trim();
      // Solo textos cortos: un párrafo largo dentro de un enlace puede ocupar varios renglones a propósito.
      if (!texto || texto.length > 40 || texto.includes("\n")) continue;
      const alturas = new Set<number>();
      const recorrer = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = recorrer.nextNode(); n; n = recorrer.nextNode()) {
        if (!n.textContent?.trim()) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const rect of r.getClientRects()) if (rect.width > 1) alturas.add(Math.round(rect.top / 4));
      }
      if (alturas.size > 1) malos.push(texto);
    }
    return [...new Set(malos)];
  });
}

for (const ancho of ANCHOS) {
  test(`nada de un renglón se parte a ${ancho} px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    const encontrados: string[] = [];
    for (const ruta of PAGINAS) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      // Con un producto agregado aparecen el selector de cantidad y el aviso «En tu cotización».
      const agregar = page.getByRole("button", { name: /Agregar/ }).first();
      if (await agregar.isVisible().catch(() => false)) await agregar.click();
      for (const t of await partidos(page)) encontrados.push(`${ruta}: ${t}`);
    }
    expect(encontrados, `a ${ancho} px`).toEqual([]);
  });
}

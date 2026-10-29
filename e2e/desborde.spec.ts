// Sin scroll horizontal en ningún ancho, de 320 a 1440 px (con los menús abiertos también).
import { expect, test } from "./base";

const PAGINAS = ["/", "/categorias/bandejas-de-espumaplast/", "/productos/estuche-de-espumaplast-110-ep/", "/pedido/", "/productos/", "/rubros/rotiserias-y-delivery/", "/contacto/", "/buscar/?q=bolsa"];
const ANCHOS = [320, 360, 768, 1024, 1440];

test.skip(({ browserName, viewport }) => browserName !== "chromium" || (viewport?.width ?? 0) < 1000, "Alcanza con un proyecto: el test cambia el ancho él mismo.");

for (const ancho of ANCHOS) {
  test(`sin desborde horizontal a ${ancho} px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    for (const ruta of PAGINAS) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      // Abre los menús desplegables visibles para medir también su ancho.
      for (const s of await page.locator("header summary:visible").all()) await s.click();
      const { scroll, ventana } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, ventana: window.innerWidth }));
      expect(scroll, `${ruta} a ${ancho} px`).toBeLessThanOrEqual(ventana);
    }
  });
}

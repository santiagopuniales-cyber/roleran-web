// axe-core (WCAG 2.0, 2.1 y 2.2 A y AA) sobre las páginas principales.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./base";

const PAGINAS = ["/", "/productos/", "/categorias/bandejas-de-espumaplast/", "/productos/estuche-de-espumaplast-110-ep/", "/pedido/", "/buscar/?q=vaso", "/rubros/heladerias/", "/contacto/", "/preguntas-frecuentes/", "/nosotros/"];

for (const ruta of PAGINAS) {
  test(`axe: ${ruta}`, async ({ page }) => {
    if (ruta === "/pedido/") {
      await page.addInitScript(() => {
        localStorage.setItem(
          "roleran:pedido:v1",
          JSON.stringify({
            codigo: "R-7K2F",
            renglones: [{ producto: { id: "v550x1000", slug: "vaso-550-cc", nombre: "Vaso 550 cc", sku: "V550X1000", presentacion: "Paquete × 1.000", imagen: "/img/p/3345-320", placeholder: "vaso", paso: 1, minimo: 1 }, cantidad: 2, nota: "" }],
            notaGeneral: "",
            cliente: { nombre: "", empresa: "", rut: "", entrega: "envio", direccion: "" },
          }),
        );
      });
    }
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    test.info().annotations.push({ type: "axe", description: `${r.violations.length} violaciones (${graves.length} graves)` });
  });
}

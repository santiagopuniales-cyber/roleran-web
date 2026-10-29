// Recorrido con teclado: saltar al contenido, foco visible, menú y pedido sin mouse.
import { expect, test } from "./base";

test.skip(({ isMobile }) => isMobile, "Teclado físico: solo en los proyectos de escritorio.");

test("saltar al contenido y foco visible", async ({ page, browserName }) => {
  // En Safari, Tab no pasa por los enlaces salvo que el usuario lo active (Opción+Tab): se prueba en Chromium.
  test.skip(browserName === "webkit", "Safari no enfoca enlaces con Tab por defecto.");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await expect(saltar).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
  // Cada elemento enfocado tiene un contorno visible.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const contorno = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return "sin foco";
      const s = getComputedStyle(el);
      if (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) return "ok";
      // Campos con el indicador en su contenedor (borde y halo con :focus-within).
      const p = el.parentElement ? getComputedStyle(el.parentElement) : null;
      return p && p.boxShadow !== "none" ? "ok" : `${el.tagName} sin contorno`;
    });
    expect(contorno).toBe("ok");
  }
});

test("menú de todas las categorías: se abre con Enter y se cierra con Escape", async ({ page }) => {
  await page.goto("/");
  const resumen = page.locator("header summary", { hasText: "Todas las categorías" });
  await resumen.focus();
  await page.keyboard.press("Enter");
  const enlace = page.locator("header details[open]").getByRole("link", { name: /Limpieza e higiene/ });
  await expect(enlace).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(enlace).toBeHidden();
  await expect(resumen).toBeFocused();
});

test("agregar a la cotización y cambiar la cantidad sin mouse", async ({ page }) => {
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Ya tenés 1 en tu cotización/)).toBeVisible();
  await page.goto("/pedido/");
  const cantidad = page.getByRole("textbox", { name: /Cantidad de Vaso 550 cc/ });
  await cantidad.focus();
  await page.keyboard.press("ArrowUp");
  await expect(cantidad).toHaveValue("2");
});

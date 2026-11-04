import { buscadorEncabezado, expect, test } from "./base";

test("resultados al instante y página de resultados", async ({ page, errores }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const campo = buscadorEncabezado(page);
  await campo.click();
  await campo.fill("vaso 550");
  const lista = page.getByRole("listbox");
  await expect(lista.getByRole("option").first()).toContainText("Vaso 550 cc", { timeout: 15000 });
  await campo.press("Enter");
  await expect(page).toHaveURL(/\/buscar\/\?q=vaso(%20|\+)550/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("vaso 550");
  await expect(page.locator("main").getByRole("link", { name: /Vaso 550 cc/ }).first()).toBeVisible();
  expect(errores).toEqual([]);
});

test("sinónimos y códigos", async ({ page }) => {
  await page.goto("/buscar/?q=telgopor");
  await expect(page.locator("main").getByRole("link", { name: /espumaplast/i }).first()).toBeVisible();
  await page.goto("/buscar/?q=PIZMAR33");
  await expect(page.locator("main ul.grid > li").first()).toContainText("Caja para pizza marrón 33 × 33 cm");
});

test("sin resultados: ofrece preguntar por WhatsApp", async ({ page }) => {
  await page.goto("/buscar/?q=qwxzy");
  await expect(page.getByRole("heading", { name: /No encontramos/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Preguntar por WhatsApp/ })).toHaveAttribute("href", /wa\.me\/59893626134\?text=/);
});

test("teclado: flechas y Enter abren el producto", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const campo = buscadorEncabezado(page);
  await campo.click();
  await campo.fill("pirotines");
  await expect(page.getByRole("option").first()).toBeVisible({ timeout: 15000 });
  await campo.press("ArrowDown");
  await expect(campo).toHaveAttribute("aria-activedescendant", /.+/);
  await campo.press("Enter");
  await expect(page).toHaveURL(/\/productos\//);
});

// Regresión 4/11: el navegador agrega su propia cruz a los campos de búsqueda y quedaban dos.
test("los buscadores tienen una sola cruz para borrar", async ({ page, errores }) => {
  for (const [ruta, campo] of [
    ["/", () => buscadorEncabezado(page)],
    ["/buscar/?q=vaso", () => page.locator("#consulta-pagina")],
  ] as const) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    await campo().click();
    await campo().fill("papelera");
    // El navegador no deja leer el estilo de su cruz: se comprueba que la regla que la oculta esté cargada.
    const oculta = await page.evaluate(() => {
      const reglas = (lista: CSSRuleList): CSSStyleRule[] =>
        [...lista].flatMap((r) => ("cssRules" in r && !(r instanceof CSSStyleRule) ? reglas((r as CSSGroupingRule).cssRules) : r instanceof CSSStyleRule ? [r] : []));
      return [...document.styleSheets].some((h) =>
        reglas(h.cssRules).some((r) => r.selectorText.includes("::-webkit-search-cancel-button") && /none/.test(r.style.cssText)),
      );
    });
    expect(oculta, `${ruta}: falta ocultar la cruz del navegador`).toBe(true);
    const propia = page.getByRole("button", { name: "Borrar búsqueda" }).locator("visible=true");
    await expect(propia, ruta).toHaveCount(1);
    await propia.click();
    await expect(campo()).toHaveValue("");
  }
  expect(errores).toEqual([]);
});

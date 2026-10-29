import { expect, test } from "./base";

test("cabeceras de seguridad y CSP en cada página", async ({ request }) => {
  for (const ruta of ["/", "/productos/vaso-550-cc/", "/pedido/", "/contacto/"]) {
    const r = await request.get(ruta);
    expect(r.status()).toBe(200);
    const h = r.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    const html = await r.text();
    expect(html).toMatch(/<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-/);
    expect(html).not.toContain("unsafe-eval");
  }
});

test("redirecciones de la web vieja (301)", async ({ request }) => {
  for (const [vieja, nueva] of [
    ["/product/vaso-550-cc-x1000/", "/productos/vaso-550-cc/"],
    ["/product-category/bandejas/bandejas-de-espuma/", "/categorias/bandejas-de-espumaplast/"],
    ["/tienda/", "/productos/"],
    ["/cart/", "/pedido/"],
  ]) {
    const r = await request.get(vieja, { maxRedirects: 0 });
    expect(r.status(), vieja).toBe(301);
    expect(new URL(r.headers()["location"], "http://x").pathname, vieja).toBe(nueva);
  }
});

test("navegar sin violar la CSP (buscador, catálogo y pedido)", async ({ page, errores }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("header").getByRole("combobox").first().fill("bandeja");
  await expect(page.getByRole("option").first()).toBeVisible({ timeout: 15000 });
  await page.goto("/productos/?categoria=bolsas");
  await expect(page.locator("main ul.grid > li").first()).toContainText(/Bolsa/i, { timeout: 15000 });
  await page.goto("/pedido/");
  expect(errores).toEqual([]);
});

test("el contador de visitas solo cuenta en www.roleran.com.uy (acá no carga) y la CSP lo permite", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.locator("script[data-cf-beacon]").count()).toBe(0);
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  expect(csp).toContain("https://static.cloudflareinsights.com");
  expect(csp).toContain("connect-src 'self' https://cloudflareinsights.com");
});

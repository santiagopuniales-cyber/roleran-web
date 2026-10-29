import { esMovil, expect, test } from "./base";

test("filtros del catálogo: quedan en la URL y se pueden limpiar", async ({ page, errores }) => {
  await page.goto("/productos/");
  await expect(page.locator("main ul.grid > li").first()).toBeVisible();
  if (esMovil(page)) await page.getByRole("button", { name: /Filtrar y ordenar/ }).click();
  await page.getByLabel("Categoría", { exact: true }).selectOption("vasos-termicos");
  await expect(page).toHaveURL(/categoria=vasos-termicos/);
  const tarjetas = page.locator("main ul.grid > li");
  await expect(tarjetas.first()).toContainText("Vaso térmico");
  const cantidad = await tarjetas.count();
  expect(cantidad).toBeGreaterThan(0);
  expect(cantidad).toBeLessThan(20);
  for (const t of await tarjetas.allTextContents()) expect(t).toMatch(/térmico/i);

  // Al recargar con la URL, el filtro sigue aplicado.
  await page.reload();
  await expect(tarjetas.first()).toContainText("Vaso térmico");
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page).toHaveURL(/\/productos\/$/);
  expect(errores).toEqual([]);
});

test("ver más productos", async ({ page }) => {
  await page.goto("/productos/");
  const tarjetas = page.locator("main ul.grid > li");
  await expect(tarjetas).toHaveCount(48);
  await page.getByRole("button", { name: /Ver más productos/ }).click();
  await expect(tarjetas).toHaveCount(96);
});

test("rubro: lista compacta con botón para agregar", async ({ page }) => {
  await page.goto("/rubros/heladerias/");
  await page.getByRole("button", { name: /^Agregar/ }).first().click();
  await expect(page.getByRole("link", { name: /Cotización 1 producto/ }).first()).toBeVisible();
});

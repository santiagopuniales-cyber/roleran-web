import { esMovil, expect, test } from "./base";

test("inicio: título, buscador, categorías y sin errores", async ({ page, errores }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Casi todo en descartables");
  await expect(page.getByRole("link", { name: /Pedir por WhatsApp/ }).first()).toHaveAttribute("href", /^https:\/\/wa\.me\/59893626134/);
  await expect(page.locator("main").getByRole("heading", { name: "Categorías" })).toBeVisible();
  expect(errores).toEqual([]);
});

test("del menú a una categoría, a un producto y de vuelta por las migas", async ({ page, errores }) => {
  await page.goto("/");
  if (esMovil(page)) {
    await page.locator("header summary").filter({ hasText: /^Categorías$/ }).click();
    await page.getByRole("navigation", { name: "Categorías", exact: true }).getByRole("link", { name: /^Bandejas/ }).click();
  } else {
    await page.getByRole("navigation", { name: "Categorías principales" }).getByRole("link", { name: "Bandejas", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/categorias\/bandejas\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Bandejas/);
  // El menú del celular se cierra solo al navegar.
  if (esMovil(page)) await expect(page.getByRole("navigation", { name: "Categorías", exact: true })).toBeHidden();

  await page.getByRole("link", { name: /Estuche de espumaplast 110 EP/ }).first().click();
  await expect(page).toHaveURL(/\/productos\/estuche-de-espumaplast-110-ep\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estuche de espumaplast 110 EP");
  await expect(page.getByText("BESP110EPX200").first()).toBeVisible();

  await page.getByRole("navigation", { name: "Estás en" }).getByRole("link", { name: "Bandejas de espumaplast" }).click();
  await expect(page).toHaveURL(/\/categorias\/bandejas-de-espumaplast\/$/);
  expect(errores).toEqual([]);
});

test("página que no existe: 404 con buscador y categorías", async ({ page }) => {
  const r = await page.goto("/esto-no-existe/");
  expect(r?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("No encontramos esta página");
  await expect(page.locator("main").getByRole("combobox")).toBeVisible();
});

test("páginas institucionales", async ({ page, errores }) => {
  for (const [ruta, titulo] of [
    ["/nosotros/", "Nosotros"],
    ["/contacto/", "Contacto"],
    ["/preguntas-frecuentes/", "Preguntas frecuentes"],
    ["/privacidad/", "Privacidad"],
    ["/rubros/", "Descartables por rubro"],
    ["/rubros/heladerias/", /heladerías/i],
  ] as const) {
    const r = await page.goto(ruta);
    expect(r?.status(), ruta).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
  }
  // Teléfonos con enlace tel: en contacto.
  await page.goto("/contacto/");
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  expect(errores).toEqual([]);
});

test("el mapa de contacto carga recién al pedirlo", async ({ page }) => {
  await page.goto("/contacto/");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Mostrar el mapa" }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /google\.com\/maps/);
});

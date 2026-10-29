import { expect, test } from "./base";

test("armar un pedido y mandarlo por WhatsApp", async ({ page, errores }) => {
  // El sistema de gestión responde con un código (en producción lo atiende worker/index.ts).
  const reservas: unknown[] = [];
  const envios: { codigo: string; via: string }[] = [];
  await page.route("**/api/cotizacion/reservar", async (r) => {
    reservas.push(r.request().postDataJSON());
    await r.fulfill({ json: { codigo: "R-7K2" } });
  });
  await page.route("**/api/cotizacion/enviar", async (r) => {
    envios.push(r.request().postDataJSON());
    await r.fulfill({ json: { ok: true } });
  });
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await expect(page.getByText(/Ya tenés/)).toBeVisible();

  // Otro producto desde una tarjeta de categoría.
  await page.goto("/categorias/cajas-para-pizza/");
  await page.getByRole("button", { name: /Agregar Caja para pizza marrón 33 × 33 cm a la cotización/ }).click();
  await expect(page.getByRole("link", { name: /Cotización 2 productos/ }).first()).toBeVisible();

  await page.goto("/pedido/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cotización");
  await expect(page.locator("main")).toContainText("Vaso 550 cc");
  await expect(page.locator("main")).toContainText("PIZMAR33");

  // Cambiar cantidad con el teclado.
  const cantidad = page.getByRole("textbox", { name: /Cantidad de Vaso 550 cc/ });
  await cantidad.fill("3");
  await cantidad.press("Enter");
  await expect(cantidad).toHaveValue("3");

  await page.getByLabel("Empresa o comercio").fill("Rotisería Ñandú & Cía");
  await page.getByText("Envío", { exact: true }).click();
  await page.getByLabel("Dirección de entrega").fill("Av. Italia 1234");

  await expect(page.getByTestId("codigo-cotizacion")).toHaveText("Código R-7K2");
  const enlace = page.getByTestId("enviar-whatsapp");
  const href = await enlace.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/59893626134\?text=/);
  const texto = new URL(href!).searchParams.get("text")!;
  expect(texto).toContain("Quiero cotizar estos productos (R-7K2):");
  expect(texto).toContain("3 × Vaso 550 cc (Paquete × 1.000) · Cód. V550X1000");
  expect(texto).toContain("Cód. PIZMAR33");
  expect(texto).toContain("Empresa: Rotisería Ñandú & Cía");
  expect(texto).toContain("Entrega: envío a Av. Italia 1234");
  await expect(enlace).toHaveAttribute("target", "_blank");
  // Al sistema viajan ids y cantidades, no nombres.
  expect(JSON.stringify(reservas.at(-1))).toContain('"cantidad":3');
  expect(JSON.stringify(reservas.at(-1))).not.toContain("Vaso 550 cc");

  // Tocar «Pedir cotización» avisa al sistema con el código.
  const popup = page.waitForEvent("popup").catch(() => null);
  await enlace.click();
  await (await popup)?.close();
  await expect.poll(() => envios.length).toBeGreaterThan(0);
  // WebKit (Playwright) no expone el cuerpo de un sendBeacon; ahí alcanza con que salga. En producción se
  // verificó contra la base que llega igual.
  if (envios[0]) expect(envios[0]).toMatchObject({ codigo: "R-7K2", via: "whatsapp" });

  // El pedido sobrevive a una recarga.
  await page.reload();
  await expect(page.locator("main")).toContainText("Vaso 550 cc");
  expect(errores).toEqual([]);
});

test("vaciar pide confirmación en la página", async ({ page }) => {
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  await page.getByRole("button", { name: "Vaciar cotización" }).click();
  await expect(page.getByText("¿Vaciar la cotización?")).toBeVisible();
  await page.getByRole("button", { name: "Sí, vaciar" }).click();
  await expect(page.getByText(/Tu cotización está vacía/)).toBeVisible();
});

test("pedido muy largo: copiar en vez de abrir WhatsApp", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
  const renglones = Array.from({ length: 45 }, (_, i) => ({
    producto: { id: `p${i}`, slug: "vaso-550-cc", nombre: `Producto de prueba número ${i} con un nombre largo`, sku: `SKU${i}`, presentacion: "Paquete × 100", imagen: null, placeholder: "vaso", paso: 1, minimo: 1 },
    cantidad: 2,
    nota: "",
  }));
  await page.addInitScript((r) => {
    localStorage.setItem("roleran:pedido:v1", JSON.stringify({ codigo: "R-TEST", renglones: r, notaGeneral: "", cliente: { nombre: "", empresa: "", rut: "", entrega: "", direccion: "" } }));
  }, renglones);
  await page.goto("/pedido/");
  await expect(page.getByTestId("enviar-whatsapp")).toHaveCount(0);
  await expect(page.getByTestId("copiar-pedido")).toBeVisible();
});

test("sin elegir retiro o envío no se manda ni se copia", async ({ page }) => {
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  const popup = page.waitForEvent("popup", { timeout: 1500 }).catch(() => null);
  await page.getByTestId("enviar-whatsapp").click();
  expect(await popup).toBeNull();
  await expect(page.getByText("Elegí una de las dos opciones.")).toBeVisible();
  await page.getByTestId("copiar-pedido").click();
  await expect(page.getByTestId("copiar-pedido")).toHaveText(/Copiar lista/);

  // Envío sin dirección: frena en la dirección.
  await page.getByText("Envío", { exact: true }).click();
  await page.getByTestId("copiar-pedido").click();
  await expect(page.getByText("Falta la dirección.")).toBeVisible();
  await expect(page.getByLabel("Dirección de entrega")).toHaveAttribute("placeholder", "Ej.: Av. Italia 3456, Malvín");
  await expect(page.getByLabel("Dirección de entrega")).toBeFocused();
});

test("copiar lista anda en navegadores sin portapapeles moderno", async ({ page }) => {
  // Como los navegadores internos de WhatsApp o Instagram: sin navigator.clipboard.
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  await page.getByText("Retiro en el local", { exact: true }).click();
  await page.evaluate(() => {
    const original = document.execCommand.bind(document);
    (window as unknown as { copiados: string[] }).copiados = [];
    document.execCommand = (cmd: string, ...resto: unknown[]) => {
      if (cmd === "copy") {
        (window as unknown as { copiados: string[] }).copiados.push(String(document.getSelection() ?? (document.activeElement as HTMLTextAreaElement)?.value));
      }
      return cmd === "copy" ? true : original(cmd, ...(resto as [boolean, string]));
    };
  });
  await page.getByTestId("copiar-pedido").click();
  await expect(page.getByTestId("copiar-pedido")).toHaveText(/Lista copiada/);
  const copiados = await page.evaluate(() => (window as unknown as { copiados: string[] }).copiados);
  expect(copiados).toHaveLength(1);
});

test("si el navegador no deja copiar, muestra el mensaje para copiarlo a mano", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true }));
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  await page.getByText("Retiro en el local", { exact: true }).click();
  await page.evaluate(() => {
    document.execCommand = () => false;
  });
  await page.getByTestId("copiar-pedido").click();
  await expect(page.getByText(/Este navegador no deja copiar solo/)).toBeVisible();
  await expect(page.locator("details pre")).toBeVisible();
  await expect(page.locator("details pre")).toContainText("Quiero cotizar estos productos");
});

test("si cambia algo después de mandarla, ese código deja de valer y se pide otro", async ({ page }) => {
  let siguiente = 0;
  await page.route("**/api/cotizacion/reservar", (r) => r.fulfill({ json: { codigo: ["R-AAA", "R-BBB"][Math.min(siguiente++, 1)] } }));
  await page.route("**/api/cotizacion/enviar", (r) => r.fulfill({ json: { ok: true } }));
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  await page.getByText("Retiro en el local", { exact: true }).click();
  await expect(page.getByTestId("codigo-cotizacion")).toHaveText("Código R-AAA");
  await page.getByTestId("copiar-pedido").click();
  await page.getByRole("textbox", { name: /Cantidad de Vaso 550 cc/ }).fill("9");
  await page.getByRole("textbox", { name: /Cantidad de Vaso 550 cc/ }).press("Enter");
  await expect(page.getByTestId("codigo-cotizacion")).toHaveText("Código R-BBB");
});

test("sin sistema el pedido sale igual, sin código", async ({ page }) => {
  await page.route("**/api/cotizacion/**", (r) => r.fulfill({ status: 502, json: { error: "sistema" } }));
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  await page.getByText("Retiro en el local", { exact: true }).click();
  await page.waitForTimeout(1200);
  await expect(page.getByTestId("codigo-cotizacion")).toHaveCount(0);
  const texto = new URL((await page.getByTestId("enviar-whatsapp").getAttribute("href"))!).searchParams.get("text")!;
  expect(texto).toContain("Quiero cotizar estos productos:");
});

test("los curiosos no reservan código", async ({ page }) => {
  const reservas: unknown[] = [];
  await page.route("**/api/cotizacion/reservar", (r) => (reservas.push(1), r.fulfill({ json: { codigo: "R-AAA" } })));
  await page.goto("/productos/vaso-550-cc/");
  await page.getByRole("button", { name: "Agregar a la cotización" }).click();
  await page.goto("/pedido/");
  await page.getByTestId("enviar-whatsapp").click();
  await page.waitForTimeout(1200);
  expect(reservas).toHaveLength(0);
});

test("consultar un producto por WhatsApp", async ({ page }) => {
  await page.goto("/productos/vaso-550-cc/");
  const href = await page.getByRole("link", { name: "Consultar por WhatsApp" }).getAttribute("href");
  const texto = new URL(href!).searchParams.get("text")!;
  expect(texto).toContain("Vaso 550 cc (Cód. V550X1000)");
  expect(texto).toMatch(/https:\/\/[^/\s]+\/productos\/vaso-550-cc\//);
});

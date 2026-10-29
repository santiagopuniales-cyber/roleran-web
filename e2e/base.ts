// Fixture común: bloquea pedidos a otros dominios (los tests no salen a internet)
// y junta errores de consola y violaciones de la política de seguridad (CSP).
import { test as base, expect, type Page } from "@playwright/test";

export const test = base.extend<{ errores: string[] }>({
  errores: async ({ page }, usar) => {
    const errores: string[] = [];
    // Todo lo que no sea el sitio bajo prueba se bloquea (Google, WhatsApp, etc.).
    const propio = new URL(process.env.BASE_URL ?? "http://localhost:4173").host;
    await page.route((url) => url.host !== propio, (r) => r.abort());
    page.on("pageerror", (e) => {
      // WebKit avisa así cuando una navegación completa (page.goto) corta los prefetch en curso del mismo sitio.
      if (e.message.includes(`${propio}/`) && / due to access control checks/.test(e.message)) return;
      errores.push(`pageerror: ${e.message}`);
    });
    page.on("console", (m) => {
      const t = m.text();
      // Pedidos externos bloqueados a propósito por el test (mapa de Google): no son errores del sitio.
      if (m.type() === "error" && !/net::ERR_FAILED|Failed to load resource|ERR_BLOCKED/.test(t)) errores.push(`console: ${t}`);
      if (/Content Security Policy|Refused to/i.test(t)) errores.push(`csp: ${t}`);
    });
    await usar(errores);
  },
});

export { expect };

export const esMovil = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;

/** Buscador visible del encabezado (en el celular está debajo del logo). */
export const buscadorEncabezado = (page: Page) => page.locator("header").getByRole("combobox").first();

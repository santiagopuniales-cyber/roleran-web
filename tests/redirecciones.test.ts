// Las direcciones de la web vieja (WooCommerce) que Google tiene indexadas tienen que llevar a la página
// nueva que corresponde: cada producto a su ficha y cada categoría a la categoría nueva equivalente.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalogo from "../data/catalogo.json";
import categorias from "../data/categorias.json";

const reglas = new Map(
  readFileSync("public/_redirects", "utf8")
    .split("\n")
    .filter((l) => l.startsWith("/"))
    .map((l) => {
      const [desde, hacia, estado] = l.split(/\s+/);
      return [desde, { hacia, estado }] as const;
    }),
);
const slugsCategoria = new Set((categorias as { slug: string }[]).map((c) => c.slug));
const slugsProducto = new Set(catalogo.productos.map((p) => p.slug));
const carpetaVieja = readdirSync("data/raw").filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1)!;
const catsViejas = JSON.parse(readFileSync(path.join("data/raw", carpetaVieja, "cats.json"), "utf8")) as { slug: string; permalink: string }[];

describe("redirecciones de la web vieja", () => {
  it("entran en el tope de Cloudflare y son todas 301", () => {
    expect(reglas.size).toBeLessThanOrEqual(2000);
    for (const { estado } of reglas.values()) expect(estado).toBe("301");
  });

  it("todas llevan a una página que existe", () => {
    for (const [desde, { hacia }] of reglas) {
      const categoria = hacia.match(/^\/categorias\/([^/]+)\/$/);
      const producto = hacia.match(/^\/productos\/([^/]+)\/$/);
      if (categoria) expect(slugsCategoria.has(categoria[1]), `${desde} → ${hacia}`).toBe(true);
      else if (producto) expect(slugsProducto.has(producto[1]), `${desde} → ${hacia}`).toBe(true);
      else expect(["/", "/productos/", "/pedido/", "/sitemap.xml"], `${desde} → ${hacia}`).toContain(hacia);
    }
  });

  it("cada producto viejo lleva a su propia ficha (o a la del que queda, si era un duplicado), con y sin barra final", () => {
    const porId = new Map(catalogo.productos.map((p) => [p.id, p]));
    const conUrlVieja = catalogo.productos.filter((p) => p.urlVieja && (p.visible || p.duplicadoDe));
    expect(conUrlVieja.length).toBeGreaterThan(700);
    for (const p of conUrlVieja) {
      const destino = p.visible ? p : porId.get(p.duplicadoDe!)!;
      expect(destino.visible, p.id).toBe(true);
      const desde = new URL(p.urlVieja!, "https://www.roleran.com.uy").pathname;
      expect(reglas.get(desde)?.hacia, desde).toBe(`/productos/${destino.slug}/`);
      expect(reglas.get(desde.replace(/\/$/, ""))?.hacia, desde).toBe(`/productos/${destino.slug}/`);
    }
  });

  it("cada categoría vieja tiene destino, con y sin barra final", () => {
    for (const c of catsViejas) {
      const desde = new URL(c.permalink).pathname;
      expect(reglas.get(desde)?.hacia, desde).toMatch(/^\/categorias\/[^/]+\/$/);
      expect(reglas.get(desde.replace(/\/$/, ""))?.hacia, desde).toBe(reglas.get(desde)?.hacia);
    }
  });

  // Las categorías madre de la web vieja casi no tenían productos propios (estaban en las hijas): antes
  // «BOLSAS» llevaba a «Bolsas para vacío» y «BANDEJAS» a «Contenedores y cajones».
  it.each([
    ["/product-category/bandejas/", "/categorias/bandejas/"],
    ["/product-category/bolsas/", "/categorias/bolsas/"],
    ["/product-category/vasos/", "/categorias/vasos-y-copas/"],
    ["/product-category/potes/", "/categorias/potes-y-frascos/"],
    ["/product-category/servilletas/", "/categorias/servilletas-y-papel-higienico/"],
    ["/product-category/articulos-de-cocina/", "/categorias/cocina-y-gastronomia/"],
    ["/product-category/articulos-de-cumple/", "/categorias/reposteria-y-cumpleanos/"],
    ["/product-category/articulos-de-limpiez/", "/categorias/limpieza-e-higiene/"],
    ["/product-category/articulos-de-bano/", "/categorias/bano/"],
    ["/product-category/bandejas/bandejas-de-espuma/", "/categorias/bandejas-de-espumaplast/"],
    ["/product-category/bandejas-de-carton/", "/categorias/bandejas-de-carton/"],
    ["/product-category/platos/", "/categorias/cubiertos-y-platos/"],
    ["/product/vaso-550-cc-x1000/", "/productos/vaso-550-cc/"],
    ["/product/rollo-registradora-termico-79-60-25-un/", "/productos/rollo-termico-para-registradora-79-x-60/"],
    ["/product/bolsa-residuos-fira-70x100-atado-5-x10u-2/", "/productos/bolsa-de-residuos-fira-70-x-100-cm-x10/"],
    ["/tienda/", "/productos/"],
    ["/cart/", "/pedido/"],
  ])("%s → %s", (desde, hacia) => {
    expect(reglas.get(desde)?.hacia).toBe(hacia);
  });
});

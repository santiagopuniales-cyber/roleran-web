// Los productos con foto van antes que los que no tienen, para que al bajar no aparezcan huecos
// (pedido de Santi, 4/11). En la búsqueda, sin tapar al producto claramente buscado.
import MiniSearch from "minisearch";
import { describe, expect, test } from "vitest";
import { buscar, desdeJSON } from "@/lib/busqueda/cliente";
import { construirIndice } from "@/lib/busqueda/indice";
import { obtenerCategorias, productosDeCategoria } from "@/lib/catalogo";
import { itemsExplorador, ordenarPorRelevancia } from "@/lib/explorador";

/** Índice del primer elemento sin foto; todo lo que viene después tampoco puede tener foto. */
function fotosPrimero(conFoto: boolean[]): boolean {
  const corte = conFoto.indexOf(false);
  return corte === -1 || conFoto.slice(corte).every((f) => !f);
}

describe("orden: primero los que tienen foto", () => {
  test("todos los productos (y filtrar por categoría o rubro desde ahí)", () => {
    const orden = Object.fromEntries(obtenerCategorias().map((c) => [c.slug, c.orden]));
    const items = ordenarPorRelevancia(itemsExplorador(), orden);
    expect(items.some((i) => i.imagen) && items.some((i) => !i.imagen)).toBe(true);
    expect(fotosPrimero(items.map((i) => Boolean(i.imagen)))).toBe(true);
    // El catálogo filtrable filtra esta misma lista sin reordenar: cada filtro conserva el orden.
    for (const c of obtenerCategorias()) {
      const filtrados = items.filter((i) => i.raiz === c.slug || i.sub === c.slug);
      expect(fotosPrimero(filtrados.map((i) => Boolean(i.imagen))), c.slug).toBe(true);
    }
  });

  test("cada página de categoría", () => {
    for (const c of obtenerCategorias()) {
      expect(fotosPrimero(productosDeCategoria(c.slug).map((p) => p.imagenes.length > 0)), c.slug).toBe(true);
    }
  });

  test("dentro de una categoría con foto sigue el orden de antes (principal, secundaria, nombre)", () => {
    for (const c of obtenerCategorias()) {
      const conFoto = productosDeCategoria(c.slug).filter((p) => p.imagenes.length);
      const nombres = conFoto.filter((p) => p.categoria === c.slug).map((p) => p.nombre);
      expect(nombres, c.slug).toEqual([...nombres].sort((a, b) => a.localeCompare(b, "es", { numeric: true })));
    }
  });
});

describe("búsqueda: foto primero sin perder relevancia", () => {
  const datos = desdeJSON(JSON.parse(JSON.stringify(construirIndice())), MiniSearch);

  test("el producto claramente buscado sigue primero aunque no tenga foto", () => {
    const r = buscar(datos, "cono papas", 500);
    expect(r[0].nombre).toMatch(/Cono para papas fritas/);
    expect(r[0].imagen).toBeNull();
  });

  test("entre resultados parecidos suben los que tienen foto", () => {
    const r = buscar(datos, "pote 250", 500);
    const primeros = r.slice(0, 6);
    expect(primeros.every((x) => /250/.test(x.nombre))).toBe(true);
    expect(fotosPrimero(primeros.map((x) => Boolean(x.imagen)))).toBe(true);
  });

  test("en búsquedas amplias no hay huecos entre los que tienen foto", () => {
    for (const q of ["bandeja", "vaso", "bolsa", "pote", "caja", "servilleta"]) {
      const r = buscar(datos, q, 500);
      expect(r.length, q).toBeGreaterThan(5);
      // Hasta tres tandas (casi tan buenos como el mejor / lo buscado en el producto / solo por categoría);
      // en cada una, foto primero.
      const cambios = r.slice(1).filter((x, i) => Boolean(x.imagen) && !r[i].imagen).length;
      expect(cambios, q).toBeLessThanOrEqual(2);
    }
  });
});

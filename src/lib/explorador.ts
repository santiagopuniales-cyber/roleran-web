// Datos livianos para el catálogo filtrable (/productos). Se generan en build como /datos/catalogo.json.
// Filtros: categoría y rubro. Material y presentación se sacaron (D-32): la mayoría de los productos no tiene
// esos datos y los filtros escondían más de lo que mostraban.
import "server-only";
import { categoriaRaiz, obtenerProductos, resumen } from "./catalogo";
import type { ProductoResumen } from "./tipos";

export interface ItemExplorador extends ProductoResumen {
  sub: string;
  raiz: string;
  rubros: string[];
  orden: number;
}

export function itemsExplorador(): ItemExplorador[] {
  return obtenerProductos().map((p, i) => ({
    ...resumen(p),
    sub: p.categoria,
    raiz: categoriaRaiz(p.categoria)?.slug ?? p.categoria,
    rubros: p.rubros,
    orden: i,
  }));
}

/** Orden por defecto: por categoría (orden de la taxonomía), primero con foto, y por nombre. */
export function ordenarPorRelevancia(items: ItemExplorador[], ordenCategoria: Record<string, number>): ItemExplorador[] {
  return [...items].sort(
    (a, b) =>
      (ordenCategoria[a.raiz] ?? 99) - (ordenCategoria[b.raiz] ?? 99) ||
      (ordenCategoria[a.sub] ?? 99) - (ordenCategoria[b.sub] ?? 99) ||
      Number(!a.imagen) - Number(!b.imagen) ||
      a.nombre.localeCompare(b.nombre, "es", { numeric: true }),
  );
}

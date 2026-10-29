// Capa de acceso a datos del catálogo. Las páginas solo usan estas funciones:
// hoy leen archivos JSON versionados; mañana pueden leer una base de datos sin tocar las páginas.
import "server-only";
import catalogoJson from "../../data/catalogo.json";
import categoriasJson from "../../data/categorias.json";
import rubrosJson from "../../data/rubros.json";
import type { Categoria, Producto, ProductoResumen, Rubro } from "./tipos";

const TODOS = (catalogoJson as { productos: Producto[] }).productos;
const PRODUCTOS = TODOS.filter((p) => p.visible);
const CATEGORIAS = (categoriasJson as Categoria[]).filter((c) => c.cantidad > 0);
const RUBROS = rubrosJson as Rubro[];

const porSlug = new Map(PRODUCTOS.map((p) => [p.slug, p]));
const porId = new Map(PRODUCTOS.map((p) => [p.id, p]));
const catPorSlug = new Map(CATEGORIAS.map((c) => [c.slug, c]));

const comparar = (a: Producto, b: Producto) => a.nombre.localeCompare(b.nombre, "es", { numeric: true });

// ── Productos ────────────────────────────────────────────────────────────────
export function obtenerProductos(): Producto[] {
  return PRODUCTOS;
}

export function obtenerProducto(slug: string): Producto | undefined {
  return porSlug.get(slug);
}

export function obtenerProductoPorId(id: string): Producto | undefined {
  return porId.get(id);
}

/** Productos de una categoría (incluye subcategorías y categorías secundarias). */
export function productosDeCategoria(slug: string): Producto[] {
  const cat = catPorSlug.get(slug);
  if (!cat) return [];
  const slugs = new Set([slug, ...cat.hijos]);
  return PRODUCTOS.filter((p) => slugs.has(p.categoria) || p.categoriasSecundarias.some((s) => slugs.has(s))).sort(
    (a, b) => ordenCategoria(a, slugs) - ordenCategoria(b, slugs) || comparar(a, b),
  );
}

function ordenCategoria(p: Producto, slugs: Set<string>) {
  // primero los que tienen la categoría como principal, después las secundarias
  return slugs.has(p.categoria) ? catPorSlug.get(p.categoria)?.orden ?? 0 : 100;
}

export function productosDeRubro(slug: string): Producto[] {
  return PRODUCTOS.filter((p) => p.rubros.includes(slug));
}

/** Productos relacionados: misma subcategoría, después misma raíz; prioriza los que tienen foto. */
export function productosRelacionados(p: Producto, cantidad = 8): Producto[] {
  const raiz = categoriaRaiz(p.categoria)?.slug;
  const puntaje = (q: Producto) =>
    (q.categoria === p.categoria ? 4 : 0) +
    (raiz && categoriaRaiz(q.categoria)?.slug === raiz ? 2 : 0) +
    (q.imagenes.length ? 1 : 0) +
    (q.rubros.some((r) => p.rubros.includes(r)) ? 1 : 0);
  return PRODUCTOS.filter((q) => q.id !== p.id)
    .map((q) => ({ q, s: puntaje(q) }))
    .filter(({ s }) => s >= 3)
    .sort((a, b) => b.s - a.s || comparar(a.q, b.q))
    .slice(0, cantidad)
    .map(({ q }) => q);
}

/** Productos destacados para la portada: variados (uno por categoría raíz) y con buena foto. */
export function productosDestacados(cantidad = 8): Producto[] {
  const marcados = PRODUCTOS.filter((p) => p.destacado);
  if (marcados.length >= cantidad) return marcados.slice(0, cantidad);
  return [...marcados, ...PRODUCTOS.filter((p) => !p.destacado && SELECCION_DESTACADOS.includes(p.id))]
    .sort((a, b) => SELECCION_DESTACADOS.indexOf(a.id) - SELECCION_DESTACADOS.indexOf(b.id))
    .slice(0, cantidad);
}

/** Elegidos por calidad de foto (de fabricante, fondo blanco) y variedad de rubros. Ver docs/DECISIONES.md. */
const SELECCION_DESTACADOS = [
  "besp110epx200", "bpp145", "d6", "v16ozc-tx1000", "bespnegra21", "2971x800", "pizmar33", "term240x100",
  "rodal36", "110ehmx200", "rollo28x40", "masa1kg",
];

export function resumen(p: Producto): ProductoResumen {
  const img = p.imagenes[0];
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    sku: p.sku,
    presentacion: p.presentacion.texto,
    imagen: img ? `${img.base}-${img.tamanos[0]}` : null,
    placeholder: placeholderDe(p),
    paso: p.paso,
    minimo: p.minimo,
  };
}

// ── Categorías ───────────────────────────────────────────────────────────────
export function obtenerCategorias(): Categoria[] {
  return CATEGORIAS;
}

export function categoriasRaiz(): Categoria[] {
  return CATEGORIAS.filter((c) => !c.padre).sort((a, b) => a.orden - b.orden);
}

export function obtenerCategoria(slug: string): Categoria | undefined {
  return catPorSlug.get(slug);
}

export function subcategorias(slug: string): Categoria[] {
  return CATEGORIAS.filter((c) => c.padre === slug).sort((a, b) => a.orden - b.orden);
}

export function categoriaRaiz(slug: string): Categoria | undefined {
  let c = catPorSlug.get(slug);
  while (c?.padre) c = catPorSlug.get(c.padre);
  return c;
}

/** Cadena de la raíz a la categoría (para migas de pan). */
export function rutaCategoria(slug: string): Categoria[] {
  const ruta: Categoria[] = [];
  let c = catPorSlug.get(slug);
  while (c) {
    ruta.unshift(c);
    c = c.padre ? catPorSlug.get(c.padre) : undefined;
  }
  return ruta;
}

export function placeholderDe(p: Producto): string {
  return catPorSlug.get(p.categoria)?.placeholder ?? "caja";
}

/** Foto representativa de una categoría: la primera foto de fabricante o la primera disponible. */
export function imagenDeCategoria(slug: string) {
  const prods = productosDeCategoria(slug).filter((p) => p.imagenes.length);
  const elegido = ELEGIDOS_CATEGORIA[slug] ? prods.find((p) => p.id === ELEGIDOS_CATEGORIA[slug]) : undefined;
  return (elegido ?? prods.find((p) => p.imagenes[0].origen === "fabricante") ?? prods[0])?.imagenes[0] ?? null;
}

/** Producto cuya foto representa mejor a cada categoría raíz (revisado a mano en las hojas de contacto). */
const ELEGIDOS_CATEGORIA: Record<string, string> = {
  bandejas: "bespnegra21",
  "envases-pp-y-pet": "bpp145",
  "potes-y-frascos": "p700liso",
  "vasos-y-copas": "v16ozc-tx1000",
  "cajas-de-carton": "pizmar33",
  bolsas: "rollo28x40",
  "cubiertos-platos-y-sorbitos": "pldes21",
  "servilletas-y-papel-higienico": "servcol-20",
  "film-aluminio-y-papel-de-cocina": "rolf45x250",
  "papel-para-envolver": "kraft0-75",
  "reposteria-y-cumpleanos": "casqcolx45z",
  "cocina-y-gastronomia": "ne352",
  "limpieza-e-higiene": "ruedas120l",
  "oficina-y-comercio": "tickrote",
  embalaje: "cintad48x90p",
  hogar: "4990",
};

// ── Rubros ───────────────────────────────────────────────────────────────────
export function obtenerRubros(): Rubro[] {
  return RUBROS;
}

export function obtenerRubro(slug: string): Rubro | undefined {
  return RUBROS.find((r) => r.slug === slug);
}

/** Rubros a los que pertenece buena parte de una categoría (para enlazar «por rubro» desde la categoría). */
export function rubrosDeCategoria(slug: string, minimo = 0.4): Rubro[] {
  const prods = productosDeCategoria(slug);
  if (!prods.length) return [];
  return RUBROS.map((r) => ({ r, n: prods.filter((p) => p.rubros.includes(r.slug)).length }))
    .filter(({ n }) => n / prods.length >= minimo)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map(({ r }) => r);
}

export function totalProductos(): number {
  return PRODUCTOS.length;
}

/** Fecha en que se generó el catálogo (para el sitemap). */
export function fechaCatalogo(): Date {
  return new Date((catalogoJson as { generado: string }).generado);
}

// Modelo de datos del catálogo. Pensado para que mañana venga de una base de datos sin cambiar las páginas.

export type FuentePresentacion = "nombre" | "descripcion" | "ficha" | "codigo" | "regla" | "revision" | null;

export type TipoPresentacion = "unidad" | "paquete" | "caja" | "funda" | "tubo" | "rollo" | "kg" | "metro" | "consultar";

export interface Presentacion {
  tipo: TipoPresentacion;
  unidades: number | null;
  detalle: string | null;
  /** Texto para mostrar: «Paquete × 100», «Por kg», «Por unidad o por mayor» (sin dato). */
  texto: string;
  fuente: FuentePresentacion;
  aprox?: boolean;
  /** true si el dato no sale del nombre ni de la descripción original. */
  aConfirmar: boolean;
}

export interface Atributos {
  material?: string;
  medidas?: string;
  capacidad?: string;
  color?: string;
  diametro?: string;
  largo?: string;
  ancho?: string;
  usoApto?: string;
  marca?: string;
  codigoFabricante?: string;
  unidadesPorPaquete?: number;
  presentacion?: string;
  empaqueCerrado?: { tipo: string; unidades: number };
}

export interface ImagenProducto {
  id: string;
  /** Ruta base sin tamaño ni extensión: /img/p/3345 → /img/p/3345-640.avif */
  base: string;
  tamanos: number[];
  ancho: number;
  alto: number;
  origen: string;
  alt: string;
}

/** Escala de precio por cantidad: desde N unidades de venta, precio en pesos uruguayos (IVA incluido). */
export interface EscalaPrecio {
  desde: number;
  precio: number;
}

export interface Producto {
  id: string;
  wpId: number;
  sku: string | null;
  skuOriginal: string;
  skuProvisorio: boolean;
  slug: string;
  nombre: string;
  nombreOriginal: string;
  categoria: string;
  categoriasSecundarias: string[];
  categoriasViejas: string[];
  rubros: string[];
  atributos: Atributos;
  extras: { etiqueta: string; valor: string }[];
  presentacion: Presentacion;
  /** Paso del selector de cantidad (0,5 para productos por kilo). */
  paso: number;
  minimo: number;
  descripcionCorta: string;
  descripcion: string;
  imagenes: ImagenProducto[];
  precios: EscalaPrecio[];
  visible: boolean;
  destacado: boolean;
  pendientes: string[];
  sinonimos: string[];
  duplicadoDe: string | null;
  urlVieja: string;
  fechaAlta: string | null;
}

export interface Categoria {
  slug: string;
  nombre: string;
  padre: string | null;
  orden: number;
  descripcion: string;
  /** Dibujo que se usa cuando un producto no tiene foto. */
  placeholder: string;
  hijos: string[];
  cantidad: number;
  cantidadDirecta: number;
}

export interface Rubro {
  slug: string;
  nombre: string;
  titulo: string;
  intro: string;
  /** Categorías que encabezan la página del rubro, en este orden. */
  primero: string[];
  cantidad: number;
}

/** Datos mínimos de un producto para el pedido y la búsqueda (se guardan en el navegador). */
export interface ProductoResumen {
  id: string;
  slug: string;
  nombre: string;
  sku: string | null;
  presentacion: string;
  imagen: string | null;
  placeholder: string;
  paso: number;
  minimo: number;
}

// Tarjeta de producto: foto, nombre, presentación, código y botón para agregar a la cotización.
import Link from "next/link";
import { BANDERAS } from "@/config/sitio";
import { placeholderDe, resumen } from "@/lib/catalogo";
import type { Producto } from "@/lib/tipos";
import { ImagenProducto } from "./ImagenProducto";
import { BotonAgregar } from "./pedido/BotonAgregar";
import { Etiqueta } from "./ui";
import { PrecioDesde } from "./precios/PrecioDesde";

export function TarjetaProducto({ producto, prioridad = false, nivelTitulo = 3 }: { producto: Producto; prioridad?: boolean; nivelTitulo?: 2 | 3 }) {
  const H = nivelTitulo === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde bg-white transition-shadow hover:shadow-tarjeta-hover">
      <Link href={`/productos/${producto.slug}/`} className="block" tabIndex={-1} aria-hidden="true">
        <ImagenProducto
          imagen={producto.imagenes[0]}
          placeholder={placeholderDe(producto)}
          alt=""
          sizes="(min-width: 80rem) 230px, (min-width: 48rem) 22vw, (min-width: 40rem) 31vw, 46vw"
          prioridad={prioridad}
          className="border-b border-borde/70"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <H className="font-sans text-[0.95rem] font-semibold leading-snug [font-stretch:100%] tracking-normal sm:text-base">
          <Link href={`/productos/${producto.slug}/`} className="enlace-tarjeta after:absolute after:inset-0 after:content-[''] hover:text-verde">
            {producto.nombre}
          </Link>
        </H>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Etiqueta>{producto.presentacion.texto}</Etiqueta>
          {producto.sku && <span className="numeros text-xs text-tinta-tenue">Cód. {producto.sku}</span>}
        </div>
        {BANDERAS.MOSTRAR_PRECIOS && <PrecioDesde precios={producto.precios} />}
        <div className="relative z-10 mt-auto pt-1">
          <BotonAgregar producto={resumen(producto)} />
        </div>
      </div>
    </article>
  );
}

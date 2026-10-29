"use client";
// Versión de la tarjeta para listas que se arman en el navegador (búsqueda y catálogo filtrado).
import Link from "next/link";
import type { ProductoResumen } from "@/lib/tipos";
import { BotonAgregar } from "./pedido/BotonAgregar";
import { Placeholder } from "./Placeholder";
import { Etiqueta } from "./ui";

// `prioridad`: las primeras tarjetas de la búsqueda son lo más grande de la pantalla (LCP); sin lazy.
export function TarjetaCliente({ producto, detalle, prioridad = false }: { producto: ProductoResumen; detalle?: string; prioridad?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta border border-borde bg-white transition-shadow hover:shadow-tarjeta-hover">
      <div className="aspect-square overflow-hidden border-b border-borde/70 bg-white">
        {producto.imagen ? (
          <picture>
            <source type="image/avif" srcSet={`${producto.imagen}.avif`} />
            { }
            <img src={`${producto.imagen}.webp`} alt="" width={320} height={320} loading={prioridad ? "eager" : "lazy"} fetchPriority={prioridad ? "high" : "auto"} decoding="async" className="h-full w-full object-contain" />
          </picture>
        ) : (
          <Placeholder tipo={producto.placeholder} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <h3 className="font-sans text-[0.95rem] font-semibold leading-snug tracking-normal [font-stretch:100%] sm:text-base">
          <Link href={`/productos/${producto.slug}/`} className="enlace-tarjeta after:absolute after:inset-0 after:content-[''] hover:text-verde">
            {producto.nombre}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Etiqueta>{producto.presentacion}</Etiqueta>
          {producto.sku && <span className="numeros text-xs text-tinta-tenue">Cód. {producto.sku}</span>}
        </div>
        {detalle && <p className="text-xs text-tinta-tenue">{detalle}</p>}
        <div className="relative z-10 mt-auto pt-1">
          <BotonAgregar producto={producto} />
        </div>
      </div>
    </article>
  );
}

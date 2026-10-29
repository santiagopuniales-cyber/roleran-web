// Fila compacta de producto (listas largas: rubros). Foto chica, nombre, presentación, código y «Agregar».
import Link from "next/link";
import { placeholderDe, resumen } from "@/lib/catalogo";
import type { Producto } from "@/lib/tipos";
import { BotonAgregar } from "./pedido/BotonAgregar";
import { Placeholder } from "./Placeholder";
import { Etiqueta } from "./ui";

export function FilaProducto({ producto }: { producto: Producto }) {
  const img = producto.imagenes[0];
  return (
    <div className="relative flex items-center gap-3 px-3 py-2.5 sm:px-4">
      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-control border border-borde bg-white">
        {img ? (
          <picture>
            <source type="image/avif" srcSet={`${img.base}-${img.tamanos[0]}.avif`} />
            { }
            <img src={`${img.base}-${img.tamanos[0]}.webp`} alt="" width={56} height={56} loading="lazy" decoding="async" className="h-full w-full object-contain" />
          </picture>
        ) : (
          <Placeholder tipo={placeholderDe(producto)} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <Link href={`/productos/${producto.slug}/`} className="enlace-tarjeta font-semibold leading-snug after:absolute after:inset-0 after:content-[''] hover:text-verde">
          {producto.nombre}
        </Link>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Etiqueta>{producto.presentacion.texto}</Etiqueta>
          {producto.sku && <span className="numeros text-xs text-tinta-tenue">Cód. {producto.sku}</span>}
        </span>
      </span>
      <span className="relative z-10 shrink-0">
        <BotonAgregar producto={resumen(producto)} compacto />
      </span>
    </div>
  );
}

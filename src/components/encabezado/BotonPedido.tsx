"use client";
import Link from "next/link";
import { IconoPedido } from "@/components/iconos";
import { usePedido } from "@/lib/pedido/almacen";

export function BotonPedido() {
  const { renglones } = usePedido();
  const n = renglones.length;
  return (
    <Link
      href="/pedido/"
      className="relative inline-flex h-12 shrink-0 items-center gap-2 rounded-control bg-verde px-3.5 font-semibold text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] hover:bg-verde-oscuro sm:px-4"
    >
      {/* Nombre accesible = texto visible («Cotización 2») + «productos»: lo que se ve es lo que se lee. */}
      <IconoPedido tamano={22} />
      <span className="sr-only sm:not-sr-only">Cotización</span>
      <span className={`numeros inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm ${n ? "bg-white text-verde" : "bg-white/20 text-white"}`}>{n}</span>
      <span className="sr-only">{n === 1 ? "producto" : "productos"}</span>
    </Link>
  );
}

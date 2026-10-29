"use client";
// Barra fija abajo en el celular cuando hay productos en la cotización.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoChat } from "@/components/iconos";
import { usePedido } from "@/lib/pedido/almacen";

export function BarraPedidoMovil() {
  const { renglones } = usePedido();
  const ruta = usePathname();
  const n = renglones.length;
  if (!n || ruta?.startsWith("/pedido")) return null;
  return (
    <>
      <div className="h-20 md:hidden [@media(max-height:500px)]:h-16" aria-hidden="true" />
      <div className="no-imprimir fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-flotante backdrop-blur md:hidden [@media(max-height:500px)]:py-1.5">
        <Link
          href="/pedido/"
          className="flex h-13 items-center justify-between rounded-control bg-verde px-4 [@media(max-height:500px)]:h-11 font-semibold text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] active:bg-verde-oscuro"
        >
          <span>
            Cotización <span className="numeros">({n})</span>
          </span>
          <span className="flex items-center gap-2">
            Revisar y pedir <IconoChat tamano={20} />
          </span>
        </Link>
      </div>
    </>
  );
}

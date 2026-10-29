import type { Metadata } from "next";
import { SITIO } from "@/config/sitio";
import { Migas } from "@/components/Migas";
import { PaginaPedido } from "@/components/pedido/PaginaPedido";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cotización",
  description: `Armá tu pedido de envases y descartables y mandalo por WhatsApp a ${SITIO.nombre}: te respondemos con el precio y la disponibilidad de cada producto.`,
  alternates: { canonical: canonica("/pedido/") },
  openGraph: compartir("/pedido/", `Cotización | ${SITIO.nombre}`),
};

export default function Pedido() {
  return (
    <div className="contenedor pt-5">
      <Migas items={[{ nombre: "Cotización" }]} />
      {/* Alto reservado: el pedido se arma en el navegador y así el pie no salta al cargar. */}
      <div className="min-h-[75vh]">
        <PaginaPedido />
      </div>
    </div>
  );
}

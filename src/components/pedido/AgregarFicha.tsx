"use client";
// Bloque de la ficha: cantidad + «Agregar a la cotización» + «Consultar por WhatsApp».
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconoChat, IconoCheck, IconoPedido } from "@/components/iconos";
import { claseBoton } from "@/components/ui";
import { SITIO } from "@/config/sitio";
import { evento } from "@/lib/analytics";
import { cantidadDe, pedido, usePedido } from "@/lib/pedido/almacen";
import { anunciar } from "@/lib/pedido/anuncios";
import { unidadDeVenta } from "@/lib/pedido/unidades";
import { formatearCantidad, mensajeConsulta, urlWhatsApp } from "@/lib/pedido/whatsapp";
import type { ProductoResumen } from "@/lib/tipos";
import { SelectorCantidad } from "./SelectorCantidad";

export function AgregarFicha({ producto, unidad }: { producto: ProductoResumen; unidad?: string }) {
  const estado = usePedido();
  const renglon = cantidadDe(estado, producto.id);
  const [cantidad, setCantidad] = useState(producto.minimo);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    evento("view_item", { items: [{ item_id: producto.sku ?? producto.id, item_name: producto.nombre }] });
  }, [producto.id, producto.nombre, producto.sku]);

  const agregar = () => {
    pedido.agregar(producto, cantidad);
    setAgregado(true);
    anunciar(`${producto.nombre}: ${formatearCantidad(cantidad)} agregado a la cotización`);
    evento("add_to_cart", { items: [{ item_id: producto.sku ?? producto.id, item_name: producto.nombre, quantity: cantidad }] });
  };

  const consulta = urlWhatsApp(mensajeConsulta(producto.nombre, producto.sku, `${SITIO.url}/productos/${producto.slug}/`));

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-tinta-suave">
        {producto.presentacion === "Por kg"
          ? "Cantidad en kilos (de a medio kilo):"
          : `Cantidad de ${unidadDeVenta(producto.presentacion).plural}:`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <SelectorCantidad
          valor={cantidad}
          paso={producto.paso}
          minimo={producto.minimo}
          onCambio={setCantidad}
          etiqueta="Cantidad"
          unidad={unidad}
        />
        <button type="button" onClick={agregar} className={claseBoton("primario", "normal", "flex-1 sm:flex-none")}>
          <IconoPedido tamano={20} /> Agregar a la cotización
        </button>
      </div>
      {renglon && (
        <p className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-control px-3 py-2 text-sm ${agregado ? "bg-verde-claro text-verde" : "bg-lienzo text-tinta-suave"}`}>
          <IconoCheck tamano={18} />
          Ya tenés {formatearCantidad(renglon.cantidad)} en tu cotización.
          <Link href="/pedido/" className="-my-2 inline-block py-2 font-semibold text-verde underline underline-offset-4">
            Ver cotización
          </Link>
        </p>
      )}
      <a href={consulta} target="_blank" rel="noopener noreferrer" className={claseBoton("secundario", "normal", "mt-3 w-full")}>
        <IconoChat tamano={20} /> Consultar por WhatsApp
      </a>
    </div>
  );
}

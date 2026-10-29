"use client";
// Botón de la tarjeta: «Agregar» suma el mínimo; si ya está en el pedido, muestra el selector de cantidad.
import { useState } from "react";
import { claseBoton } from "@/components/ui";
import { IconoMas } from "@/components/iconos";
import { cantidadDe, pedido, usePedido } from "@/lib/pedido/almacen";
import { anunciar } from "@/lib/pedido/anuncios";
import { evento } from "@/lib/analytics";
import type { ProductoResumen } from "@/lib/tipos";
import { SelectorCantidad } from "./SelectorCantidad";

/** compacto: en el celular muestra solo el «+» (para filas angostas); el nombre accesible no cambia. */
export function BotonAgregar({ producto, compacto = false }: { producto: ProductoResumen; compacto?: boolean }) {
  const estado = usePedido();
  const renglon = cantidadDe(estado, producto.id);
  const [recien, setRecien] = useState(false);

  if (renglon) {
    return (
      // En el celular la tarjeta mide ~134 px: el aviso va abajo para que el selector entre entero (con el «+»).
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
        <SelectorCantidad
          compacto
          valor={renglon.cantidad}
          paso={producto.paso}
          minimo={producto.minimo}
          permitirCero
          etiqueta={`Cantidad de ${producto.nombre} en tu pedido`}
          onCambio={(n) => {
            if (n <= 0 || n < producto.minimo) {
              pedido.quitar(producto.id);
              anunciar(`${producto.nombre}: quitado de la cotización`);
            } else pedido.cambiarCantidad(producto.id, n);
          }}
        />
        <span className={`text-xs font-semibold text-verde ${recien ? "" : "sr-only"}`} aria-hidden={!recien}>
          En tu cotización
        </span>
      </div>
    );
  }
  return (
    <button
      type="button"
      className={claseBoton("secundario", "chico", compacto ? "w-11 px-0! sm:w-auto sm:px-3.5!" : "w-full sm:w-auto")}
      onClick={() => {
        pedido.agregar(producto, producto.minimo);
        setRecien(true);
        anunciar(`${producto.nombre}: agregado a la cotización`);
        evento("add_to_cart", { items: [{ item_id: producto.sku ?? producto.id, item_name: producto.nombre, quantity: producto.minimo }] });
      }}
    >
      <IconoMas tamano={compacto ? 20 : 16} /> <span className={compacto ? "sr-only sm:not-sr-only" : ""}>Agregar</span> <span className="sr-only">{producto.nombre} a la cotización</span>
    </button>
  );
}

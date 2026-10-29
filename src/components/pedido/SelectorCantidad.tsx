"use client";
import { useState } from "react";
import { IconoMas, IconoMenos } from "@/components/iconos";
import { formatearCantidad } from "@/lib/pedido/whatsapp";

interface Props {
  valor: number;
  paso: number;
  minimo: number;
  onCambio: (n: number) => void;
  etiqueta: string;
  unidad?: string;
  compacto?: boolean;
  /** Si se permite bajar de mínimo (para quitar del pedido). */
  permitirCero?: boolean;
}

/** − [cantidad] + con teclado accesible. Acepta coma decimal en productos por kilo. */
export function SelectorCantidad({ valor, paso, minimo, onCambio, etiqueta, unidad, compacto = false, permitirCero = false }: Props) {
  const [texto, setTexto] = useState(formatearCantidad(valor));
  // Si la cantidad cambia desde afuera (botones, otra pestaña), el campo la refleja.
  const [previo, setPrevio] = useState(valor);
  if (previo !== valor) {
    setPrevio(valor);
    setTexto(formatearCantidad(valor));
  }

  const confirmar = (t: string) => {
    const n = Number(t.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      if (permitirCero && n === 0) return onCambio(0);
      setTexto(formatearCantidad(valor));
      return;
    }
    onCambio(Math.max(minimo, Math.round(n / paso) * paso));
  };
  const alto = compacto ? "h-11 md:h-10" : "h-11";
  const boton = `flex ${alto} ${compacto ? "w-10" : "w-11"} shrink-0 items-center justify-center text-verde hover:bg-verde-claro disabled:text-borde-fuerte disabled:hover:bg-transparent`;
  return (
    <div className={`inline-flex ${alto} items-stretch overflow-hidden rounded-control border border-borde-fuerte bg-white`}>
      <button
        type="button"
        className={boton}
        onClick={() => onCambio(Math.round((valor - paso) * 100) / 100)}
        disabled={!permitirCero && valor - paso < minimo}
        aria-label={`Restar ${formatearCantidad(paso)}`}
      >
        <IconoMenos tamano={18} />
      </button>
      <label className="flex items-center">
        <span className="sr-only">{etiqueta}</span>
        <input
          inputMode="decimal"
          className={`numeros w-12 border-x border-borde bg-transparent text-center font-semibold outline-none focus-visible:bg-verde-claro ${compacto ? "text-base md:pointer-fine:text-sm" : ""}`}
          value={texto}
          onChange={(e) => setTexto(e.target.value.replace(/[^\d.,]/g, ""))}
          onBlur={(e) => confirmar(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmar((e.target as HTMLInputElement).value);
            if (e.key === "ArrowUp") {
              e.preventDefault();
              onCambio(valor + paso);
            }
            if (e.key === "ArrowDown" && valor - paso >= minimo) {
              e.preventDefault();
              onCambio(valor - paso);
            }
          }}
        />
      </label>
      {unidad && <span className="flex items-center pr-1 text-xs text-tinta-tenue">{unidad}</span>}
      <button type="button" className={boton} onClick={() => onCambio(Math.round((valor + paso) * 100) / 100)} aria-label={`Sumar ${formatearCantidad(paso)}`}>
        <IconoMas tamano={18} />
      </button>
    </div>
  );
}

import type { EscalaPrecio } from "@/lib/tipos";
import { filasEscala, formatearPesos } from "./escalas";

export function PrecioDesde({ precios }: { precios: EscalaPrecio[] }) {
  const filas = filasEscala(precios);
  if (!filas.length) return null;
  const menor = Math.min(...filas.map((f) => f.precio));
  return (
    <p className="text-sm text-tinta-suave">
      Desde <strong className="numeros text-base text-tinta">{formatearPesos(menor)}</strong>
    </p>
  );
}

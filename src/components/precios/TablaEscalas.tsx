// Tabla de precios por cantidad para la ficha. Existe y está probada, pero no se muestra
// mientras BANDERAS.MOSTRAR_PRECIOS esté apagada (ver docs/PROXIMOS-PASOS.md).
import type { EscalaPrecio } from "@/lib/tipos";
import { filasEscala, formatearPesos } from "./escalas";

export function TablaEscalas({ precios, unidad }: { precios: EscalaPrecio[]; unidad: string }) {
  const filas = filasEscala(precios);
  if (!filas.length) return null;
  return (
    <table className="w-full text-sm" data-testid="tabla-escalas">
      <caption className="mb-2 text-left font-semibold">Precio por cantidad ({unidad})</caption>
      <thead>
        <tr className="border-b border-borde text-left text-tinta-tenue">
          <th scope="col" className="py-2 font-medium">Cantidad</th>
          <th scope="col" className="py-2 text-right font-medium">Precio c/u</th>
          <th scope="col" className="py-2 text-right font-medium">Ahorro</th>
        </tr>
      </thead>
      <tbody className="numeros">
        {filas.map((f) => (
          <tr key={f.desde} className="border-b border-borde/70">
            <td className="py-2">{f.hasta ? `${f.desde} a ${f.hasta}` : `${f.desde} o más`}</td>
            <td className="py-2 text-right font-semibold">{formatearPesos(f.precio)}</td>
            <td className="py-2 text-right text-verde">{f.ahorro ? `${f.ahorro} %` : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

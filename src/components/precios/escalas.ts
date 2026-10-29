// Precios por cantidad (escalas). Se muestran solo si BANDERAS.MOSTRAR_PRECIOS está prendida.
import type { EscalaPrecio } from "@/lib/tipos";

export function formatearPesos(n: number): string {
  return `$ ${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export interface FilaEscala {
  desde: number;
  hasta: number | null;
  precio: number;
  ahorro: number | null;
}

/** Ordena las escalas y calcula hasta qué cantidad aplica cada una y el ahorro contra la primera. */
export function filasEscala(precios: EscalaPrecio[]): FilaEscala[] {
  const orden = [...precios].filter((p) => p.desde > 0 && p.precio > 0).sort((a, b) => a.desde - b.desde);
  const base = orden[0]?.precio ?? null;
  return orden.map((p, i) => ({
    desde: p.desde,
    hasta: orden[i + 1] ? orden[i + 1].desde - 1 : null,
    precio: p.precio,
    ahorro: base && p.precio < base ? Math.round((1 - p.precio / base) * 100) : null,
  }));
}

/** Precio unitario que corresponde a una cantidad. */
export function precioPara(precios: EscalaPrecio[], cantidad: number): number | null {
  const filas = filasEscala(precios);
  const fila = [...filas].reverse().find((f) => cantidad >= f.desde);
  return fila?.precio ?? null;
}

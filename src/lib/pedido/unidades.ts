// Nombre de la unidad de venta a partir del texto de la presentación («Paquete × 100» → paquete/paquetes).

export function unidadDeVenta(presentacion: string): { singular: string; plural: string } {
  if (presentacion === "Por kg") return { singular: "kilo", plural: "kilos" };
  if (presentacion === "Por metro") return { singular: "metro", plural: "metros" };
  if (presentacion === "Por unidad" || presentacion === PRESENTACION_ABIERTA) return { singular: "unidad", plural: "unidades" };
  const primera = presentacion.split(/\s+/)[0].toLowerCase();
  const plural = primera.endsWith("ón")
    ? primera.slice(0, -2) + "ones"
    : /[aeiou]$/.test(primera)
      ? primera + "s"
      : primera.endsWith("t")
        ? primera + "s"
        : primera + "es";
  return { singular: primera, plural };
}import { PRESENTACION_ABIERTA } from "@/lib/presentacion";


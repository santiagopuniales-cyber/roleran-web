// Botón de WhatsApp único para toda la web: mismo ícono, mismo alto y el mismo saludo en el mensaje.
// Principal (verde lleno) cuando es la acción del bloque; secundario cuando acompaña a otra.
import type { ReactNode } from "react";
import { SALUDO, urlWhatsApp } from "@/lib/pedido/whatsapp";
import { IconoChat } from "./iconos";
import { claseBoton } from "./ui";

interface Props {
  /** Texto que llega escrito en WhatsApp (sin el saludo, que se agrega solo). Vacío = solo el saludo. */
  mensaje?: string;
  children: ReactNode;
  variante?: "primario" | "secundario";
  tamano?: "normal" | "grande";
  className?: string;
}

export function BotonWhatsApp({ mensaje, children, variante = "primario", tamano = "normal", className = "" }: Props) {
  return (
    <a href={urlWhatsApp(mensaje ? `${SALUDO} ${mensaje}` : `${SALUDO} `)} target="_blank" rel="noopener noreferrer" className={claseBoton(variante, tamano, className)}>
      <IconoChat tamano={tamano === "grande" ? 22 : 20} /> {children}
    </a>
  );
}

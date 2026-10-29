// Arma el mensaje de pedido y el enlace de WhatsApp. Funciones puras: se prueban con tests.
import { PRESENTACION_ABIERTA } from "@/lib/presentacion";
import { LIMITE_URL_WHATSAPP, SITIO } from "@/config/sitio";
import type { ProductoResumen } from "@/lib/tipos";

export interface RenglonPedido {
  producto: ProductoResumen;
  cantidad: number;
  nota: string;
}

export interface DatosCliente {
  nombre: string;
  empresa: string;
  rut: string;
  entrega: "retiro" | "envio" | "";
  direccion: string;
}

export interface Pedido {
  /** Código que dio el sistema (vacío si todavía no hay o si el sistema no respondió). */
  codigo: string;
  /** Huella de lo que se mandó con ese código; si el contenido cambia, el código ya no vale. */
  enviado: string;
  renglones: RenglonPedido[];
  notaGeneral: string;
  cliente: DatosCliente;
}

/** Saludo de los mensajes: «Hola, Roleran S.A.» (el punto de «S.A.» cierra la frase). */
export const SALUDO = `Hola, ${SITIO.nombre}`;

export function formatearCantidad(cantidad: number): string {
  return Number.isInteger(cantidad) ? String(cantidad) : String(cantidad).replace(".", ",");
}

/** «3 × Vaso 550 cc (Paquete × 1.000) · Cód. V550X1000» */
export function textoRenglon({ producto, cantidad }: RenglonPedido): string {
  const pres = producto.presentacion;
  const codigo = producto.sku ? ` · Cód. ${producto.sku}` : "";
  if (pres === "Por kg") return `${formatearCantidad(cantidad)} kg de ${producto.nombre}${codigo}`;
  if (pres === "Por metro") return `${formatearCantidad(cantidad)} m de ${producto.nombre}${codigo}`;
  // Sin presentación conocida: quien arma el pedido confirma con el cliente si son unidades o bultos.
  const detalle = pres === PRESENTACION_ABIERTA ? "consultar presentación" : pres;
  return `${formatearCantidad(cantidad)} × ${producto.nombre} (${detalle})${codigo}`;
}

export function armarMensaje(pedido: Pedido): string {
  const l: string[] = [];
  l.push(`${SALUDO} Quiero cotizar estos productos${pedido.codigo ? ` (${pedido.codigo})` : ""}:`);
  l.push("");
  pedido.renglones.forEach((r, i) => {
    l.push(`${i + 1}) ${textoRenglon(r)}`);
    if (r.nota.trim()) l.push(`   Nota: ${r.nota.trim()}`);
  });
  if (pedido.notaGeneral.trim()) {
    l.push("");
    l.push(`Nota: ${pedido.notaGeneral.trim()}`);
  }
  const c = pedido.cliente;
  const datos: string[] = [];
  if (c.nombre.trim()) datos.push(`Nombre: ${c.nombre.trim()}`);
  if (c.empresa.trim()) datos.push(`Empresa: ${c.empresa.trim()}`);
  if (c.rut.trim()) datos.push(`RUT: ${c.rut.trim()}`);
  if (c.entrega === "retiro") datos.push("Entrega: retiro en el local");
  if (c.entrega === "envio") datos.push(`Entrega: envío${c.direccion.trim() ? ` a ${c.direccion.trim()}` : ""}`);
  if (datos.length) {
    l.push("");
    l.push(...datos);
  }
  l.push("");
  l.push("¿Me pasan precio y disponibilidad? Gracias.");
  return l.join("\n");
}

/** Mínimo para mandar o copiar: retiro o envío elegido y, si es envío, una dirección que se pueda buscar. */
export function faltaParaEnviar(pedido: Pedido): "entrega" | "direccion" | null {
  if (pedido.cliente.entrega !== "retiro" && pedido.cliente.entrega !== "envio") return "entrega";
  if (pedido.cliente.entrega === "envio" && pedido.cliente.direccion.trim().length < 6) return "direccion";
  return null;
}

export function urlWhatsApp(texto?: string): string {
  const base = `https://wa.me/${SITIO.whatsapp.numero}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

/** Devuelve la URL con el texto, o null si queda demasiado larga para abrirse de forma confiable. */
export function urlPedido(pedido: Pedido): { url: string | null; texto: string } {
  const texto = armarMensaje(pedido);
  const url = urlWhatsApp(texto);
  return { url: url.length <= LIMITE_URL_WHATSAPP ? url : null, texto };
}

export function mensajeConsulta(nombre: string, sku: string | null, url: string): string {
  return `${SALUDO} Quiero consultar por: ${nombre}${sku ? ` (Cód. ${sku})` : ""}.\n${url}`;
}

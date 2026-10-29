"use client";
// Conexión con el sistema de gestión (vía worker/index.ts). Si algo falla, la web sigue igual:
// el mensaje de WhatsApp sale sin código y la oficina lo carga como siempre.
import type { Pedido } from "./whatsapp";

const CLAVE_SESION = "roleran:sesion:v1";
let sesionEnMemoria: string | null = null;

/** Identificador al azar de este navegador: con él el sistema reusa el código mientras no se mande. */
export function sesion(): string {
  if (sesionEnMemoria) return sesionEnMemoria;
  try {
    const guardada = window.localStorage.getItem(CLAVE_SESION);
    if (guardada && /^[A-Za-z0-9_-]{16,64}$/.test(guardada)) return (sesionEnMemoria = guardada);
  } catch {
    // sin almacenamiento: vale para esta pestaña
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  sesionEnMemoria = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  try {
    window.localStorage.setItem(CLAVE_SESION, sesionEnMemoria);
  } catch {
    // idem
  }
  return sesionEnMemoria;
}

/** Lo que viaja al sistema: solo ids, cantidades, notas y datos del cliente (el nombre del producto lo pone la base). */
export function datosParaSistema(p: Pedido) {
  return {
    renglones: p.renglones.map((r) => ({ id: r.producto.id, cantidad: r.cantidad, nota: r.nota.trim() })),
    cliente: {
      nombre: p.cliente.nombre.trim(),
      empresa: p.cliente.empresa.trim(),
      rut: p.cliente.rut.trim(),
      entrega: p.cliente.entrega,
      direccion: p.cliente.entrega === "envio" ? p.cliente.direccion.trim() : "",
    },
    nota: p.notaGeneral.trim(),
  };
}

/** Huella del contenido: si cambia, el código ya no corresponde a lo que se mandó. */
export function huella(p: Pedido): string {
  return JSON.stringify(datosParaSistema(p));
}

export async function reservarCodigo(p: Pedido, senal?: AbortSignal): Promise<string | null> {
  try {
    const r = await fetch("/api/cotizacion/reservar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sesion: sesion(), datos: datosParaSistema(p) }),
      signal: senal,
    });
    if (!r.ok) return null;
    const { codigo } = (await r.json()) as { codigo?: unknown };
    return typeof codigo === "string" && /^R-[23456789A-HJ-NP-Z]{3,6}$/.test(codigo) ? codigo : null;
  } catch {
    return null;
  }
}

/** Avisa que se mandó (o copió). sendBeacon sobrevive a que se abra WhatsApp y se deje la página. */
export function avisarEnvio(p: Pedido, via: "whatsapp" | "copia") {
  if (!p.codigo) return;
  const cuerpo = JSON.stringify({ sesion: sesion(), codigo: p.codigo, via, datos: datosParaSistema(p) });
  try {
    if (navigator.sendBeacon?.("/api/cotizacion/enviar", new Blob([cuerpo], { type: "application/json" }))) return;
  } catch {
    // sigue con fetch
  }
  void fetch("/api/cotizacion/enviar", { method: "POST", headers: { "content-type": "application/json" }, body: cuerpo, keepalive: true }).catch(() => {});
}

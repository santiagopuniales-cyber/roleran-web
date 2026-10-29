"use client";
// Estado del pedido guardado en el navegador (localStorage), compartido entre pestañas.
// Si el navegador bloquea el almacenamiento, el pedido funciona igual mientras la página esté abierta.
import { useSyncExternalStore } from "react";
import type { ProductoResumen } from "@/lib/tipos";
import type { DatosCliente, Pedido, RenglonPedido } from "./whatsapp";

const CLAVE = "roleran:pedido:v1";
// Desde la v2 el código lo da el sistema; los códigos inventados por el navegador (v1) se descartan.
const VERSION = 2;

const VACIO: Pedido = {
  codigo: "",
  enviado: "",
  renglones: [],
  notaGeneral: "",
  cliente: { nombre: "", empresa: "", rut: "", entrega: "", direccion: "" },
};

let estado: Pedido = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function leer(): Pedido {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return VACIO;
    const p = JSON.parse(crudo) as Partial<Pedido> & { v?: number };
    const delSistema = p.v === VERSION;
    if (!Array.isArray(p.renglones)) return VACIO;
    return {
      codigo: delSistema && typeof p.codigo === "string" ? p.codigo : "",
      enviado: delSistema && typeof p.enviado === "string" ? p.enviado : "",
      renglones: p.renglones.filter((r) => r?.producto?.id && Number(r.cantidad) > 0),
      notaGeneral: typeof p.notaGeneral === "string" ? p.notaGeneral : "",
      cliente: { ...VACIO.cliente, ...(p.cliente ?? {}) },
    };
  } catch {
    return VACIO;
  }
}

function guardar() {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ ...estado, v: VERSION }));
  } catch {
    // almacenamiento bloqueado o lleno: el pedido sigue en memoria
  }
}

function asegurarCarga() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  estado = leer();
  window.addEventListener("storage", (e) => {
    if (e.key === CLAVE) {
      estado = leer();
      oyentes.forEach((o) => o());
    }
  });
}

function actualizar(cambio: (p: Pedido) => Pedido) {
  asegurarCarga();
  estado = cambio(estado);
  guardar();
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  asegurarCarga();
  oyentes.add(o);
  return () => oyentes.delete(o);
}

const leerEstado = () => {
  asegurarCarga();
  return estado;
};
const leerServidor = () => VACIO;

export function usePedido(): Pedido {
  return useSyncExternalStore(suscribir, leerEstado, leerServidor);
}

export function redondear(cantidad: number, paso: number, minimo: number) {
  const n = Math.round(cantidad / paso) * paso;
  return Math.max(minimo, Math.round(n * 100) / 100);
}

export const pedido = {
  agregar(producto: ProductoResumen, cantidad: number) {
    actualizar((p) => {
      const i = p.renglones.findIndex((r) => r.producto.id === producto.id);
      const renglones = [...p.renglones];
      if (i >= 0) {
        renglones[i] = { ...renglones[i], producto, cantidad: redondear(renglones[i].cantidad + cantidad, producto.paso, producto.minimo) };
      } else {
        renglones.push({ producto, cantidad: redondear(cantidad, producto.paso, producto.minimo), nota: "" });
      }
      return { ...p, renglones };
    });
  },
  cambiarCantidad(id: string, cantidad: number) {
    actualizar((p) => ({
      ...p,
      renglones: p.renglones.map((r) =>
        r.producto.id === id ? { ...r, cantidad: redondear(cantidad, r.producto.paso, r.producto.minimo) } : r,
      ),
    }));
  },
  cambiarNota(id: string, nota: string) {
    actualizar((p) => ({ ...p, renglones: p.renglones.map((r) => (r.producto.id === id ? { ...r, nota } : r)) }));
  },
  quitar(id: string) {
    actualizar((p) => ({ ...p, renglones: p.renglones.filter((r) => r.producto.id !== id) }));
  },
  notaGeneral(notaGeneral: string) {
    actualizar((p) => ({ ...p, notaGeneral }));
  },
  cliente(datos: Partial<DatosCliente>) {
    actualizar((p) => ({ ...p, cliente: { ...p.cliente, ...datos } }));
  },
  /** Código nuevo del sistema para lo que hay ahora (todavía sin mandar). */
  codigo(codigo: string) {
    actualizar((p) => ({ ...p, codigo, enviado: "" }));
  },
  /** Se mandó o copió: el código queda atado a este contenido. */
  enviado(huella: string) {
    actualizar((p) => ({ ...p, enviado: huella }));
  },
  vaciar() {
    actualizar(() => VACIO);
  },
};

export function cantidadDe(p: Pedido, id: string): RenglonPedido | undefined {
  return p.renglones.find((r) => r.producto.id === id);
}

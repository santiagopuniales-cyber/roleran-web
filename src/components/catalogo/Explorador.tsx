"use client";
// Catálogo filtrable. Los primeros 48 productos vienen en el HTML (para buscadores); el resto y los filtros
// usan /datos/catalogo.json, que se descarga recién cuando hace falta. Los filtros quedan en la URL.
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { IconoAbajo, IconoCerrar } from "@/components/iconos";
import { TarjetaCliente } from "@/components/TarjetaCliente";
import { claseBoton } from "@/components/ui";
import type { ProductoResumen } from "@/lib/tipos";

export interface ItemCliente extends ProductoResumen {
  sub: string;
  raiz: string;
  rubros: string[];
  orden: number;
}

export interface Faceta {
  clave: "categoria" | "rubro";
  titulo: string;
  opciones: { valor: string; etiqueta: string; cantidad: number }[];
}

type Filtros = Record<Faceta["clave"], string>;
const VACIOS: Filtros = { categoria: "", rubro: "" };
const PAGINA = 48;

function leerUrl(): { filtros: Filtros; orden: string } {
  const p = new URLSearchParams(window.location.search);
  return {
    filtros: { categoria: p.get("categoria") ?? "", rubro: p.get("rubro") ?? "" },
    orden: p.get("orden") === "nombre" ? "nombre" : "relevancia",
  };
}

function cumple(i: ItemCliente, f: Filtros) {
  return (!f.categoria || i.raiz === f.categoria || i.sub === f.categoria) && (!f.rubro || i.rubros.includes(f.rubro));
}

export function Explorador({ inicial, total, facetas }: { inicial: ItemCliente[]; total: number; facetas: Faceta[] }) {
  const [filtros, setFiltros] = useState<Filtros>(VACIOS);
  const [orden, setOrden] = useState("relevancia");
  const [todos, setTodos] = useState<ItemCliente[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);
  const [visibles, setVisibles] = useState(PAGINA);
  const [panel, setPanel] = useState(false);
  const id = useId();

  const cargar = useCallback(async () => {
    if (todos || cargando) return;
    setCargando(true);
    setError(false);
    try {
      const r = await fetch("/datos/catalogo.json");
      if (!r.ok) throw new Error(`catálogo ${r.status}`);
      setTodos(await r.json());
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [todos, cargando]);

  useEffect(() => {
    const aplicar = () => {
      const u = leerUrl();
      setFiltros(u.filtros);
      setOrden(u.orden);
      if (Object.values(u.filtros).some(Boolean) || u.orden !== "relevancia") void cargar();
    };
    aplicar();
    window.addEventListener("popstate", aplicar);
    return () => window.removeEventListener("popstate", aplicar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activos = Object.values(filtros).some(Boolean);
  const cambiar = (f: Filtros, o = orden) => {
    setFiltros(f);
    setOrden(o);
    setVisibles(PAGINA);
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
    if (o !== "relevancia") p.set("orden", o);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    void cargar();
  };

  const lista = useMemo(() => {
    const base = todos ?? inicial;
    const filtrada = base.filter((i) => cumple(i, filtros));
    return orden === "nombre" ? [...filtrada].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { numeric: true })) : filtrada;
  }, [todos, inicial, filtros, orden]);

  const totalFiltrado = todos ? lista.length : activos ? null : total;
  const mostrados = lista.slice(0, visibles);

  // Cantidades por opción con los demás filtros aplicados (cuando ya están todos los datos).
  const cantidadOpcion = (clave: Faceta["clave"], valor: string, base: number) => {
    if (!todos) return base;
    const f = { ...filtros, [clave]: valor };
    return todos.filter((i) => cumple(i, f)).length;
  };

  const selector = "h-11 w-full appearance-none rounded-control border border-borde-fuerte bg-white pl-3 pr-9 text-base outline-none pointer-fine:text-[0.95rem] focus:border-verde focus:ring-2 focus:ring-verde/20";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button type="button" className={claseBoton("secundario")} aria-expanded={panel} aria-controls="filtros" onClick={() => setPanel((v) => !v)}>
          Filtrar y ordenar {activos && <span className="numeros rounded-full bg-verde px-1.5 text-xs text-white">{Object.values(filtros).filter(Boolean).length}</span>}
          <IconoAbajo tamano={18} className={panel ? "rotate-180" : ""} />
        </button>
        <p className="numeros text-sm text-tinta-suave">{totalFiltrado ?? "…"} productos</p>
      </div>

      <div id="filtros" className={`${panel ? "grid" : "hidden"} mt-4 gap-3 rounded-panel border border-borde bg-white p-4 sm:grid-cols-2 lg:mt-0 lg:grid lg:grid-cols-3`}>
        {facetas.map((f) => (
          <div key={f.clave}>
            <label htmlFor={`${id}-${f.clave}`} className="mb-1 block text-sm font-semibold">
              {f.titulo}
            </label>
            <span className="relative block">
              <select id={`${id}-${f.clave}`} className={selector} value={filtros[f.clave]} onChange={(e) => cambiar({ ...filtros, [f.clave]: e.target.value })}>
                <option value="">Todas</option>
                {f.opciones.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.etiqueta} ({cantidadOpcion(f.clave, o.valor, o.cantidad)})
                  </option>
                ))}
              </select>
              <IconoAbajo tamano={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tinta-tenue" />
            </span>
          </div>
        ))}
        <div>
          <label htmlFor={`${id}-orden`} className="mb-1 block text-sm font-semibold">
            Ordenar
          </label>
          <span className="relative block">
            <select id={`${id}-orden`} className={selector} value={orden} onChange={(e) => cambiar(filtros, e.target.value)}>
              <option value="relevancia">Por categoría</option>
              <option value="nombre">Por nombre (A a Z)</option>
            </select>
            <IconoAbajo tamano={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tinta-tenue" />
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="numeros hidden text-tinta-suave lg:block" aria-live="polite">
          {totalFiltrado === null ? "Filtrando…" : `${totalFiltrado} ${totalFiltrado === 1 ? "producto" : "productos"}`}
        </p>
        {activos && (
          <button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-control px-2 font-semibold text-verde hover:bg-verde-claro" onClick={() => cambiar(VACIOS)}>
            <IconoCerrar tamano={18} /> Limpiar filtros
          </button>
        )}
      </div>

      <h2 className="sr-only">Productos</h2>
      {error && (
        <p className="mt-4 rounded-tarjeta border border-alerta/30 bg-alerta-claro px-4 py-3 text-alerta" role="alert">
          No pudimos cargar el catálogo completo. Revisá la conexión y tocá «Ver más productos» para probar de nuevo.
        </p>
      )}
      {mostrados.length === 0 && todos ? (
        <div className="mt-6 flex flex-col items-start gap-4 rounded-tarjeta border border-borde bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-tinta-suave">No hay productos con esos filtros juntos. Sacá alguno o preguntanos por WhatsApp.</p>
          <button type="button" className={claseBoton("secundario")} onClick={() => cambiar(VACIOS)}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {mostrados.map((p) => (
            <li key={p.id}>
              <TarjetaCliente producto={p} />
            </li>
          ))}
        </ul>
      )}

      {(totalFiltrado === null || mostrados.length < (totalFiltrado ?? 0)) && (
        <div className="mt-8 text-center">
          <button
            type="button"
            className={claseBoton("secundario", "grande")}
            disabled={cargando}
            onClick={async () => {
              await cargar();
              setVisibles((v) => v + PAGINA);
            }}
          >
            {cargando ? "Cargando…" : `Ver más productos${totalFiltrado ? ` (${totalFiltrado - mostrados.length})` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}

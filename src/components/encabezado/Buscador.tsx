"use client";
// Buscador con resultados al instante. El índice se descarga recién cuando el usuario enfoca el campo.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconoBuscar, IconoChat, IconoCerrar } from "@/components/iconos";
import { Placeholder } from "@/components/Placeholder";
import { evento } from "@/lib/analytics";
import { buscar, cargarIndice, type Datos } from "@/lib/busqueda/cliente";
import { SALUDO, urlWhatsApp } from "@/lib/pedido/whatsapp";

const MAX = 7;

export function Buscador({ grande = false, autoFoco = false }: { grande?: boolean; autoFoco?: boolean }) {
  const router = useRouter();
  const id = useId();
  const listaId = `${id}-lista`;
  const [consulta, setConsulta] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const [estado, setEstado] = useState<"inicial" | "cargando" | "listo" | "error">("inicial");
  const [datos, setDatos] = useState<Datos | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  const preparar = () => {
    if (estado === "inicial") {
      setEstado("cargando");
      cargarIndice()
        .then((d) => {
          setDatos(d);
          setEstado("listo");
        })
        .catch(() => setEstado("error"));
    }
  };

  const encontrados = useMemo(() => {
    const q = consulta.trim();
    return datos && q ? buscar(datos, q, 60) : [];
  }, [datos, consulta]);
  const resultados = encontrados.slice(0, MAX);
  const total = encontrados.length;

  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  const irABuscar = () => {
    // Se lee del campo: si alguien escribió antes de que cargara el JavaScript, el estado todavía está vacío.
    const q = (campo.current?.value ?? consulta).trim();
    if (!q) return;
    evento("search", { search_term: q });
    setAbierto(false);
    router.push(`/buscar/?q=${encodeURIComponent(q)}`);
  };

  const mostrarPanel = abierto && consulta.trim().length > 0;
  const opcionId = (i: number) => `${id}-op-${i}`;

  return (
    <div ref={contenedor} className="relative w-full">
      <form
        role="search"
        action="/buscar/"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();
          if (activo >= 0 && resultados[activo]) {
            setAbierto(false);
            router.push(`/productos/${resultados[activo].slug}/`);
          } else irABuscar();
        }}
      >
        <label htmlFor={`${id}-campo`} className="sr-only">
          Buscar productos
        </label>
        <div
          className={`flex items-center rounded-control border-2 bg-white transition-colors focus-within:border-verde focus-within:shadow-[0_0_0_3px_rgb(19_155_12/0.3)] ${
            grande ? "h-14 border-verde/80 shadow-[0_6px_20px_-12px_rgb(12_106_8/0.6)]" : "h-12 border-borde-fuerte"
          }`}
        >
          <IconoBuscar className="ml-3.5 shrink-0 text-tinta-tenue" tamano={grande ? 22 : 20} />
          <input
            ref={campo}
            id={`${id}-campo`}
            name="q"
            type="search"
            autoComplete="off"
            autoFocus={autoFoco}
            enterKeyHint="search"
            spellCheck={false}
            placeholder={grande ? "Ej.: vaso 550, bandeja o un código" : "Buscar productos o código"}
            className={`min-w-0 flex-1 self-stretch bg-transparent px-3 outline-none placeholder:text-tinta-tenue ${grande ? "text-[1.05rem]" : "text-base"}`}
            role="combobox"
            aria-expanded={mostrarPanel}
            aria-controls={listaId}
            aria-autocomplete="list"
            aria-activedescendant={activo >= 0 ? opcionId(activo) : undefined}
            value={consulta}
            onFocus={() => {
              preparar();
              setAbierto(true);
            }}
            onChange={(e) => {
              preparar();
              setConsulta(e.target.value);
              setActivo(-1);
              setAbierto(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setAbierto(true);
                setActivo((a) => Math.min(a + 1, resultados.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActivo((a) => Math.max(a - 1, -1));
              } else if (e.key === "Escape") {
                setAbierto(false);
                setActivo(-1);
              }
            }}
          />
          {consulta && (
            <button
              type="button"
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-tinta-tenue hover:bg-lienzo"
              onClick={() => {
                setConsulta("");
                campo.current?.focus();
              }}
              aria-label="Borrar búsqueda"
            >
              <IconoCerrar tamano={18} />
            </button>
          )}
          <button
            type="submit"
            className={`mr-1.5 hidden items-center rounded-[6px] bg-verde px-4 font-semibold text-white hover:bg-verde-oscuro ${grande ? "h-10 sm:flex" : "h-9 lg:flex"}`}
          >
            Buscar
          </button>
        </div>
      </form>

      <div
        id={listaId}
        role="listbox"
        aria-label="Resultados de la búsqueda"
        hidden={!mostrarPanel}
        className="aparece absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-panel border border-borde bg-white shadow-flotante"
      >
        {estado === "cargando" && <p className="px-4 py-3 text-sm text-tinta-suave">Cargando el catálogo…</p>}
        {estado === "error" && (
          <p className="px-4 py-3 text-sm text-tinta-suave">No pudimos cargar el buscador. Probá de nuevo o escribinos por WhatsApp.</p>
        )}
        {estado === "listo" && resultados.length === 0 && (
          <div className="px-4 py-4">
            <p className="font-semibold">No encontramos «{consulta.trim()}».</p>
            <p className="mt-1 text-sm text-tinta-suave">Probá con otra palabra o con el código. Si no está en la web, preguntanos: muchas veces lo conseguimos.</p>
            <a
              href={urlWhatsApp(`${SALUDO} ¿Tienen ${consulta.trim()}?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-verde hover:underline"
            >
              <IconoChat tamano={18} /> Preguntar por WhatsApp
            </a>
          </div>
        )}
        {resultados.length > 0 && (
          <>
            <ul>
              {resultados.map((r, i) => (
                <li key={r.id} id={opcionId(i)} role="option" aria-selected={i === activo}>
                  <Link
                    href={`/productos/${r.slug}/`}
                    onClick={() => setAbierto(false)}
                    className={`flex items-center gap-3 px-3 py-2 ${i === activo ? "bg-verde-claro" : "hover:bg-lienzo"}`}
                    tabIndex={-1}
                  >
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-[6px] border border-borde bg-white">
                      {r.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${r.imagen}.webp`} alt="" width={44} height={44} className="h-full w-full object-contain" />
                      ) : (
                        <Placeholder tipo={r.placeholder} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.nombre}</span>
                      <span className="block truncate text-xs text-tinta-tenue">
                        {`${r.presentacion} · ${r.categoriaNombre}`}
                        {r.sku ? ` · ${r.sku}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={irABuscar}
              className="flex w-full items-center justify-between border-t border-borde bg-lienzo px-4 py-3 text-left font-semibold text-verde hover:bg-verde-claro"
            >
              <span>
                Ver {total > MAX ? `los ${total}` : "todos los"} resultados de «{consulta.trim()}»
              </span>
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {mostrarPanel && estado === "listo" ? (total ? `${total} resultados` : "Sin resultados") : ""}
      </p>
    </div>
  );
}

"use client";
// Página completa de resultados (/buscar/?q=…). Lee la consulta de la URL y busca en el índice local.
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EstadoVacio } from "@/components/EstadoVacio";
import { IconoBuscar } from "@/components/iconos";
import { TarjetaCliente } from "@/components/TarjetaCliente";
import { claseBoton } from "@/components/ui";
import { evento } from "@/lib/analytics";
import { buscar, cargarIndice, type Resultado } from "@/lib/busqueda/cliente";

const SUGERENCIAS = ["bandeja espumaplast", "vaso 550", "bolsa camiseta", "caja pizza", "film", "papel aluminio", "pirotines", "servilletas"];

export function ResultadosBusqueda() {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get("q") ?? "").trim();
  const [texto, setTexto] = useState(q);
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [error, setError] = useState(false);
  const [mostrar, setMostrar] = useState(48);

  // Al cambiar la consulta en la URL se reinicia el estado (durante el render, sin efecto en cascada).
  const [previa, setPrevia] = useState(q);
  if (previa !== q) {
    setPrevia(q);
    setTexto(q);
    setMostrar(48);
    setResultados(null);
    setError(false);
  }

  useEffect(() => {
    if (!q) return;
    let vigente = true;
    cargarIndice()
      .then((d) => {
        if (!vigente) return;
        setResultados(buscar(d, q, 500));
        evento("search", { search_term: q });
      })
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, [q]);

  return (
    <div className="mt-4">
      <h1 className="text-[1.85rem] md:text-[2.4rem]">{q ? <>Resultados para «{q}»</> : "Buscar productos"}</h1>
      <form
        className="mt-4 flex max-w-2xl gap-2"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const v = texto.trim();
          if (v) router.push(`/buscar/?q=${encodeURIComponent(v)}`);
        }}
      >
        <label htmlFor="consulta-pagina" className="sr-only">
          Buscar productos
        </label>
        <input
          id="consulta-pagina"
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Nombre, medida o código"
          className="h-12 min-w-0 flex-1 rounded-control border-2 border-borde-fuerte bg-white px-3.5 outline-none focus:border-verde"
        />
        <button type="submit" className={claseBoton("primario", "normal", "h-12")}>
          <IconoBuscar tamano={20} /> Buscar
        </button>
      </form>

      <div className="mt-8 min-h-[70vh]" aria-live="polite">
        {error && <p className="text-tinta-suave">No pudimos cargar el buscador. Probá recargar la página o escribinos por WhatsApp.</p>}
        {!error && q && resultados === null && <p className="text-tinta-suave">Buscando…</p>}
        {!error && resultados && q && resultados.length === 0 && (
          <EstadoVacio
            dibujo="lupa"
            titulo={`No encontramos «${q}»`}
            texto={
              <>
                <p>Probá con otra palabra, una medida o el código del producto. También podés preguntarnos: te respondemos por WhatsApp.</p>
                <p className="mt-3 text-sm">Búsquedas que suelen servir:</p>
                <ul className="mt-2 flex flex-wrap justify-center gap-2">
                  {SUGERENCIAS.map((s) => (
                    <li key={s}>
                      <Link href={`/buscar/?q=${encodeURIComponent(s)}`} className="inline-flex h-10 items-center rounded-full border border-borde-fuerte bg-white px-3.5 text-sm hover:border-verde hover:text-verde">
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            }
          >
            <BotonWhatsApp mensaje={`¿Tienen ${q}?`}>Preguntar por WhatsApp</BotonWhatsApp>
            <Link href="/productos/" className={claseBoton("secundario")}>
              Ver todos los productos
            </Link>
          </EstadoVacio>
        )}
        {!error && resultados && resultados.length > 0 && (
          <>
            <h2 className="mb-4 font-sans text-base font-normal tracking-normal text-tinta-suave [font-stretch:100%]">
              {resultados.length} {resultados.length === 1 ? "producto encontrado" : "productos encontrados"}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {resultados.slice(0, mostrar).map((r, i) => (
                <li key={r.id}>
                  <TarjetaCliente producto={r} detalle={r.categoriaNombre} prioridad={i < 4} />
                </li>
              ))}
            </ul>
            {resultados.length > mostrar && (
              <div className="mt-6 text-center">
                <button type="button" className={claseBoton("secundario")} onClick={() => setMostrar((m) => m + 48)}>
                  Ver más resultados ({resultados.length - mostrar})
                </button>
              </div>
            )}
          </>
        )}
        {!q && (
          <ul className="flex flex-wrap gap-2">
            {SUGERENCIAS.map((s) => (
              <li key={s}>
                <Link href={`/buscar/?q=${encodeURIComponent(s)}`} className="inline-flex h-10 items-center rounded-full border border-borde-fuerte bg-white px-3.5 text-sm hover:border-verde hover:text-verde">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

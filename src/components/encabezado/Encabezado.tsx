// Encabezado: datos de contacto arriba, logo + buscador + «Cotización», y categorías.
import Link from "next/link";
import { SITIO } from "@/config/sitio";
import { categoriasRaiz } from "@/lib/catalogo";
import { urlWhatsApp } from "@/lib/pedido/whatsapp";
import { IconoAbajo, IconoChat, IconoInicio, IconoMenu, IconoReloj, IconoUbicacion } from "../iconos";
import { Logo } from "../Logo";
import { BotonPedido } from "./BotonPedido";
import { Buscador } from "./Buscador";
import { Desplegable } from "./Desplegable";

/** Nombres cortos para la barra de categorías. */
export const NOMBRE_CORTO: Record<string, string> = {
  bandejas: "Bandejas",
  "envases-pp-y-pet": "Envases PP y PET",
  "potes-y-frascos": "Potes y frascos",
  "vasos-y-copas": "Vasos",
  "cajas-de-carton": "Cajas de cartón",
  bolsas: "Bolsas",
  "cubiertos-platos-y-sorbitos": "Cubiertos y sorbitos",
  "servilletas-y-papel-higienico": "Servilletas",
  "film-aluminio-y-papel-de-cocina": "Film y aluminio",
  "papel-para-envolver": "Papel para envolver",
  "reposteria-y-cumpleanos": "Repostería",
  "cocina-y-gastronomia": "Cocina",
  "limpieza-e-higiene": "Limpieza",
  "oficina-y-comercio": "Oficina y comercio",
  embalaje: "Embalaje",
  hogar: "Hogar",
};
const EN_BARRA = 8;

export function Encabezado() {
  const cats = categoriasRaiz();
  return (
    <header className="no-imprimir">
      <div className="bg-noche text-[0.82rem] text-noche-texto">
        <div className="contenedor flex h-9 items-center justify-between gap-4">
          <p className="flex min-w-0 items-center gap-4">
            <a href={SITIO.mapaUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 hover:text-white md:flex">
              <IconoUbicacion tamano={15} /> {SITIO.direccion.calle}, {SITIO.direccion.ciudad}
            </a>
            <span className="flex items-center gap-1.5 truncate">
              <IconoReloj tamano={15} /> {SITIO.horario.corto}
            </span>
          </p>
          <a
            href={urlWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="-mr-2 flex h-9 shrink-0 items-center gap-1.5 px-2 font-semibold text-white hover:text-noche-acento"
          >
            <IconoChat tamano={16} /> <span className="hidden xs:inline">WhatsApp</span> {SITIO.whatsapp.mostrar}
          </a>
        </div>
      </div>

      <div className="sticky top-0 z-40 border-b border-borde bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 [@media(max-height:500px)]:static">
        <div className="contenedor flex flex-wrap items-center gap-x-3 gap-y-2.5 py-2.5 md:flex-nowrap md:gap-x-6 md:py-3">
          <Desplegable className="group relative md:hidden">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-control border border-borde-fuerte text-tinta hover:border-verde [&::-webkit-details-marker]:hidden">
              <IconoMenu tamano={22} />
              <span className="sr-only">Categorías</span>
            </summary>
            <nav aria-label="Categorías" className="absolute left-0 top-14 z-50 max-h-[calc(100dvh-7.5rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-panel border border-borde bg-white p-2 shadow-flotante">
              <Link href="/" className="mb-1 flex items-center gap-2 rounded-[6px] border-b border-borde px-3 py-2.5 font-semibold hover:bg-verde-claro hover:text-verde">
                <IconoInicio tamano={18} /> Inicio
              </Link>
              <ul>
                {cats.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/categorias/${c.slug}/`} className="flex justify-between rounded-[6px] px-3 py-2.5 hover:bg-verde-claro">
                      {c.nombre} <span className="numeros text-sm text-tinta-tenue">{c.cantidad}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-1 border-t border-borde pt-1">
                <Link href="/productos/" className="block rounded-[6px] px-3 py-2.5 font-semibold text-verde hover:bg-verde-claro">
                  Ver todos los productos
                </Link>
                <Link href="/contacto/" className="block rounded-[6px] px-3 py-2.5 hover:bg-verde-claro">
                  Contacto y horario
                </Link>
              </div>
            </nav>
          </Desplegable>
          <Link href="/" className="mr-auto shrink-0 md:mr-0" aria-label={`${SITIO.nombre}, ir al inicio`}>
            <Logo />
          </Link>
          <div className="order-last w-full md:order-none md:flex-1">
            <Buscador />
          </div>
          <BotonPedido />
        </div>
      </div>

      {/* Franja de categorías en el verde de la marca, como WebstaurantStore y Uline (D-31). */}
      <nav aria-label="Categorías principales" className="hidden bg-verde text-white md:block">
        <div className="contenedor flex h-12 items-center gap-1 text-[0.95rem]">
          <Link href="/" className="-ml-2.5 flex items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 font-semibold hover:bg-verde-oscuro focus-visible:outline-white">
            <IconoInicio tamano={18} /> Inicio
          </Link>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/30" />
          {cats.slice(0, EN_BARRA).map((c, i) => (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}/`}
              // Entran 4 en tablet, 6 en notebook chica y 8 desde 1280 px; el resto está en «Todas las categorías».
              className={`${i >= 6 ? "hidden xl:block" : i >= 4 ? "hidden lg:block" : ""} whitespace-nowrap rounded-[6px] px-2.5 py-1.5 font-medium hover:bg-verde-oscuro focus-visible:outline-white`}
            >
              {NOMBRE_CORTO[c.slug] ?? c.nombre}
            </Link>
          ))}
          <Desplegable className="group relative ml-auto">
            <summary className="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 font-semibold hover:bg-verde-oscuro focus-visible:outline-white [&::-webkit-details-marker]:hidden">
              Todas las categorías <IconoAbajo tamano={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-11 z-50 grid w-[min(38rem,calc(100vw-2rem))] grid-cols-2 gap-x-2 rounded-panel border border-borde bg-white p-3 text-tinta shadow-flotante">
              {cats.map((c) => (
                <Link key={c.slug} href={`/categorias/${c.slug}/`} className="flex justify-between rounded-[6px] px-3 py-2 hover:bg-verde-claro">
                  {c.nombre} <span className="numeros text-sm text-tinta-tenue">{c.cantidad}</span>
                </Link>
              ))}
              <Link href="/productos/" className="col-span-2 mt-1 rounded-[6px] border-t border-borde px-3 pt-3 pb-1 font-semibold text-verde hover:underline">
                Ver todos los productos →
              </Link>
            </div>
          </Desplegable>
        </div>
      </nav>
    </header>
  );
}

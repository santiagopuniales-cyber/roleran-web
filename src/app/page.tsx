import type { Metadata } from "next";
import Link from "next/link";
import { BloqueUbicacion, ComoPedir, FranjaConfianza, GrillaCategorias } from "@/components/bloques";
import { Buscador } from "@/components/encabezado/Buscador";
import { ImagenProducto } from "@/components/ImagenProducto";
import { JsonLd } from "@/components/JsonLd";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { IconoPedido } from "@/components/iconos";
import { claseBoton, TituloSeccion } from "@/components/ui";
import { SITIO } from "@/config/sitio";
import { obtenerProductoPorId, obtenerRubros, productosDestacados, totalProductos } from "@/lib/catalogo";
import { canonica, compartir, datosNegocio } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: canonica("/") },
  openGraph: compartir("/", `${SITIO.nombre} | Envases descartables en Montevideo`),
};

const BUSQUEDAS_FRECUENTES = [
  { texto: "Bandejas de espumaplast", href: "/categorias/bandejas-de-espumaplast/" },
  { texto: "Cajas para pizza", href: "/categorias/cajas-para-pizza/" },
  { texto: "Vasos", href: "/categorias/vasos-y-copas/" },
  { texto: "Bolsas camiseta", href: "/categorias/bolsas-camiseta/" },
  { texto: "Bandejas de aluminio", href: "/categorias/bandejas-de-aluminio/" },
  { texto: "Film y aluminio", href: "/categorias/film-aluminio-y-papel-de-cocina/" },
];

/** Fotos del mosaico de la portada: productos reales con foto de fabricante. */
const MOSAICO = ["110ehmx200", "bpp145", "v16ozc-tx1000", "pizmar33", "d6", "bespnegra21"];

export default function Inicio() {
  const destacados = productosDestacados(8);
  const rubros = obtenerRubros();
  const mosaico = MOSAICO.map((id) => obtenerProductoPorId(id)).filter((p) => p && p.imagenes.length);

  return (
    <>
      <JsonLd datos={datosNegocio()} />
      <section className="border-b border-borde">
        <div className="contenedor grid items-center gap-8 py-8 md:py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-14">
          <div>
            <h1 className="text-[2rem] leading-[1.1] sm:text-[2.5rem] lg:text-[2.9rem]">
              Casi todo en descartables, para tu negocio y para tu casa
            </h1>
            <p className="mt-4 max-w-xl text-lg text-tinta-suave">
              Distribuidora en {SITIO.direccion.ciudad}: bandejas, vasos, bolsas, cajas, potes, film y artículos de limpieza. Buscá lo que
              necesitás, sumalo a tu cotización y mandala con un toque: te pasamos precio y disponibilidad.
            </p>
            <div className="mt-6 hidden max-w-xl md:block">
              <Buscador grande />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Búsquedas frecuentes">
              {BUSQUEDAS_FRECUENTES.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="inline-flex h-9 items-center rounded-full border border-borde-fuerte bg-white px-3.5 text-sm font-medium hover:border-verde hover:bg-verde-claro hover:text-verde">
                    {b.texto}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              {/* El llamado principal es armar la cotización en la web (pedido de Roleran, 31/10): un botón de
                  WhatsApp acá llevaba al chat sin lista y el pedido llegaba suelto. WhatsApp queda para dudas. */}
              <Link href="/productos/" className={claseBoton("primario", "grande")}>
                <IconoPedido tamano={22} /> Armar mi cotización
              </Link>
              <Link href="/productos/" className="-my-2.5 inline-block py-2.5 font-semibold text-verde underline-offset-4 hover:underline">
                Ver los {totalProductos()} productos →
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute -inset-3 rounded-[1.75rem] bg-kraft-claro" />
            <div className="relative grid grid-cols-3 gap-3 p-3">
              {mosaico.map((p, i) => (
                <div key={p!.id} className={`overflow-hidden rounded-tarjeta border border-kraft/60 bg-white ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                  <ImagenProducto imagen={p!.imagenes[0]} placeholder="caja" alt="" sizes={i === 0 ? "360px" : "170px"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FranjaConfianza />

      <section aria-labelledby="categorias" className="contenedor mt-12">
        <TituloSeccion id="categorias" titulo="Categorías" bajada="Todo ordenado por tipo de producto." enlace={{ href: "/productos/", texto: "Ver todos los productos" }} />
        <GrillaCategorias />
      </section>

      <div className="mt-14">
        <ComoPedir />
      </div>

      <section aria-labelledby="rubros" className="contenedor mt-14">
        <TituloSeccion id="rubros" titulo="Comprás para tu negocio" bajada="Elegí tu rubro: los productos que usa, juntos en una página." />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rubros.map((r, i) => (
            <li key={r.slug} className={i === 0 ? "lg:col-span-2" : ""}>
              <Link
                href={`/rubros/${r.slug}/`}
                className="group flex h-full flex-col justify-between gap-4 rounded-tarjeta border border-borde bg-white p-5 transition-colors hover:border-verde"
              >
                <span>
                  <span className="titulo block text-xl group-hover:text-verde">{r.nombre}</span>
                  <span className="mt-1.5 line-clamp-2 block text-sm text-tinta-suave sm:line-clamp-3">{r.intro}</span>
                </span>
                <span className="text-sm font-semibold text-verde">
                  {r.cantidad} productos <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="destacados" className="contenedor mt-14">
        <TituloSeccion id="destacados" titulo="Del catálogo" bajada="Una muestra de lo que tenemos, de varios rubros." enlace={{ href: "/productos/", texto: "Ver todo el catálogo" }} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {destacados.map((p) => (
            <li key={p.id}>
              <TarjetaProducto producto={p} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14">
        <BloqueUbicacion />
      </div>
    </>
  );
}

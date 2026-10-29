// Bloques reutilizables de contenido: franja de confianza, cómo pedir, ubicación, categorías.
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import Link from "next/link";
import { BANDERAS, SITIO, ZONA_ENVIO_GRATIS } from "@/config/sitio";
import { categoriasRaiz, imagenDeCategoria } from "@/lib/catalogo";
import type { Categoria } from "@/lib/tipos";
import { IconoCamion, IconoChat, IconoFactura, IconoReloj, IconoTelefono, IconoTienda, IconoUbicacion } from "./iconos";
import { ImagenProducto } from "./ImagenProducto";
import { MapaInteractivo } from "./MapaInteractivo";
import { claseBoton } from "./ui";

export function FranjaConfianza() {
  const items = [
    BANDERAS.MOSTRAR_ENVIOS_SIN_COSTO && {
      icono: <IconoCamion tamano={26} />,
      titulo: "Envío gratis",
      texto: `En ${ZONA_ENVIO_GRATIS}, con nuestro cadete.`,
    },
    BANDERAS.MOSTRAR_FACTURA_RUT && { icono: <IconoFactura tamano={26} />, titulo: "Facturamos con RUT", texto: "e-Factura para tu empresa." },
    { icono: <IconoChat tamano={26} />, titulo: "Pedidos por WhatsApp", texto: `Escribinos al ${SITIO.whatsapp.mostrar}.` },
    { icono: <IconoTienda tamano={26} />, titulo: `Local en ${SITIO.direccion.calle}`, texto: SITIO.horario.texto + "." },
  ].filter(Boolean) as { icono: React.ReactNode; titulo: string; texto: string }[];
  return (
    <section aria-label={`Por qué comprar en ${SITIO.nombre}`} className="border-y border-borde bg-white">
      <ul className="contenedor grid grid-cols-2 gap-x-4 lg:grid-cols-4 lg:divide-x lg:divide-borde">
        {items.map((it) => (
          <li key={it.titulo} className="flex items-center gap-2.5 py-3 sm:items-start sm:gap-3 sm:py-5 lg:px-4 lg:first:pl-0">
            <span className="shrink-0 text-verde sm:mt-0.5 [&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-7 sm:[&_svg]:w-7">{it.icono}</span>
            <span>
              <strong className="block text-[0.92rem] leading-tight sm:text-base">{it.titulo}</strong>
              <span className="hidden text-sm leading-snug text-tinta-suave sm:block">{it.texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ComoPedir({ conTitulo = true }: { conTitulo?: boolean }) {
  // Textos cortos y sin botón propio (pedido de Roleran, 28/10): «Ver todos los productos» queda justo arriba y
  // WhatsApp ya está en el resto de la página. La dirección está en «Dónde estamos» y en Nosotros.
  const pasos = [
    { titulo: "Armá tu lista", texto: "Agregá productos y tocá «Pedir cotización»." },
    { titulo: "Te pasamos el precio", texto: "Por WhatsApp, según la cantidad que lleves." },
    {
      titulo: "Retirás o te lo llevamos",
      texto: BANDERAS.MOSTRAR_ENVIOS_SIN_COSTO
        ? `Lo retirás armado en el local o te lo enviamos gratis en ${ZONA_ENVIO_GRATIS}.`
        : "Lo retirás armado en el local o te lo enviamos.",
    },
  ];
  return (
    <section aria-labelledby="como-pedir" className="contenedor">
      {conTitulo && (
        <h2 id="como-pedir" className="mb-6 text-[1.6rem] md:text-[1.9rem]">
          Cómo pedir
        </h2>
      )}
      <ol className="grid gap-3 md:grid-cols-3">
        {pasos.map((p, i) => (
          <li key={p.titulo} className="relative rounded-tarjeta border border-borde bg-white p-5 pl-16">
            <span className="titulo absolute left-5 top-4 text-[2.4rem] leading-none text-marca" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="text-xl">{p.titulo}</h3>
            <p className="mt-1.5 text-tinta-suave">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TarjetaCategoria({ categoria, nombre }: { categoria: Categoria; nombre?: string }) {
  const img = imagenDeCategoria(categoria.slug);
  return (
    <Link
      href={`/categorias/${categoria.slug}/`}
      className="group flex h-full items-center overflow-hidden rounded-tarjeta border border-borde bg-white transition-shadow hover:shadow-tarjeta-hover sm:flex-col sm:items-stretch"
    >
      <ImagenProducto imagen={img} placeholder={categoria.placeholder} alt="" sizes="(min-width: 64rem) 220px, (min-width: 40rem) 30vw, 64px" className="w-16 shrink-0 border-r border-borde/70 sm:w-auto sm:border-r-0 sm:border-b" />
      <span className="flex min-w-0 flex-1 flex-col items-start justify-between gap-1 px-2.5 py-2 sm:flex-row sm:gap-2 sm:p-3">
        <span className="hyphens-auto text-[0.9rem] font-semibold leading-snug break-words group-hover:text-verde sm:text-base">{nombre ?? categoria.nombre}</span>
        <span className="numeros shrink-0 rounded-chip bg-lienzo px-1.5 text-xs text-tinta-tenue sm:mt-0.5">{categoria.cantidad}</span>
      </span>
    </Link>
  );
}

export function GrillaCategorias({ categorias = categoriasRaiz() }: { categorias?: Categoria[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
      {categorias.map((c) => (
        <li key={c.slug}>
          <TarjetaCategoria categoria={c} />
        </li>
      ))}
    </ul>
  );
}

export function BloqueUbicacion() {
  return (
    <section aria-labelledby="donde-estamos" className="contenedor">
      <div className="grid overflow-hidden rounded-panel border border-borde bg-white md:grid-cols-[1.1fr_1fr]">
        <div className="p-6 md:p-8">
          <h2 id="donde-estamos" className="text-[1.6rem] md:text-[1.9rem]">
            Dónde estamos
          </h2>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-3">
              <IconoUbicacion tamano={22} className="mt-0.5 shrink-0 text-verde" />
              <span>
                <strong className="block">{SITIO.direccion.calle}</strong>
                <span className="text-tinta-suave">
                  {SITIO.direccion.codigoPostal} {SITIO.direccion.ciudad}, {SITIO.direccion.paisNombre}
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <IconoReloj tamano={22} className="mt-0.5 shrink-0 text-verde" />
              <span>
                <strong className="block">{SITIO.horario.texto}</strong>
                <span className="text-tinta-suave">Atención en el mostrador y por WhatsApp.</span>
              </span>
            </li>
            <li className="flex gap-3">
              <IconoTelefono tamano={22} className="mt-0.5 shrink-0 text-verde" />
              <span className="flex flex-wrap gap-x-4">
                {SITIO.telefonos.map((t) => (
                  <a key={t.enlace} href={t.enlace} className="-my-2.5 inline-flex min-h-11 items-center font-semibold hover:text-verde hover:underline md:my-0 md:min-h-0">
                    {t.mostrar}
                  </a>
                ))}
              </span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITIO.mapaUrl} target="_blank" rel="noopener noreferrer" className={claseBoton("primario")}>
              <IconoUbicacion tamano={20} /> Cómo llegar
            </a>
            <BotonWhatsApp variante="secundario">WhatsApp {SITIO.whatsapp.mostrar}</BotonWhatsApp>
          </div>
        </div>
        <div className="p-4 pt-0 md:p-6 md:pl-0">
          <MapaInteractivo />
        </div>
      </div>
    </section>
  );
}

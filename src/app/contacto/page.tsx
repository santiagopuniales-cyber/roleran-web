import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import type { Metadata } from "next";
import { MapaInteractivo } from "@/components/MapaInteractivo";
import { IconoChat, IconoReloj, IconoTelefono, IconoUbicacion } from "@/components/iconos";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { claseBoton } from "@/components/ui";
import { SITIO } from "@/config/sitio";
import { canonica, compartir, datosNegocio } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contacto y cómo llegar",
  description: `${SITIO.direccion.calle}, Montevideo. ${SITIO.horario.texto}. WhatsApp ${SITIO.whatsapp.mostrar}, teléfonos ${SITIO.telefonos.map((t) => t.mostrar).join(" y ")}.`,
  alternates: { canonical: canonica("/contacto/") },
  openGraph: compartir("/contacto/", `Contacto y cómo llegar | ${SITIO.nombre}`),
};

export default function Contacto() {
  return (
    <div className="contenedor pt-5">
      <JsonLd datos={datosNegocio()} />
      <Migas items={[{ nombre: "Contacto" }]} />
      <h1 className="mt-4 text-[1.85rem] md:text-[2.4rem]">Contacto</h1>
      <p className="mt-3 max-w-2xl text-lg text-tinta-suave">
        {SITIO.nombre}, {SITIO.direccion.calle}. La forma más rápida es WhatsApp: mandanos tu pedido o tu consulta y te respondemos.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-panel border border-verde/40 bg-verde-claro p-6" aria-labelledby="c-whatsapp">
          <IconoChat tamano={28} className="text-verde" />
          <h2 id="c-whatsapp" className="mt-3 text-2xl">
            WhatsApp
          </h2>
          <p className="numeros mt-1 text-xl font-semibold">{SITIO.whatsapp.mostrar}</p>
          <p className="mt-1 text-tinta-suave">Pedidos, precios y disponibilidad.</p>
          <BotonWhatsApp className="mt-4">Escribir por WhatsApp</BotonWhatsApp>
        </section>

        <section className="rounded-panel border border-borde bg-white p-6" aria-labelledby="c-telefonos">
          <IconoTelefono tamano={28} className="text-verde" />
          <h2 id="c-telefonos" className="mt-3 text-2xl">
            Teléfonos
          </h2>
          <ul className="mt-2 space-y-1.5">
            {SITIO.telefonos.map((t) => (
              <li key={t.enlace}>
                <a href={t.enlace} className="numeros inline-block py-1.5 text-xl font-semibold hover:text-verde hover:underline">
                  {t.mostrar}
                </a>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-sans text-sm font-semibold tracking-normal text-tinta-suave [font-stretch:100%]">Correo</h3>
          <ul className="mt-1 space-y-1">
            {SITIO.emails.map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`} className="inline-block break-all py-1 font-semibold text-verde underline underline-offset-4">
                  {e}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-panel border border-borde bg-white p-6 md:col-span-2 lg:col-span-1" aria-labelledby="c-local">
          <IconoUbicacion tamano={28} className="text-verde" />
          <h2 id="c-local" className="mt-3 text-2xl">
            Local
          </h2>
          <address className="mt-1 not-italic">
            <span className="block text-xl font-semibold">{SITIO.direccion.calle}</span>
            <span className="text-tinta-suave">
              {SITIO.direccion.codigoPostal} {SITIO.direccion.ciudad}, {SITIO.direccion.paisNombre}
            </span>
          </address>
          <p className="mt-3 flex items-center gap-2 font-semibold">
            <IconoReloj tamano={20} className="text-verde" /> {SITIO.horario.texto}
          </p>
          <a href={SITIO.mapaUrl} target="_blank" rel="noopener noreferrer" className={claseBoton("secundario", "normal", "mt-4")}>
            <IconoUbicacion tamano={20} /> Cómo llegar
          </a>
        </section>
      </div>

      <p className="mt-6 rounded-tarjeta border border-dashed border-kraft bg-kraft-claro/60 px-4 py-3 text-kraft-tinta">
        <strong>¿Venís a buscar un pedido?</strong> Mandalo antes por WhatsApp y lo retirás armado, sin esperar.
      </p>

      <section className="mt-10" aria-labelledby="c-mapa">
        <h2 id="c-mapa" className="text-2xl">
          Mapa
        </h2>
        <div className="mt-3">
          <MapaInteractivo />
        </div>
        <a href={SITIO.opinionesUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block py-2.5 font-semibold text-verde hover:underline">
          Ver opiniones en Google →
        </a>
      </section>
    </div>
  );
}

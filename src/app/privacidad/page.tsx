import type { Metadata } from "next";
import { Migas } from "@/components/Migas";
import { SITIO } from "@/config/sitio";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacidad",
  description: `Qué datos maneja la web de ${SITIO.nombre} y cómo, conforme a la Ley 18.331 de Protección de Datos Personales de Uruguay.`,
  alternates: { canonical: canonica("/privacidad/") },
  openGraph: compartir("/privacidad/", `Privacidad | ${SITIO.nombre}`),
};

export default function Privacidad() {
  const conAnalytics = Boolean(SITIO.analyticsId);
  return (
    <div className="contenedor pt-5">
      <Migas items={[{ nombre: "Privacidad" }]} />
      <div className="prosa mt-4 max-w-3xl">
        <h1 className="mb-2 text-[1.85rem] text-tinta md:text-[2.4rem]">Privacidad</h1>
        <p className="text-sm">Última actualización: octubre de 2026.</p>

        <p>
          Así cuida {SITIO.razonSocial} ({SITIO.direccion.calle}, {SITIO.direccion.ciudad}) los datos personales de esta web, según la Ley
          N.º 18.331 de Protección de Datos Personales.
        </p>

        <h2>Qué datos usamos y para qué</h2>
        <p>
          Cuando pedís una cotización, la lista de productos y los datos que completes (nombre, empresa, RUT, retiro o envío y dirección) quedan
          guardados en nuestro sistema para prepararte la cotización, el pedido, la factura y la entrega. Lo que nos mandes por WhatsApp lo usamos
          para lo mismo. No vendemos ni compartimos esos datos.
        </p>
        <p>Si una cotización no se convierte en pedido, se borra a los 90 días.</p>

        <h2>Medición de visitas</h2>
        <p>
          Contamos las visitas con Cloudflare Web Analytics para saber cuántas personas entran y qué páginas miran, siempre en forma agregada.
          No usa cookies ni guarda datos para identificarte.
        </p>
        {conAnalytics && (
          <p>
            También usamos Google Analytics, que puede guardar cookies en tu navegador para lo mismo. No usamos esa información para
            identificarte ni la vendemos.
          </p>
        )}

        <h2>Tus derechos</h2>
        <p>
          Podés pedir acceder a tus datos, corregirlos, actualizarlos o eliminarlos escribiendo a{" "}
          <a href={`mailto:${SITIO.email}`}>{SITIO.email}</a> o por WhatsApp al {SITIO.whatsapp.mostrar}.
        </p>

        <h2>Contacto</h2>
        <p>
          {SITIO.razonSocial} · {SITIO.direccion.calle}, {SITIO.direccion.codigoPostal} {SITIO.direccion.ciudad} · {SITIO.telefonos[0].mostrar}
        </p>
      </div>
    </div>
  );
}

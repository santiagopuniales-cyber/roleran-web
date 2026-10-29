import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { BANDERAS, SITIO, ZONA_ENVIO_GRATIS } from "@/config/sitio";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: `Cómo pedir, envíos, formas de pago, factura con RUT, horario y retiro en el local. ${SITIO.nombre}, Montevideo.`,
  alternates: { canonical: canonica("/preguntas-frecuentes/") },
  openGraph: compartir("/preguntas-frecuentes/", `Preguntas frecuentes | ${SITIO.nombre}`),
};

// Respuestas solo con lo confirmado. Lo que el dueño tiene que confirmar está en docs/TEXTOS-A-CONFIRMAR.md.
const PREGUNTAS: { p: string; r: string; enlace?: { href: string; texto: string } }[] = [
  {
    p: "¿Cómo hago un pedido?",
    r: "Agregá los productos a la cotización desde la web y tocá «Pedir cotización por WhatsApp», o mandanos tu lista directamente por WhatsApp. Te pasamos el precio y la disponibilidad de cada producto y, si te sirve, coordinamos el retiro o el envío.",
    enlace: { href: "/pedido/", texto: "Ir a la cotización" },
  },
  {
    p: "¿Venden por unidad?",
    r: "Sí: en el mostrador también atendemos a quien necesita pocas unidades. La mayoría de los productos para comercios vienen en paquete, caja o funda; en cada producto ves la presentación. Si necesitás una cantidad distinta, consultanos.",
  },
  {
    p: "¿Muestran los precios?",
    r: "Los precios se dan por cotización, porque cambian según la cantidad que lleves. Armá tu lista en la web y te pasamos el precio del total por WhatsApp.",
  },
  {
    p: "¿Hacen envíos?",
    r: `Sí, con nuestro propio cadete.${BANDERAS.MOSTRAR_ENVIOS_SIN_COSTO ? ` El envío es gratis en ${ZONA_ENVIO_GRATIS}; para otras zonas, consultanos.` : ""} Escribinos por WhatsApp con tu dirección para coordinar la entrega.`,
  },
  {
    p: "¿Puedo retirar en el local?",
    r: `Sí, en ${SITIO.direccion.calle}, ${SITIO.horario.texto.toLowerCase()}. Te recomendamos mandar el pedido antes por WhatsApp: así lo retirás armado, sin esperar.`,
    enlace: { href: "/contacto/", texto: "Ver cómo llegar" },
  },
  {
    p: "¿Cómo pago?",
    r: "En efectivo o por transferencia bancaria. Si querés pagar con cheque, consultanos.",
  },
  ...(BANDERAS.MOSTRAR_FACTURA_RUT
    ? [{ p: "¿Facturan con RUT?", r: "Sí, hacemos factura electrónica a nombre de tu empresa. Pasanos el RUT y la razón social junto con el pedido (en la cotización hay un lugar para el RUT)." }]
    : []),
  {
    p: "¿Cuál es el horario?",
    r: `${SITIO.horario.texto}. Por WhatsApp podés mandar tu pedido en cualquier momento y te respondemos en el horario de atención.`,
  },
  {
    p: "No encuentro un producto en la web, ¿lo tienen?",
    r: "Escribinos por WhatsApp con el nombre, la medida o una foto y te decimos si lo tenemos.",
  },
];

export default function PreguntasFrecuentes() {
  return (
    <div className="contenedor pt-5">
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: PREGUNTAS.map((q) => ({ "@type": "Question", name: q.p, acceptedAnswer: { "@type": "Answer", text: q.r } })),
        }}
      />
      <Migas items={[{ nombre: "Preguntas frecuentes" }]} />
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h1 className="text-[1.85rem] md:text-[2.4rem]">Preguntas frecuentes</h1>
          <div className="mt-6 divide-y divide-borde overflow-hidden rounded-panel border border-borde bg-white">
            {PREGUNTAS.map((q, i) => (
              <details key={q.p} className="group" open={i === 0}>
                <summary className="flex items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-lienzo [&::-webkit-details-marker]:hidden">
                  <h2 className="font-sans text-[1.05rem] font-semibold tracking-normal [font-stretch:100%]">{q.p}</h2>
                  <span aria-hidden="true" className="text-xl text-verde transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-tinta-suave">
                  <p>{q.r}</p>
                  {q.enlace && (
                    <Link href={q.enlace.href} className="mt-0.5 inline-block py-2.5 font-semibold text-verde hover:underline">
                      {q.enlace.texto} →
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
        <aside className="self-start rounded-panel border border-borde bg-white p-6">
          <p className="titulo text-2xl">¿Otra pregunta?</p>
          <p className="mt-2 text-tinta-suave">Escribinos y te respondemos.</p>
          <BotonWhatsApp mensaje="Tengo una consulta: " className="mt-4">
            Escribir al {SITIO.whatsapp.mostrar}
          </BotonWhatsApp>
        </aside>
      </div>
    </div>
  );
}

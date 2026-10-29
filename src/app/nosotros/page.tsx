import type { Metadata } from "next";
import Link from "next/link";
import { ComoPedir } from "@/components/bloques";
import { Migas } from "@/components/Migas";
import { BANDERAS, MARCAS_QUE_TRABAJAN, SITIO, ZONA_ENVIO_GRATIS } from "@/config/sitio";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Nosotros",
  description: `${SITIO.razonSocial}: empresa uruguaya con décadas de experiencia en envases descartables. Local en ${SITIO.direccion.calle}, Montevideo, y pedidos por WhatsApp.`,
  alternates: { canonical: canonica("/nosotros/") },
  openGraph: compartir("/nosotros/", `Nosotros | ${SITIO.nombre}`),
};

function listaMarcas(m: string[]) {
  return `${m.slice(0, -1).join(", ")} y ${m.at(-1)}`;
}

export default function Nosotros() {
  return (
    <>
      <div className="contenedor pt-5">
        <Migas items={[{ nombre: "Nosotros" }]} />
        <div className="mt-4 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="prosa">
            <h1 className="mb-5 text-[1.85rem] text-tinta md:text-[2.4rem]">Nosotros</h1>
            <p className="text-lg">
              {SITIO.razonSocial} es una empresa uruguaya con décadas de experiencia, dedicada a la comercialización y distribución de envases
              descartables. Lo resumimos en una frase: <strong className="text-tinta">casi todo en descartables</strong>.
            </p>
            <p>
              Trabajamos con comercios de comida, rotiserías, panaderías y confiterías, carnicerías, heladerías y restaurantes, y también con quien
              pasa por el mostrador y necesita pocas unidades para su casa o para un cumpleaños.
            </p>
            <p>
              Más del 95 % de nuestros productos son reciclables y reutilizables, y muchos están fabricados con materia prima reciclada.
            </p>
            <p>
              Atendemos en el local de {SITIO.direccion.calle}, en {SITIO.direccion.ciudad}, y por WhatsApp. Podés mandarnos el pedido antes y pasar
              a buscarlo armado, o te lo llevamos con nuestro propio cadete{BANDERAS.MOSTRAR_ENVIOS_SIN_COSTO ? `, gratis en ${ZONA_ENVIO_GRATIS}` : ""}.
            </p>
            <p>Distribuimos productos de marcas como {listaMarcas(MARCAS_QUE_TRABAJAN)}.</p>
            {BANDERAS.MOSTRAR_FACTURA_RUT && <p>Facturamos con RUT, con factura electrónica.</p>}
            <p>
              <Link href="/productos/">Mirá el catálogo</Link> o <Link href="/contacto/">escribinos</Link>.
            </p>
          </div>
          <aside className="self-start rounded-panel border border-borde bg-white p-6">
            <h2 className="text-2xl">Datos</h2>
            <dl className="mt-4 space-y-3 text-[0.95rem]">
              <div>
                <dt className="text-sm text-tinta-tenue">Razón social</dt>
                <dd className="font-semibold">{SITIO.razonSocial}</dd>
              </div>
              <div>
                <dt className="text-sm text-tinta-tenue">Dirección</dt>
                <dd className="font-semibold">
                  {SITIO.direccion.calle}, {SITIO.direccion.codigoPostal} {SITIO.direccion.ciudad}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-tinta-tenue">Horario</dt>
                <dd className="font-semibold">{SITIO.horario.texto}</dd>
              </div>
              <div>
                <dt className="text-sm text-tinta-tenue">WhatsApp</dt>
                <dd className="font-semibold">{SITIO.whatsapp.mostrar}</dd>
              </div>
              <div>
                <dt className="text-sm text-tinta-tenue">Teléfonos</dt>
                <dd className="font-semibold">{SITIO.telefonos.map((t) => t.mostrar).join(" · ")}</dd>
              </div>
              <div>
                <dt className="text-sm text-tinta-tenue">Correo</dt>
                {SITIO.emails.map((e) => (
                  <dd key={e} className="font-semibold">
                    <a href={`mailto:${e}`} className="inline-block py-1 hover:text-verde hover:underline">
                      {e}
                    </a>
                  </dd>
                ))}
              </div>
            </dl>
          </aside>
        </div>
      </div>
      <div className="mt-14">
        <ComoPedir />
      </div>
    </>
  );
}

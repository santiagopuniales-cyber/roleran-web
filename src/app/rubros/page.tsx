import type { Metadata } from "next";
import Link from "next/link";
import { Migas } from "@/components/Migas";
import { SITIO } from "@/config/sitio";
import { obtenerRubros } from "@/lib/catalogo";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Descartables por rubro",
  description: `Lo que compra cada tipo de negocio, ordenado: rotiserías, panaderías, heladerías, carnicerías, restaurantes, eventos y comercios. ${SITIO.nombre}, Montevideo.`,
  alternates: { canonical: canonica("/rubros/") },
  openGraph: compartir("/rubros/", `Descartables por rubro | ${SITIO.nombre}`),
};

export default function Rubros() {
  const rubros = obtenerRubros();
  return (
    <div className="contenedor pt-5">
      <Migas items={[{ nombre: "Rubros" }]} />
      <h1 className="mt-4 text-[1.85rem] md:text-[2.4rem]">Descartables por rubro</h1>
      <p className="mt-3 max-w-3xl text-lg text-tinta-suave">Elegí tu tipo de negocio y mirá los productos que le sirven, ordenados por categoría.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rubros.map((r) => (
          <li key={r.slug}>
            <Link href={`/rubros/${r.slug}/`} className="group flex h-full flex-col justify-between gap-4 rounded-tarjeta border border-borde bg-white p-5 hover:border-verde">
              <span>
                <span className="titulo block text-xl group-hover:text-verde">{r.nombre}</span>
                <span className="mt-1.5 block text-tinta-suave">{r.intro}</span>
              </span>
              <span className="text-sm font-semibold text-verde">
                {r.cantidad} productos <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

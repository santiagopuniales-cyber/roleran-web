import type { Metadata } from "next";
import Link from "next/link";
import { AyudaWhatsApp } from "@/components/AyudaWhatsApp";
import { Explorador, type Faceta } from "@/components/catalogo/Explorador";
import { Migas } from "@/components/Migas";
import { SITIO } from "@/config/sitio";
import { categoriasRaiz, obtenerCategorias, obtenerRubros, subcategorias } from "@/lib/catalogo";
import { itemsExplorador, ordenarPorRelevancia } from "@/lib/explorador";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Todos los productos",
  description: `Catálogo completo de ${SITIO.nombre}: bandejas, envases, potes, vasos, cajas, bolsas, servilletas, film, artículos de limpieza y más. Filtrá por categoría y rubro.`,
  alternates: { canonical: canonica("/productos/") },
  openGraph: compartir("/productos/", `Todos los productos | ${SITIO.nombre}`),
};

export default function Productos() {
  const orden = Object.fromEntries(obtenerCategorias().map((c) => [c.slug, c.orden]));
  const items = ordenarPorRelevancia(itemsExplorador(), orden);
  const raices = categoriasRaiz();
  const facetas: Faceta[] = [
    {
      clave: "categoria",
      titulo: "Categoría",
      // Cada categoría seguida de sus subcategorías, con sangría.
      opciones: raices.flatMap((c) => [
        { valor: c.slug, etiqueta: c.nombre, cantidad: c.cantidad },
        ...subcategorias(c.slug).map((s) => ({ valor: s.slug, etiqueta: ` ${s.nombre}`, cantidad: s.cantidad })),
      ]),
    },
    {
      clave: "rubro",
      titulo: "Rubro",
      opciones: obtenerRubros().map((r) => ({ valor: r.slug, etiqueta: r.nombre, cantidad: r.cantidad })),
    },
  ];
  return (
    <>
      <div className="border-b border-borde">
        <div className="contenedor py-6 md:py-8">
          <Migas items={[{ nombre: "Productos" }]} />
          <h1 className="mt-4 text-[1.85rem] md:text-[2.4rem]">Todos los productos</h1>
          <p className="mt-3 max-w-3xl text-lg text-tinta-suave">
            {items.length} productos en {raices.length} categorías. Filtrá por categoría o por rubro, o buscá por nombre o código.
          </p>
          <nav aria-label="Categorías" className="-mx-4 mt-5 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex gap-2 md:flex-wrap">
              {raices.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categorias/${c.slug}/`} className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-borde-fuerte bg-white px-4 text-sm font-medium hover:border-verde hover:text-verde">
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="contenedor mt-8">
        <Explorador inicial={items.slice(0, 48)} total={items.length} facetas={facetas} />
        <div className="mt-12">
          <AyudaWhatsApp />
        </div>
      </div>
    </>
  );
}

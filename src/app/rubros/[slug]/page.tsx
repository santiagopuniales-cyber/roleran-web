import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AyudaWhatsApp } from "@/components/AyudaWhatsApp";
import { FilaProducto } from "@/components/FilaProducto";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { SITIO } from "@/config/sitio";
import { obtenerCategoria, obtenerCategorias, obtenerRubro, obtenerRubros, productosDeRubro } from "@/lib/catalogo";
import { canonica, compartir, recortar } from "@/lib/seo";
import type { Producto } from "@/lib/tipos";

export const dynamicParams = false;

export function generateStaticParams() {
  return obtenerRubros().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rubros/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = obtenerRubro(slug);
  if (!r) return {};
  return {
    title: `${r.titulo} en Montevideo`,
    description: recortar(`${r.intro} Pedí por WhatsApp en ${SITIO.nombre}, ${SITIO.direccion.calle}.`),
    alternates: { canonical: canonica(`/rubros/${slug}/`) },
    openGraph: compartir(`/rubros/${slug}/`, `${r.titulo} | ${SITIO.nombre}`),
  };
}

export default async function PaginaRubro({ params }: PageProps<"/rubros/[slug]">) {
  const { slug } = await params;
  const rubro = obtenerRubro(slug);
  if (!rubro) notFound();
  const productos = productosDeRubro(slug);
  const orden = Object.fromEntries(obtenerCategorias().map((c) => [c.slug, c.orden]));

  // Agrupar por subcategoría: primero las más propias del rubro, después en el orden de la taxonomía.
  const grupos = new Map<string, Producto[]>();
  for (const p of productos) {
    if (!grupos.has(p.categoria)) grupos.set(p.categoria, []);
    grupos.get(p.categoria)!.push(p);
  }
  const prioridad = (slug: string) => (rubro.primero.includes(slug) ? rubro.primero.indexOf(slug) : rubro.primero.length);
  const lista = [...grupos.entries()]
    .map(([cat, ps]) => ({ cat: obtenerCategoria(cat)!, ps: ps.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { numeric: true })) }))
    .sort((a, b) => {
      const ra = a.cat.padre ? orden[a.cat.padre] : a.cat.orden;
      const rb = b.cat.padre ? orden[b.cat.padre] : b.cat.orden;
      return prioridad(a.cat.slug) - prioridad(b.cat.slug) || ra - rb || a.cat.orden - b.cat.orden;
    });
  const otros = obtenerRubros().filter((r) => r.slug !== slug);

  return (
    <>
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: rubro.titulo,
          numberOfItems: productos.length,
          itemListElement: productos.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: canonica(`/productos/${p.slug}/`), name: p.nombre })),
        }}
      />
      <div className="border-b border-borde">
        <div className="contenedor py-6 md:py-8">
          <Migas items={[{ nombre: "Rubros", href: "/rubros/" }, { nombre: rubro.nombre }]} />
          <h1 className="mt-4 max-w-4xl text-[1.85rem] md:text-[2.4rem]">{rubro.titulo}</h1>
          <p className="mt-3 max-w-3xl text-lg text-tinta-suave">{rubro.intro}</p>
          <nav aria-label="Grupos de productos" className="-mx-4 mt-5 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex gap-2 md:flex-wrap">
              {lista.map((g) => (
                <li key={g.cat.slug}>
                  <a href={`#${g.cat.slug}`} className="inline-flex h-10 items-center whitespace-nowrap rounded-full border border-borde-fuerte bg-white px-4 text-sm font-medium hover:border-verde hover:text-verde">
                    {g.cat.nombre} <span className="numeros ml-1.5 text-tinta-tenue">{g.ps.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="contenedor mt-8 space-y-10">
        {lista.map((g) => (
          <section key={g.cat.slug} id={g.cat.slug} aria-labelledby={`t-${g.cat.slug}`} className="scroll-mt-28">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 id={`t-${g.cat.slug}`} className="text-2xl">
                {g.cat.nombre}
              </h2>
              <Link href={`/categorias/${g.cat.slug}/`} className="-my-3 inline-block shrink-0 py-3 text-sm font-semibold text-verde hover:underline">
                Ver categoría <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-panel border border-borde bg-borde lg:grid-cols-2">
              {g.ps.map((p) => (
                <li key={p.id} className="bg-white">
                  <FilaProducto producto={p} />
                </li>
              ))}
              {g.ps.length % 2 === 1 && <li aria-hidden="true" className="hidden bg-white lg:block" />}
            </ul>
          </section>
        ))}
      </div>

      <div className="contenedor mt-12 space-y-10">
        <AyudaWhatsApp tema={`productos para ${rubro.nombre.toLowerCase()}`} />
        <section aria-labelledby="otros-rubros">
          <h2 id="otros-rubros" className="text-2xl">
            Otros rubros
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otros.map((r) => (
              <li key={r.slug}>
                <Link href={`/rubros/${r.slug}/`} className="inline-flex h-10 items-center rounded-full border border-borde-fuerte bg-white px-4 text-sm font-medium hover:border-verde hover:text-verde">
                  {r.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

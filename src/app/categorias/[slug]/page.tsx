import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AyudaWhatsApp } from "@/components/AyudaWhatsApp";
import { JsonLd } from "@/components/JsonLd";
import { Migas } from "@/components/Migas";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { SITIO } from "@/config/sitio";
import { obtenerCategoria, obtenerCategorias, productosDeCategoria, rubrosDeCategoria, rutaCategoria, subcategorias } from "@/lib/catalogo";
import { canonica, compartir, recortar } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return obtenerCategorias().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = obtenerCategoria(slug);
  if (!c) return {};
  return {
    title: `${c.nombre} en Montevideo`,
    description: recortar(`${c.descripcion} ${c.cantidad} productos. Pedí tu cotización por WhatsApp a ${SITIO.nombre}`),
    alternates: { canonical: canonica(`/categorias/${slug}/`) },
    openGraph: compartir(`/categorias/${slug}/`, `${c.nombre} | ${SITIO.nombre}`),
  };
}

export default async function PaginaCategoria({ params }: PageProps<"/categorias/[slug]">) {
  const { slug } = await params;
  const cat = obtenerCategoria(slug);
  if (!cat) notFound();
  const ruta = rutaCategoria(slug);
  const raiz = ruta[0];
  const hijas = subcategorias(raiz.slug);
  const esRaiz = !cat.padre;
  const productos = productosDeCategoria(slug);
  const rubros = rubrosDeCategoria(slug);

  // En una categoría raíz, los productos se agrupan por subcategoría.
  const grupos = esRaiz && hijas.length
    ? hijas
        .map((h) => ({ cat: h, productos: productos.filter((p) => p.categoria === h.slug || p.categoriasSecundarias.includes(h.slug)) }))
        .filter((g) => g.productos.length)
    : [{ cat, productos }];
  const vistos = new Set<string>();

  return (
    <>
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: cat.nombre,
          numberOfItems: productos.length,
          itemListElement: productos.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: canonica(`/productos/${p.slug}/`),
            name: p.nombre,
          })),
        }}
      />
      <div className="border-b border-borde">
        <div className="contenedor py-6 md:py-8">
          <Migas items={ruta.map((c, i) => ({ nombre: c.nombre, href: i < ruta.length - 1 ? `/categorias/${c.slug}/` : undefined }))} />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-[1.85rem] md:text-[2.4rem]">{cat.nombre}</h1>
              <p className="mt-3 text-lg text-tinta-suave">{cat.descripcion}</p>
              {rubros.length > 0 && (
                <p className="mt-2 leading-8 text-tinta-suave md:leading-normal">
                  Todo lo de tu rubro junto:{" "}
                  {rubros.map((r, i) => (
                    <span key={r.slug}>
                      {i > 0 && " · "}
                      <Link href={`/rubros/${r.slug}/`} className="font-semibold text-verde hover:underline">
                        {r.nombre}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
            <p className="numeros rounded-chip bg-lienzo px-3 py-1.5 text-sm font-semibold text-tinta-suave">
              {productos.length} {productos.length === 1 ? "producto" : "productos"}
            </p>
          </div>
          {hijas.length > 0 && (
            <nav aria-label={`Subcategorías de ${raiz.nombre}`} className="-mx-4 mt-6 overflow-x-auto px-4 md:mx-0 md:px-0">
              <ul className="flex gap-2 md:flex-wrap">
                <li>
                  <Link
                    href={`/categorias/${raiz.slug}/`}
                    aria-current={esRaiz ? "page" : undefined}
                    className={`inline-flex h-10 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${esRaiz ? "border-verde bg-verde text-white" : "border-borde-fuerte bg-white hover:border-verde hover:text-verde"}`}
                  >
                    Todo <span className={`numeros ml-1.5 ${esRaiz ? "text-white/80" : "text-tinta-tenue"}`}>{raiz.cantidad}</span>
                  </Link>
                </li>
                {hijas.map((h) => (
                  <li key={h.slug}>
                    <Link
                      href={`/categorias/${h.slug}/`}
                      aria-current={h.slug === slug ? "page" : undefined}
                      className={`inline-flex h-10 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${h.slug === slug ? "border-verde bg-verde text-white" : "border-borde-fuerte bg-white hover:border-verde hover:text-verde"}`}
                    >
                      {h.nombre} <span className={`numeros ml-1.5 ${h.slug === slug ? "text-white/80" : "text-tinta-tenue"}`}>{h.cantidad}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      <div className="contenedor mt-8 space-y-12">
        {grupos.map((g, gi) => {
          const lista = g.productos.filter((p) => !vistos.has(p.id));
          lista.forEach((p) => vistos.add(p.id));
          if (!lista.length) return null;
          return (
            <section key={g.cat.slug} aria-labelledby={grupos.length > 1 ? `g-${g.cat.slug}` : undefined}>
              {grupos.length > 1 && (
                <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-borde pb-2">
                  <h2 id={`g-${g.cat.slug}`} className="text-2xl md:text-[1.75rem]">
                    {g.cat.nombre}
                  </h2>
                  <Link href={`/categorias/${g.cat.slug}/`} className="-my-3 inline-block shrink-0 py-3 text-sm font-semibold text-verde hover:underline">
                    Ver solo esta <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {lista.map((p, i) => (
                  <li key={p.id}>
                    <TarjetaProducto producto={p} prioridad={gi === 0 && i < 2} nivelTitulo={grupos.length > 1 ? 3 : 2} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <AyudaWhatsApp tema={cat.nombre.toLowerCase()} />
      </div>
    </>
  );
}

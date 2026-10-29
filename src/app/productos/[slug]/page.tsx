import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Migas } from "@/components/Migas";
import { AgregarFicha } from "@/components/pedido/AgregarFicha";
import { GaleriaProducto } from "@/components/GaleriaProducto";
import { TablaEscalas } from "@/components/precios/TablaEscalas";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { Etiqueta, TituloSeccion } from "@/components/ui";
import { BANDERAS, SITIO } from "@/config/sitio";
import { obtenerCategoria, obtenerProducto, obtenerProductos, obtenerRubro, placeholderDe, productosRelacionados, resumen, rutaCategoria } from "@/lib/catalogo";
import { canonica, compartir, recortar } from "@/lib/seo";
import type { Producto } from "@/lib/tipos";

export const dynamicParams = false;

export function generateStaticParams() {
  return obtenerProductos().map((p) => ({ slug: p.slug }));
}

function tituloSeo(p: Producto) {
  const base = p.presentacion.tipo === "consultar" ? p.nombre : `${p.nombre} · ${p.presentacion.texto}`;
  // Dos productos con el mismo nombre (códigos distintos en el sistema de Roleran): el código los distingue.
  const repetido = obtenerProductos().some((o) => o.id !== p.id && o.nombre === p.nombre);
  return repetido && p.sku ? `${base} · Cód. ${p.sku}` : base;
}

export async function generateMetadata({ params }: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = obtenerProducto(slug);
  if (!p) return {};
  const img = p.imagenes[0];
  // Frases que ya terminan en punto («aprox.», códigos como DOMO32OZ.) no llevan otro.
  const frase = (t: string) => (t.endsWith(".") ? t : `${t}.`);
  const desc = recortar(
    `${frase(`${p.nombre}${p.presentacion.tipo !== "consultar" ? `, ${p.presentacion.texto.toLowerCase()}` : ""}`)}${p.sku ? ` Código ${frase(p.sku)}` : ""} ${
      p.descripcion.split(". ")[0].replace(/\.$/, "")
    }. Pedilo por WhatsApp en ${SITIO.nombre}, ${SITIO.direccion.ciudad}.`,
  );
  return {
    title: tituloSeo(p),
    description: desc,
    alternates: { canonical: canonica(`/productos/${slug}/`) },
    openGraph: compartir(`/productos/${slug}/`, tituloSeo(p), img ? { url: `${img.base}-${img.tamanos.includes(640) ? 640 : img.tamanos.at(-1)}.webp`, alt: p.nombre } : undefined),
  };
}

const ETIQUETAS: [keyof Producto["atributos"], string][] = [
  ["material", "Material"],
  ["medidas", "Medidas"],
  ["capacidad", "Capacidad"],
  ["diametro", "Diámetro"],
  ["largo", "Largo"],
  ["ancho", "Ancho"],
  ["color", "Color"],
  ["usoApto", "Uso apto (según fabricante)"],
  ["marca", "Marca"],
  ["codigoFabricante", "Código del fabricante"],
];

export default async function PaginaProducto({ params }: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const p = obtenerProducto(slug);
  if (!p) notFound();
  const ruta = rutaCategoria(p.categoria);
  const relacionados = productosRelacionados(p, 8);
  const filas: [string, string][] = [];
  if (p.sku) filas.push(["Código", p.sku]);
  filas.push(["Presentación", p.presentacion.texto]);
  for (const [k, etiqueta] of ETIQUETAS) {
    const v = p.atributos[k];
    if (typeof v === "string" && v) filas.push([etiqueta, v]);
  }
  if (p.atributos.empaqueCerrado && p.presentacion.fuente !== "ficha") {
    const e = p.atributos.empaqueCerrado;
    filas.push([`${e.tipo === "funda" ? "Funda" : "Caja"} cerrada (fabricante)`, `${e.unidades.toLocaleString("es-UY")} unidades`]);
  }
  for (const e of p.extras) filas.push([e.etiqueta, e.valor]);
  const rubros = p.rubros.map((r) => obtenerRubro(r)).filter(Boolean);
  const categoria = obtenerCategoria(p.categoria);

  return (
    <>
      <div className="contenedor pt-5">
        <Migas items={[...ruta.map((c) => ({ nombre: c.nombre, href: `/categorias/${c.slug}/` })), { nombre: p.nombre }]} />
      </div>
      <div className="contenedor mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
        <GaleriaProducto imagenes={p.imagenes} placeholder={placeholderDe(p)} nombre={p.nombre} />

        <div>
          {categoria && (
            <Link href={`/categorias/${categoria.slug}/`} className="-my-2.5 inline-block py-2.5 text-sm font-semibold text-verde hover:underline">
              {categoria.nombre}
            </Link>
          )}
          <h1 className="mt-1 text-[1.7rem] leading-[1.15] md:text-[2.2rem]">{p.nombre}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Etiqueta>{p.presentacion.texto}</Etiqueta>
            {p.sku && <span className="numeros text-sm text-tinta-tenue">Código {p.sku}</span>}
          </div>
          {p.descripcion && <p className="mt-4 text-lg text-tinta-suave">{p.descripcion}</p>}

          <div className="mt-6 rounded-panel border border-borde bg-white p-4 sm:p-5">
            {BANDERAS.MOSTRAR_PRECIOS && p.precios.length > 0 ? (
              <TablaEscalas precios={p.precios} unidad={p.presentacion.texto} />
            ) : (
              <p className="text-sm text-tinta-suave">
                <strong className="text-tinta">Precio:</strong> te lo pasamos por WhatsApp junto con la disponibilidad. Los precios bajan según la cantidad.
              </p>
            )}
            <AgregarFicha producto={resumen(p)} unidad={p.presentacion.tipo === "kg" ? "kg" : p.presentacion.tipo === "metro" ? "m" : undefined} />
          </div>

          <h2 className="mt-8 text-xl">Datos del producto</h2>
          <table className="mt-3 w-full overflow-hidden rounded-tarjeta border border-borde bg-white text-[0.95rem]">
            <tbody>
              {filas.map(([k, v]) => (
                <tr key={k} className="border-b border-borde last:border-0">
                  <th scope="row" className="w-[42%] bg-lienzo/60 px-3.5 py-2.5 text-left align-top font-medium text-tinta-suave">
                    {k}
                  </th>
                  <td className="numeros px-3.5 py-2.5">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {p.imagenes.length > 0 && p.imagenes[0].origen !== "propia" && (
            <p className="mt-2 text-xs text-tinta-tenue">La foto puede mostrar otra medida o color de la misma línea.</p>
          )}

          {rubros.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl">Se usa en</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {rubros.map((r) => (
                  <li key={r!.slug}>
                    <Link href={`/rubros/${r!.slug}/`} className="inline-flex h-9 items-center rounded-full border border-borde-fuerte bg-white px-3.5 text-sm font-medium hover:border-verde hover:text-verde">
                      {r!.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section aria-labelledby="relacionados" className="contenedor mt-14">
          <TituloSeccion id="relacionados" titulo="También te puede servir" enlace={categoria ? { href: `/categorias/${categoria.slug}/`, texto: `Ver ${categoria.nombre.toLowerCase()}` } : undefined} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {relacionados.slice(0, 8).map((r) => (
              <li key={r.id}>
                <TarjetaProducto producto={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

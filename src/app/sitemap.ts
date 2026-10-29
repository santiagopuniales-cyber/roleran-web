import type { MetadataRoute } from "next";
import { SITIO } from "@/config/sitio";
import { fechaCatalogo, obtenerCategorias, obtenerProductos, obtenerRubros } from "@/lib/catalogo";

export const dynamic = "force-static";

// Fecha del catálogo (no la del build), para no avisar cambios que no hubo.
const FECHA = fechaCatalogo();

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (ruta: string) => `${SITIO.url}${ruta}`;
  const fijas = ["/", "/productos/", "/rubros/", "/pedido/", "/nosotros/", "/contacto/", "/preguntas-frecuentes/", "/privacidad/"];
  return [
    ...fijas.map((r) => ({ url: url(r), lastModified: FECHA, changeFrequency: "monthly" as const, priority: r === "/" ? 1 : r === "/privacidad/" || r === "/pedido/" ? 0.3 : 0.6 })),
    ...obtenerCategorias().map((c) => ({ url: url(`/categorias/${c.slug}/`), lastModified: FECHA, changeFrequency: "weekly" as const, priority: c.padre ? 0.7 : 0.8 })),
    ...obtenerRubros().map((r) => ({ url: url(`/rubros/${r.slug}/`), lastModified: FECHA, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...obtenerProductos().map((p) => ({ url: url(`/productos/${p.slug}/`), lastModified: FECHA, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}

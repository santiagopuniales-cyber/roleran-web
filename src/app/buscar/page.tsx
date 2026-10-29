import type { Metadata } from "next";
import { SITIO } from "@/config/sitio";
import { Suspense } from "react";
import { preload } from "react-dom";
import { Migas } from "@/components/Migas";
import { ResultadosBusqueda } from "@/components/busqueda/ResultadosBusqueda";
import { canonica, compartir } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Buscar productos",
  description: `Buscá entre los envases y descartables de ${SITIO.nombre} por nombre, medida o código.`,
  alternates: { canonical: canonica("/buscar/") },
  openGraph: compartir("/buscar/", `Buscar productos | ${SITIO.nombre}`),
  robots: { index: false, follow: true },
};

export default function Buscar() {
  // El índice de búsqueda baja junto con el HTML, no recién cuando arranca el JavaScript de la página.
  // crossOrigin "anonymous" = mismo modo que el fetch() de cargarIndice, si no el navegador lo baja dos veces.
  preload("/datos/busqueda.json", { as: "fetch", crossOrigin: "anonymous" });
  return (
    <div className="contenedor pt-5">
      <Migas items={[{ nombre: "Buscar" }]} />
      <div className="min-h-[85vh]">
        <Suspense fallback={<h1 className="mt-4 text-[1.85rem] md:text-[2.4rem]">Buscar productos</h1>}>
          <ResultadosBusqueda />
        </Suspense>
      </div>
    </div>
  );
}

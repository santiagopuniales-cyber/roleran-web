import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import type { Metadata } from "next";
import Link from "next/link";
import { GrillaCategorias } from "@/components/bloques";
import { Buscador } from "@/components/encabezado/Buscador";
import { claseBoton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NoEncontrada() {
  return (
    <div className="contenedor pt-10">
      <div className="max-w-2xl">
        <p className="numeros text-sm font-semibold text-kraft-tinta">Error 404</p>
        <h1 className="mt-2 text-[1.85rem] md:text-[2.4rem]">No encontramos esta página</h1>
        <p className="mt-3 text-lg text-tinta-suave">
          Puede que el enlace sea viejo o que el producto haya cambiado de nombre. Buscalo acá o entrá por una categoría.
        </p>
        <div className="mt-6">
          <Buscador grande />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className={claseBoton("secundario")}>
            Ir al inicio
          </Link>
          <BotonWhatsApp mensaje="Estoy buscando: " variante="secundario">
            Preguntar por WhatsApp
          </BotonWhatsApp>
        </div>
      </div>
      <h2 className="mb-4 mt-12 text-2xl">Categorías</h2>
      <GrillaCategorias />
    </div>
  );
}

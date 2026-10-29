// Pie de página con todos los datos de contacto.
import Link from "next/link";
import { BANDERAS, SITIO } from "@/config/sitio";
import { categoriasRaiz } from "@/lib/catalogo";
import { urlWhatsApp } from "@/lib/pedido/whatsapp";
import { NOMBRE_CORTO } from "./encabezado/Encabezado";
import { IconoChat, IconoReloj, IconoTelefono, IconoUbicacion } from "./iconos";
import { Logo } from "./Logo";

export function Pie() {
  const cats = categoriasRaiz();
  // Año de la publicación: la web se vuelve a publicar sola cada vez que cambia el catálogo.
  const anio = new Date().getFullYear();
  return (
    <footer className="no-imprimir mt-16 bg-noche text-noche-texto">
      <div className="contenedor grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1.4fr_0.9fr]">
        <div>
          <span className="inline-block rounded-control bg-white px-3 py-2">
            <Logo alto={34} />
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {SITIO.razonSocial}: distribuidora de envases descartables en Montevideo. {SITIO.lema}.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-lg text-white">Contacto</h2>
          <ul className="space-y-0 text-sm md:space-y-2.5">
            <li>
              <a href={SITIO.mapaUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 py-2 hover:text-white md:py-0">
                <IconoUbicacion tamano={18} className="mt-0.5 shrink-0" />
                <span>
                  {SITIO.direccion.calle}
                  <br />
                  {SITIO.direccion.codigoPostal} {SITIO.direccion.ciudad}
                </span>
              </a>
            </li>
            <li className="flex gap-2 py-2 md:py-0">
              <IconoReloj tamano={18} className="mt-0.5 shrink-0" />
              {SITIO.horario.texto}
            </li>
            <li>
              <a href={urlWhatsApp()} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-2 font-semibold text-white hover:text-noche-acento md:min-h-0 md:items-start">
                <IconoChat tamano={18} className="mt-0.5 shrink-0" /> WhatsApp {SITIO.whatsapp.mostrar}
              </a>
            </li>
            {SITIO.telefonos.map((t) => (
              <li key={t.enlace}>
                <a href={t.enlace} className="flex min-h-10 items-center gap-2 hover:text-white md:min-h-0 md:items-start">
                  <IconoTelefono tamano={18} className="mt-0.5 shrink-0" /> {t.mostrar}
                </a>
              </li>
            ))}
            {SITIO.emails.slice(0, 2).map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`} className="inline-flex min-h-10 items-center whitespace-nowrap underline underline-offset-4 hover:text-white md:min-h-0">
                  {e}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-lg text-white">Categorías</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-0 text-sm md:gap-y-2">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorias/${c.slug}/`} className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">
                  {NOMBRE_CORTO[c.slug] ?? c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-lg text-white">{SITIO.nombre}</h2>
          <ul className="space-y-0 text-sm md:space-y-2">
            <li><Link href="/productos/" className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">Todos los productos</Link></li>
            <li><Link href="/pedido/" className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">Cotización</Link></li>
            <li><Link href="/nosotros/" className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">Nosotros</Link></li>
            <li><Link href="/contacto/" className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">Contacto y cómo llegar</Link></li>
            <li><Link href="/preguntas-frecuentes/" className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">Preguntas frecuentes</Link></li>
            <li><Link href="/privacidad/" className="flex min-h-10 items-center hover:text-white hover:underline md:inline md:min-h-0">Privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="contenedor flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-noche-tenue">
          <p>
            © {anio} {SITIO.razonSocial} · {SITIO.direccion.ciudad}, {SITIO.direccion.paisNombre}
          </p>
          <p>
            {BANDERAS.MOSTRAR_PRECIOS ? "Precios en pesos uruguayos con IVA incluido." : "Precios y disponibilidad: consultá por WhatsApp."}
          </p>
        </div>
      </div>
    </footer>
  );
}

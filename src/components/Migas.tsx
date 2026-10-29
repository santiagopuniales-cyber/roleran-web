// Migas de pan con su JSON-LD (BreadcrumbList).
import Link from "next/link";
import { SITIO } from "@/config/sitio";
import { IconoInicio } from "./iconos";
import { JsonLd } from "./JsonLd";

export interface Miga {
  nombre: string;
  href?: string;
}

export function Migas({ items }: { items: Miga[] }) {
  const todos: Miga[] = [{ nombre: "Inicio", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Estás en" className="text-sm text-tinta-suave">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {todos.map((m, i) => (
            <li key={`${m.nombre}-${i}`} className={`items-center gap-1.5 ${i === todos.length - 1 && todos.length > 2 ? "hidden sm:flex" : "flex"}`}>
              {i > 0 && <span aria-hidden="true" className="text-tinta-tenue">/</span>}
              {m.href && i < todos.length - 1 ? (
                <Link href={m.href} className="inline-flex min-h-6 items-center gap-1 font-medium text-tinta hover:text-verde hover:underline">
                  {i === 0 && <IconoInicio tamano={16} />}
                  {m.nombre}
                </Link>
              ) : (
                <span aria-current="page" className="text-tinta-suave">
                  {m.nombre}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: todos.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.nombre,
            ...(m.href ? { item: `${SITIO.url}${m.href}` } : {}),
          })),
        }}
      />
    </>
  );
}

"use client";
// <details> para los menús del encabezado: funciona sin JavaScript y, con JavaScript, se cierra al elegir
// un enlace, al cambiar de página, al tocar afuera o con Escape (la navegación de Next no recarga el encabezado).
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

export function Desplegable({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const ruta = usePathname();
  const rutaAnterior = useRef(ruta);

  // Se cierra al cambiar de página (no al hidratar: si alguien lo abrió antes, queda abierto).
  useEffect(() => {
    if (rutaAnterior.current === ruta) return;
    rutaAnterior.current = ruta;
    ref.current?.removeAttribute("open");
  }, [ruta]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && d.open) {
        d.open = false;
        d.querySelector("summary")?.focus();
      }
    };
    const fuera = (e: MouseEvent) => {
      if (d.open && !d.contains(e.target as Node)) d.open = false;
    };
    document.addEventListener("keydown", tecla);
    document.addEventListener("click", fuera);
    return () => {
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("click", fuera);
    };
  }, []);

  return (
    <details
      ref={ref}
      className={className}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) ref.current?.removeAttribute("open");
      }}
    >
      {children}
    </details>
  );
}

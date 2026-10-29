// Piezas base de la interfaz: botones, etiquetas, títulos de sección.
import Link from "next/link";

type Variante = "primario" | "secundario" | "fantasma" | "whatsapp" | "peligro";
type Tamano = "chico" | "normal" | "grande";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-verde text-white hover:bg-verde-oscuro shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]",
  secundario: "bg-white text-verde border border-borde-fuerte hover:border-verde hover:bg-verde-claro",
  fantasma: "text-verde hover:bg-verde-claro",
  whatsapp: "bg-verde text-white hover:bg-verde-oscuro shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]",
  peligro: "bg-white text-alerta border border-[#f1b8b2] hover:bg-alerta-claro",
};
const TAMANOS: Record<Tamano, string> = {
  chico: "h-11 md:h-10 px-3.5 text-sm gap-1.5",
  normal: "h-11 px-4 text-[0.95rem] gap-2",
  grande: "h-13 px-6 text-base gap-2.5",
};

export function claseBoton(variante: Variante = "primario", tamano: Tamano = "normal", extra = "") {
  return `inline-flex items-center justify-center rounded-control font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANTES[variante]} ${TAMANOS[tamano]} ${extra}`;
}

export function Etiqueta({ children, tono = "kraft", className = "" }: { children: React.ReactNode; tono?: "kraft" | "verde" | "neutro"; className?: string }) {
  const tonos = {
    kraft: "bg-kraft-claro text-kraft-tinta",
    verde: "bg-verde-claro text-verde",
    neutro: "bg-lienzo text-tinta-suave border border-borde",
  };
  return <span className={`inline-flex max-w-full items-center rounded-chip px-2 py-0.5 text-[0.8rem] font-semibold leading-5 ${tonos[tono]} ${className}`}>{children}</span>;
}

export function TituloSeccion({
  titulo,
  bajada,
  enlace,
  id,
  nivel = 2,
}: {
  titulo: string;
  bajada?: string;
  enlace?: { href: string; texto: string };
  id?: string;
  nivel?: 2 | 3;
}) {
  const H = nivel === 2 ? "h2" : "h3";
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <H id={id} className={nivel === 2 ? "text-[1.75rem] md:text-[2.1rem]" : "text-xl"}>
          {titulo}
        </H>
        {bajada && <p className="mt-1.5 max-w-2xl text-tinta-suave">{bajada}</p>}
      </div>
      {enlace && (
        <Link href={enlace.href} className="-my-2.5 inline-block py-2.5 font-semibold text-verde underline-offset-4 hover:underline">
          {enlace.texto} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

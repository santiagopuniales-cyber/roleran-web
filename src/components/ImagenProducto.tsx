// Foto de producto con versiones AVIF y WebP generadas en build. Siempre con ancho y alto declarados.
import type { ImagenProducto as Img } from "@/lib/tipos";
import { Placeholder } from "./Placeholder";

interface Props {
  imagen: Img | null | undefined;
  placeholder: string;
  alt: string;
  /** Ancho aproximado en pantalla, para que el navegador elija el tamaño justo. */
  sizes: string;
  prioridad?: boolean;
  className?: string;
}

export function ImagenProducto({ imagen, placeholder, alt, sizes, prioridad = false, className = "" }: Props) {
  if (!imagen) {
    return (
      <div className={`aspect-square overflow-hidden ${className}`} role="img" aria-label={`${alt} (sin foto todavía)`}>
        <Placeholder tipo={placeholder} />
      </div>
    );
  }
  const srcset = (ext: string) => imagen.tamanos.map((t) => `${imagen.base}-${t}.${ext} ${t}w`).join(", ");
  const mayor = imagen.tamanos.at(-1) ?? 320;
  const fallback = `${imagen.base}-${imagen.tamanos.includes(640) ? 640 : mayor}.webp`;
  return (
    <picture className={`block aspect-square overflow-hidden bg-white ${className}`}>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        width={mayor}
        height={mayor}
        loading={prioridad ? "eager" : "lazy"}
        decoding={prioridad ? "sync" : "async"}
        fetchPriority={prioridad ? "high" : "auto"}
        className="h-full w-full object-contain"
      />
    </picture>
  );
}

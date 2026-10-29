"use client";
// Galería de la ficha: foto grande + miniaturas. Sin carrusel automático.
import { useState } from "react";
import type { ImagenProducto as Img } from "@/lib/tipos";
import { ImagenProducto } from "./ImagenProducto";

export function GaleriaProducto({ imagenes, placeholder, nombre }: { imagenes: Img[]; placeholder: string; nombre: string }) {
  const [actual, setActual] = useState(0);
  const img = imagenes[actual] ?? null;
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-panel border border-borde bg-white">
        <ImagenProducto
          imagen={img}
          placeholder={placeholder}
          alt={imagenes.length > 1 ? `${nombre}, foto ${actual + 1} de ${imagenes.length}` : nombre}
          sizes="(min-width: 64rem) 560px, 100vw"
          prioridad={actual === 0}
        />
      </div>
      {imagenes.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Fotos del producto">
          {imagenes.map((im, i) => (
            <li key={im.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActual(i)}
                aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
                aria-current={i === actual}
                className={`block h-18 w-18 overflow-hidden rounded-control border-2 bg-white ${i === actual ? "border-verde" : "border-borde hover:border-borde-fuerte"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${im.base}-${im.tamanos[0]}.webp`} alt="" width={72} height={72} loading="lazy" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

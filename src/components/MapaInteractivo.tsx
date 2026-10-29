"use client";
// Mapa de Google que se carga recién cuando la persona lo pide (no pesa al abrir la página).
import { useState } from "react";
import { SITIO } from "@/config/sitio";
import { IconoUbicacion } from "./iconos";
import { claseBoton } from "./ui";

export function MapaInteractivo() {
  const [cargar, setCargar] = useState(false);
  const { lat, lng } = SITIO.coordenadas;
  if (cargar) {
    return (
      <iframe
        title={`Mapa: ${SITIO.direccion.calle}, ${SITIO.direccion.ciudad}`}
        src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
        className="h-80 w-full rounded-panel border border-borde md:h-full md:min-h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-panel border border-borde bg-kraft-claro px-6 py-8 text-center">
      <IconoUbicacion tamano={32} className="text-kraft-tinta" />
      <p className="max-w-md text-kraft-tinta">
        {SITIO.direccion.calle}, {SITIO.direccion.ciudad}. El mapa se carga desde Google Maps solo si lo abrís.
      </p>
      <button type="button" className={claseBoton("secundario")} onClick={() => setCargar(true)}>
        Mostrar el mapa
      </button>
    </div>
  );
}

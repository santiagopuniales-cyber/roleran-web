"use client";
// Cloudflare Web Analytics: cuántas personas entran y qué páginas miran, en forma agregada, sin cookies ni
// datos para identificar a nadie. Solo cuenta en el dominio de verdad: ni las pruebas locales ni *.pages.dev
// suman visitas. El script de Cloudflare cuenta solo los cambios de página dentro de la web.
import { useEffect } from "react";
import { SITIO } from "@/config/sitio";

export function ContadorVisitas() {
  useEffect(() => {
    const { token, dominio } = SITIO.contadorVisitas;
    if (!token || location.hostname !== dominio || document.querySelector("script[data-cf-beacon]")) return;
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token }));
    document.body.appendChild(s);
  }, []);
  return null;
}

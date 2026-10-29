"use client";
// GA4 opcional. Solo carga si NEXT_PUBLIC_GA_ID tiene un valor. Se carga cuando el navegador está libre,
// con gtag(){dataLayer.push(arguments)} (con arguments: con un array la medición no funciona) y page_view de entrada.
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { SITIO } from "@/config/sitio";

type Ventana = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };

export function Analytics() {
  const id = SITIO.analyticsId;
  const ruta = usePathname();
  const iniciado = useRef(false);

  useEffect(() => {
    if (!id || iniciado.current) return;
    iniciado.current = true;
    const w = window as Ventana;
    w.dataLayer = w.dataLayer || [];
     
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", id, { send_page_view: false });
    w.gtag("event", "page_view", { page_location: location.href, page_title: document.title });
    const cargar = () => {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(s);
    };
    if ("requestIdleCallback" in w) (w as Window).requestIdleCallback(cargar, { timeout: 3000 });
    else setTimeout(cargar, 1500);
  }, [id]);

  // Navegaciones dentro del sitio: un page_view por cambio de ruta (la primera ya se mandó arriba).
  const primera = useRef(true);
  useEffect(() => {
    if (!id) return;
    if (primera.current) {
      primera.current = false;
      return;
    }
    (window as Ventana).gtag?.("event", "page_view", { page_location: location.href, page_title: document.title });
  }, [ruta, id]);

  return null;
}

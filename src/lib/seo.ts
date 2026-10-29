// Datos estructurados (schema.org) y metadatos comunes.
import { SITIO } from "@/config/sitio";

const DIAS: Record<string, string> = {
  Monday: "https://schema.org/Monday",
  Tuesday: "https://schema.org/Tuesday",
  Wednesday: "https://schema.org/Wednesday",
  Thursday: "https://schema.org/Thursday",
  Friday: "https://schema.org/Friday",
  // El horario lo puede cambiar el dueño desde el sistema (por ejemplo, abrir los sábados).
  Saturday: "https://schema.org/Saturday",
  Sunday: "https://schema.org/Sunday",
};

/** Store (subtipo de LocalBusiness) con dirección, teléfonos, horario y coordenadas. Sin precios ni opiniones. */
export function datosNegocio() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITIO.url}/#negocio`,
    name: SITIO.nombre,
    legalName: SITIO.razonSocial,
    description: SITIO.descripcion,
    url: SITIO.url,
    logo: `${SITIO.url}/marca/logo-80.png`,
    image: `${SITIO.url}/og.png`,
    telephone: SITIO.telefonos[0].enlace.replace("tel:", ""),
    email: SITIO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITIO.direccion.calle,
      addressLocality: SITIO.direccion.ciudad,
      addressRegion: SITIO.direccion.departamento,
      postalCode: SITIO.direccion.codigoPostal,
      addressCountry: SITIO.direccion.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITIO.coordenadas.lat, longitude: SITIO.coordenadas.lng },
    hasMap: SITIO.mapaUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SITIO.horario.dias.map((d) => DIAS[d]),
        opens: SITIO.horario.abre,
        closes: SITIO.horario.cierra,
      },
    ],
    contactPoint: [
      ...SITIO.telefonos.map((t) => ({
        "@type": "ContactPoint",
        telephone: t.enlace.replace("tel:", ""),
        contactType: "sales",
        areaServed: "UY",
        availableLanguage: "es",
      })),
      {
        "@type": "ContactPoint",
        telephone: `+${SITIO.whatsapp.numero}`,
        contactType: "sales",
        description: "WhatsApp",
        areaServed: "UY",
        availableLanguage: "es",
      },
    ],
    currenciesAccepted: "UYU",
    areaServed: { "@type": "Country", name: "Uruguay" },
  };
}

/** URL canónica absoluta con barra final. */
export function canonica(ruta: string) {
  const r = ruta.startsWith("/") ? ruta : `/${ruta}`;
  return `${SITIO.url}${r.endsWith("/") ? r : `${r}/`}`;
}

/** Recorta un texto para meta description sin cortar palabras. */
export function recortar(texto: string, max = 158) {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max - 1);
  return `${corte.slice(0, corte.lastIndexOf(" "))}…`;
}

/** Imagen por defecto para compartir (public/og.png). */
export const IMAGEN_COMPARTIR = { url: "/og.png", width: 1200, height: 630, alt: `${SITIO.nombre}: ${SITIO.lema}` };

/**
 * Open Graph de una página. Next reemplaza el objeto entero del layout cuando una página define el suyo,
 * así que la imagen va siempre explícita (la del producto si tiene, o la general).
 */
export function compartir(ruta: string, titulo: string, imagen?: { url: string; alt: string }) {
  return {
    type: "website" as const,
    locale: "es_UY",
    siteName: SITIO.nombre,
    url: canonica(ruta),
    title: titulo,
    images: [imagen ?? IMAGEN_COMPARTIR],
  };
}

// Íconos propios (trazo de 1,75 px, color del texto). Decorativos: aria-hidden por defecto.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { tamano?: number };

function Base({ tamano = 20, children, ...r }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...r}
    >
      {children}
    </svg>
  );
}

export const IconoBuscar = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Base>
);
/** Carrito: el ícono que la gente ya reconoce en MercadoLibre, Amazon y WebstaurantStore (D-31). */
export const IconoPedido = (p: P) => (
  <Base {...p}>
    <path d="M3 4.5h2.3l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L20.4 8H6.1" />
    <circle cx="9.6" cy="19.6" r="1.4" />
    <circle cx="17" cy="19.6" r="1.4" />
  </Base>
);
export const IconoMenu = (p: P) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);
export const IconoCerrar = (p: P) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
);
/** Globo de chat con teléfono: se usa junto a la palabra «WhatsApp» (sin el logo de la marca). */
export const IconoChat = (p: P) => (
  <Base {...p}>
    <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6L4.5 19.5Z" />
    <path d="M9.3 9.2c.2 1.9 1.8 3.6 3.6 4.1l1-1 1.6.7-.3 1.5c-3 .2-6.1-2.8-6-5.9l1.5-.3.7 1.6-1 1" strokeWidth={1.4} />
  </Base>
);
export const IconoTelefono = (p: P) => (
  <Base {...p}>
    <path d="M5 4h3.2l1.6 4-2 1.3a10 10 0 0 0 6.9 6.9l1.3-2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.5 20 4 13.5 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />
  </Base>
);
export const IconoUbicacion = (p: P) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
);
export const IconoReloj = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);
export const IconoCamion = (p: P) => (
  <Base {...p}>
    <path d="M3 6.5h11v9H3zM14 9.5h3.6l3 3.2v2.8H14" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Base>
);
export const IconoFactura = (p: P) => (
  <Base {...p}>
    <path d="M6.5 3.5h11v17l-2.2-1.4-2.1 1.4-2.2-1.4-2.2 1.4-2.3-1.4V3.5Z" />
    <path d="M9 8h6M9 11.5h6M9 15h3.5" />
  </Base>
);
export const IconoMas = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
export const IconoMenos = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);
export const IconoPapelera = (p: P) => (
  <Base {...p}>
    <path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5" />
  </Base>
);
export const IconoCopiar = (p: P) => (
  <Base {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Base>
);
export const IconoCheck = (p: P) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);
export const IconoFlecha = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);
export const IconoChevron = (p: P) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);
export const IconoAbajo = (p: P) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);
export const IconoLista = (p: P) => (
  <Base {...p}>
    <path d="M9 6.5h10.5M9 12h10.5M9 17.5h10.5" />
    <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" strokeWidth={2.6} />
  </Base>
);
export const IconoInicio = (p: P) => (
  <Base {...p}>
    <path d="M4 11 12 4.5l8 6.5M6 9.5V19.5h4.5v-5h3v5H18V9.5" />
  </Base>
);
export const IconoTienda = (p: P) => (
  <Base {...p}>
    <path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12v8h13v-8M10 20v-4.5h4V20" />
  </Base>
);

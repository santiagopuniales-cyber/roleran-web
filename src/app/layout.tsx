import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/Analytics";
import { ContadorVisitas } from "@/components/ContadorVisitas";
import { Encabezado } from "@/components/encabezado/Encabezado";
import { BarraPedidoMovil } from "@/components/pedido/BarraPedidoMovil";
import { Pie } from "@/components/Pie";
import { SITIO } from "@/config/sitio";
import "./globals.css";

// Archivo variable (OFL) con eje de ancho: una sola fuente para títulos (angosta) y texto (normal).
// Recortada a pesos 400–700, anchos 72–100 % y caracteres del español (scripts/marca/fuente.py): 46 KB en vez de 90.
const archivo = localFont({
  src: "../fuentes/archivo-roleran.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-archivo",
  declarations: [{ prop: "font-stretch", value: "72% 100%" }],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} | Envases descartables en Montevideo`,
    template: `%s | ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  openGraph: {
    type: "website",
    locale: "es_UY",
    siteName: SITIO.nombre,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITIO.nombre}: ${SITIO.lema}` }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#14261b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-UY" className={archivo.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-verde focus:shadow-flotante"
        >
          Saltar al contenido
        </a>
        {SITIO.aviso && (
          <p role="note" className="bg-verde px-4 py-2 text-center text-sm font-semibold text-white">
            {SITIO.aviso}
          </p>
        )}
        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Pie />
        <BarraPedidoMovil />
        <div id="anuncios" aria-live="polite" className="sr-only" />
        <Analytics />
        <ContadorVisitas />
      </body>
    </html>
  );
}

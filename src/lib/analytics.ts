// Google Analytics 4 opcional: si NEXT_PUBLIC_GA_ID está vacío, estas funciones no hacen nada.
// El script se carga en components/Analytics.tsx con gtag(){dataLayer.push(arguments)} (con arguments, no array).

type Gtag = (...args: unknown[]) => void;

export function evento(nombre: string, parametros: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", nombre, parametros);
}

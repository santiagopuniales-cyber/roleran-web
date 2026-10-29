// Dibujos de línea por tipo de producto, para los productos que todavía no tienen foto.
// Mismo trazo y paleta kraft en todos, para que se lean como un sistema y no como un error.

const DIBUJOS: Record<string, React.ReactNode> = {
  bandeja: (
    <>
      <path d="M10 38 18 28h28l8 10-8 6H18z" />
      <path d="M17 36.5 21.5 31h21l4.5 5.5-4.5 3.2H21.5z" />
    </>
  ),
  envase: (
    <>
      <path d="M14 34h36l-3 10H17z" />
      <path d="M13 34c0-6 8-10 19-10s19 4 19 10" />
      <path d="M20 29.5c3-2 7.3-3 12-3" />
    </>
  ),
  pote: (
    <>
      <path d="M19 24h26M20 24l2 22h20l2-22" />
      <path d="M18 19h28v5H18z" />
      <path d="M26 32v8" />
    </>
  ),
  botella: (
    <>
      <path d="M28 12h8v6M27 18h10v4c4 2 6 5 6 9v17H21V31c0-4 2-7 6-9z" />
      <path d="M21 34h22" />
    </>
  ),
  vaso: (
    <>
      <path d="M20 16h24l-3.5 34h-17z" />
      <path d="M19 16h26M22 26h20" />
    </>
  ),
  copa: (
    <>
      <path d="M22 13h20c0 10-4 17-10 17s-10-7-10-17ZM32 30v15M25 47h14" />
    </>
  ),
  caja: (
    <>
      <path d="M12 30 32 22l20 8-20 8z" />
      <path d="M12 30v12l20 8 20-8V30M32 38v12" />
      <path d="M12 30 18 22l20-6 14 14" />
    </>
  ),
  bolsa: (
    <>
      <path d="M18 18h6v6c0 3 3.5 5 8 5s8-2 8-5v-6h6v32H18z" />
      <path d="M18 18l3-5h3l0 5M46 18l-3-5h-3v5" />
    </>
  ),
  "bolsa-papel": (
    <>
      <path d="M19 20h26l2 30H17z" />
      <path d="M19 20l4-7h18l4 7M26 13v7M38 13v7" />
      <path d="M24 26c0 4 3.5 6 8 6s8-2 8-6" />
    </>
  ),
  rodal: (
    <>
      <circle cx="32" cy="32" r="10" />
      <path d="M32 14a3 3 0 0 1 5 1.3 3 3 0 0 1 5.2 2.6 3 3 0 0 1 4.6 4.1 3 3 0 0 1 3.4 5 3 3 0 0 1 1.6 5.6 3 3 0 0 1-.6 5.8 3 3 0 0 1-2.8 5.1 3 3 0 0 1-4.6 3.8 3 3 0 0 1-5.6 1.5 3 3 0 0 1-5.9 0 3 3 0 0 1-5.5-2 3 3 0 0 1-4.2-4.1 3 3 0 0 1-2.4-5.4 3 3 0 0 1-.4-5.8 3 3 0 0 1 1.8-5.5 3 3 0 0 1 3.7-4.6 3 3 0 0 1 5.2-2.4A3 3 0 0 1 32 14Z" />
    </>
  ),
  cubierto: (
    <>
      <path d="M24 12v11c0 3 2 4 2 6v21M20 12v10M28 12v10" />
      <path d="M40 12c4 2 5 8 4 12-.5 2-2 3-3 3.5V50" />
    </>
  ),
  palito: (
    <>
      <path d="M14 46 46 16M18 50 50 20M12 40l30-28" />
      <path d="m44 14 4-1-1 4" />
    </>
  ),
  servilleta: (
    <>
      <path d="M14 26 32 18l18 8-18 8z" />
      <path d="M14 26v6l18 8 18-8v-6M14 32v6l18 8 18-8v-6" />
    </>
  ),
  rollo: (
    <>
      <ellipse cx="24" cy="32" rx="7" ry="12" />
      <ellipse cx="24" cy="32" rx="2.4" ry="4" />
      <path d="M24 20h22M24 44h4l20 4V24" />
    </>
  ),
  torta: (
    <>
      <path d="M17 30h30l-4 18H21z" />
      <path d="M22 30l1.5 18M27 30l.8 18M32 30v18M37 30l-.8 18M42 30l-1.5 18" />
      <path d="M19 30c0-6 5-10 13-10s13 4 13 10" />
    </>
  ),
  fiesta: (
    <>
      <path d="M38 14c6 0 10 5 10 11 0 7-6 12-10 12s-10-5-10-12c0-6 4-11 10-11ZM38 37l-2 3h4zM38 40c0 4-3 6-3 10" />
      <path d="M18 30h6v20h-6zM21 30v-5M21 22c-1.5-1.5-1.5-3 0-5 1.5 2 1.5 3.5 0 5Z" />
    </>
  ),
  cocina: (
    <>
      <path d="M16 26h26v20a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" />
      <path d="M42 30h4a4 4 0 0 1 0 8h-4M16 26l2-6h22l2 6" />
    </>
  ),
  limpieza: (
    <>
      <path d="M18 28h28l-3 22H21z" />
      <path d="M20 28c0-8 5-13 12-13s12 5 12 13" />
      <path d="M24 36h16" />
    </>
  ),
  oficina: (
    <>
      <path d="M18 12h28v40l-4-3-4 3-4-3-4 3-4-3-4 3-4-3z" />
      <path d="M24 22h16M24 28h16M24 34h10" />
    </>
  ),
  embalaje: (
    <>
      <circle cx="26" cy="32" r="13" />
      <circle cx="26" cy="32" r="6" />
      <path d="M26 45h22l2-4H38" />
    </>
  ),
  hogar: (
    <>
      <path d="M14 26h36v22H14z" />
      <path d="M12 20h40v6H12zM27 33h10" />
    </>
  ),
};

export function Placeholder({ tipo, className = "" }: { tipo: string; className?: string }) {
  const dibujo = DIBUJOS[tipo] ?? DIBUJOS.caja;
  return (
    <div className={`flex h-full w-full items-center justify-center bg-kraft-claro ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className="h-1/2 w-1/2 text-[#9a7a52]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dibujo}
      </svg>
    </div>
  );
}

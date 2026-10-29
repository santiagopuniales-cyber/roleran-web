// Logo de Roleran S.A.: el original de la marca (data/raw/marca/logo-main.png) reducido sin pérdida (scripts/marca/logo.mjs).
export function Logo({ alto = 40, className = "" }: { alto?: number; className?: string }) {
  const ancho = Math.round((alto * 1193) / 300);
  return (
    <picture className={className}>
      <source type="image/webp" srcSet="/marca/logo-40.webp 1x, /marca/logo-80.webp 2x" />
      { }
      <img src="/marca/logo-80.png" alt="Roleran S.A." width={ancho} height={alto} className="block" style={{ height: alto, width: ancho }} fetchPriority="low" decoding="async" />
    </picture>
  );
}

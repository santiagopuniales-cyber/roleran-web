// Estado vacío diseñado (pedido vacío, búsqueda sin resultados).
export function EstadoVacio({ titulo, texto, dibujo = "bolsa", children }: { titulo: string; texto: React.ReactNode; dibujo?: "bolsa" | "lupa"; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-panel border border-dashed border-kraft bg-white px-6 py-12 text-center">
      <svg viewBox="0 0 120 100" className="h-28 w-32 text-[#9a7a52]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="60" cy="90" rx="38" ry="5" fill="#f3e9da" stroke="none" />
        {dibujo === "bolsa" ? (
          <>
            <path d="M34 30h52l-4 56H38z" fill="#fbf6ee" />
            <path d="M46 30c0-10 6-16 14-16s14 6 14 16" />
            <path d="M48 52h24" strokeDasharray="3 5" />
          </>
        ) : (
          <>
            <circle cx="54" cy="46" r="22" fill="#fbf6ee" />
            <path d="m70 62 18 18" strokeWidth={5} />
            <path d="M46 44h16" strokeDasharray="3 5" />
          </>
        )}
      </svg>
      <h2 className="mt-4 text-2xl md:text-3xl">{titulo}</h2>
      <div className="mt-2 max-w-md text-tinta-suave">{texto}</div>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

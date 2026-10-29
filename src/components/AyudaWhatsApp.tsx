// Caja de ayuda: «¿No encontrás lo que buscás?» con enlace a WhatsApp.
import { BotonWhatsApp } from "@/components/BotonWhatsApp";

export function AyudaWhatsApp({ tema }: { tema?: string }) {
  return (
    <aside className="flex flex-col items-start justify-between gap-4 rounded-panel border border-kraft bg-kraft-claro/70 p-6 md:flex-row md:items-center">
      <div>
        <p className="titulo text-2xl">¿No encontrás lo que buscás?</p>
        <p className="mt-1 text-kraft-tinta">
          Escribinos con el nombre, la medida o una foto y te respondemos si lo tenemos.
        </p>
      </div>
      <BotonWhatsApp mensaje={`Estoy buscando${tema ? ` ${tema}` : ""}: `} className="shrink-0">
        Preguntar por WhatsApp
      </BotonWhatsApp>
    </aside>
  );
}

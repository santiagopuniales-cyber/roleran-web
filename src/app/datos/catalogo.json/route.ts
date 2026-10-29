import { obtenerCategorias } from "@/lib/catalogo";
import { itemsExplorador, ordenarPorRelevancia } from "@/lib/explorador";

export const dynamic = "force-static";

export function GET() {
  const orden = Object.fromEntries(obtenerCategorias().map((c) => [c.slug, c.orden]));
  return Response.json(ordenarPorRelevancia(itemsExplorador(), orden));
}

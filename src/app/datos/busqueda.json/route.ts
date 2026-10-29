import { construirIndice } from "@/lib/busqueda/indice";

export const dynamic = "force-static";

export function GET() {
  return Response.json(construirIndice());
}

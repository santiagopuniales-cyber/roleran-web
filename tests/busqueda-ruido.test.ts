// La búsqueda no trae «cualquier cosa» ni deja afuera lo que corresponde (4/11: «papelera» traía toda la papelería).
// Regla: la tolerancia a errores de tipeo es solo para palabras que no existen en el catálogo.
import MiniSearch from "minisearch";
import { describe, expect, test } from "vitest";
import { buscar, desdeJSON } from "@/lib/busqueda/cliente";
import { construirIndice } from "@/lib/busqueda/indice";
import { OPCIONES_BUSQUEDA, procesarTermino, tokenizar } from "@/lib/busqueda/normalizar";
import catalogo from "../data/catalogo.json";

const datos = desdeJSON(JSON.parse(JSON.stringify(construirIndice())), MiniSearch);
const productos = (catalogo as { productos: { visible: boolean; nombre: string }[] }).productos.filter((p) => p.visible);
const nombres = (q: string) => buscar(datos, q, 500).map((r) => r.nombre);

describe("búsqueda sin ruido", () => {
  test("cada palabra del catálogo trae exactamente los productos que la tienen", () => {
    const palabras = new Set(productos.flatMap((p) => tokenizar(p.nombre)).filter((t) => t.length >= 5 && !/\d/.test(t)));
    const opciones = { ...OPCIONES_BUSQUEDA, tokenize: tokenizar, processTerm: procesarTermino, fuzzy: false };
    const mal: string[] = [];
    for (const w of palabras) {
      const esperados = new Set(datos.ms.search(w, opciones).map((r) => r.id as string));
      const obtenidos = new Set(buscar(datos, w, 1000).map((r) => r.id));
      const ruido = [...obtenidos].filter((id) => !esperados.has(id)).length;
      const perdidos = [...esperados].filter((id) => !obtenidos.has(id)).length;
      if (ruido || perdidos) mal.push(`${w}: ${ruido} de más, ${perdidos} de menos`);
    }
    expect(palabras.size).toBeGreaterThan(300);
    expect(mal).toEqual([]);
  });

  test("«papelera» no trae artículos de papelería ni dispensadores", () => {
    const r = nombres("papelera");
    expect(r.slice(0, 2).every((n) => /^Papelera/.test(n))).toBe(true);
    expect(r.some((n) => /Tijera|Cuadernola|Calculadora|Marcador|Dispensador/.test(n))).toBe(false);
    expect(r.some((n) => /Basurero|Tarro de basura/.test(n))).toBe(true);
  });

  test("una palabra que existe no se confunde con otra parecida", () => {
    for (const [q, nunca] of [
      ["pollo", /^Rollo/],
      ["banco", /blanco/i],
      ["comoda", /comida/i],
      ["frutas", /fritas/i],
      ["ganchos", /pancho/i],
      ["papeleria", /^Papelera/],
    ] as const) {
      expect(nombres(q).some((n) => nunca.test(n)), q).toBe(false);
    }
  });

  test("masculino y femenino de un adjetivo son lo mismo", () => {
    expect(nombres("negra").some((n) => /negros?\b/i.test(n))).toBe(true);
    expect(nombres("negro").some((n) => /negras?\b/i.test(n))).toBe(true);
    expect(nombres("bandeja redondo").some((n) => /redonda/i.test(n))).toBe(true);
    expect(nombres("cuchara plastica").some((n) => /plásticas/i.test(n))).toBe(true);
    // Pero no se juntan sustantivos distintos.
    expect(nombres("manga").some((n) => /mango/i.test(n) && !/manga/i.test(n))).toBe(false);
  });

  test("un error de tipeo en una palabra que no existe se sigue corrigiendo", () => {
    expect(nombres("servileta")[0]).toMatch(/Servilleta/);
    expect(nombres("bandeha")[0]).toMatch(/Bandeja/);
    expect(nombres("cucharra")[0]).toMatch(/Cuchar/);
  });
});

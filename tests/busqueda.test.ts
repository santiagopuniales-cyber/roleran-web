// Pruebas del buscador con consultas reales (cómo escribe la gente en Uruguay: sinónimos, plurales, errores, códigos).
// Con `vitest run --mode doc` además regenera docs/PRUEBAS-BUSQUEDA.md con los resultados obtenidos.
import { writeFileSync } from "node:fs";
import MiniSearch from "minisearch";
import { afterAll, describe, expect, test } from "vitest";
import { buscar, desdeJSON, type Resultado } from "@/lib/busqueda/cliente";
import { construirIndice } from "@/lib/busqueda/indice";

const datos = desdeJSON(JSON.parse(JSON.stringify(construirIndice())), MiniSearch);

interface Caso {
  q: string;
  tipo: string;
  espera: string;
  /** El primer resultado tiene que cumplir esto. */
  primero?: (r: Resultado) => boolean;
  /** Los tres primeros resultados tienen que cumplir esto. */
  tres?: (r: Resultado) => boolean;
  /** Sin resultados. */
  vacio?: boolean;
}

const nombre = (re: RegExp) => (r: Resultado) => re.test(r.nombre);
const categoria = (c: string) => (r: Resultado) => r.categoriaNombre === c;
const codigo = (c: string) => (r: Resultado) => r.sku === c;

const CASOS: Caso[] = [
  { q: "vaso 550", tipo: "medida", espera: "Vaso 550 cc primero", primero: nombre(/^Vaso 550 cc/) },
  { q: "vasos 550 cc", tipo: "plural y unidad", espera: "Vaso 550 cc primero", primero: nombre(/^Vaso 550 cc/) },
  { q: "vaso 1 litro", tipo: "equivalencia de unidad", espera: "Vaso 1000 cc primero", primero: nombre(/^Vaso 1000 cc/) },
  { q: "vaso", tipo: "genérico", espera: "Vasos arriba", tres: nombre(/^Vaso/) },
  { q: "vaso termico", tipo: "sin tilde", espera: "Vasos térmicos", tres: categoria("Vasos térmicos") },
  { q: "copa", tipo: "genérico", espera: "Copas y vasos para tragos", tres: categoria("Copas y vasos para tragos") },
  { q: "shot", tipo: "genérico", espera: "Vasos shot", tres: nombre(/shot/i) },
  { q: "bandeja espumaplast", tipo: "genérico", espera: "Bandejas de espumaplast", tres: categoria("Bandejas de espumaplast") },
  { q: "bandeja telgopor", tipo: "sinónimo", espera: "Bandejas de espumaplast", tres: categoria("Bandejas de espumaplast") },
  { q: "espumaplas", tipo: "palabra incompleta", espera: "Productos de espumaplast", tres: nombre(/espumaplast/i) },
  { q: "bandeja espumaplat", tipo: "error de tipeo", espera: "Bandejas de espumaplast", tres: categoria("Bandejas de espumaplast") },
  { q: "bandeja aluminio con tapa", tipo: "varias palabras", espera: "Bandejas de aluminio con tapa", tres: nombre(/aluminio.*con tapa/) },
  { q: "alumino", tipo: "error de tipeo", espera: "Productos de aluminio", tres: nombre(/aluminio/i) },
  { q: "papel aluminio", tipo: "genérico", espera: "Rollos de papel aluminio", tres: nombre(/papel aluminio/) },
  { q: "rollo aluminio", tipo: "genérico", espera: "Rollos de papel aluminio", tres: nombre(/papel aluminio/) },
  { q: "papel film", tipo: "genérico", espera: "Rollos de film de cocina", tres: categoria("Film, aluminio y papel de cocina") },
  { q: "film stretch", tipo: "sinónimo", espera: "Film para paletizar", tres: nombre(/paletizar/) },
  { q: "papel manteca", tipo: "genérico", espera: "Papel manteca", tres: nombre(/manteca/) },
  { q: "caja pizza", tipo: "genérico", espera: "Cajas para pizza", tres: categoria("Cajas para pizza") },
  { q: "caja de pizza 33", tipo: "medida", espera: "Cajas de 33 × 33 cm", tres: nombre(/33 × 33/) },
  { q: "caja chivito", tipo: "genérico", espera: "Cajas para chivito", primero: nombre(/chivito/) },
  { q: "caja hamburguesa", tipo: "genérico", espera: "Caja para hamburguesa", primero: nombre(/hamburguesa/) },
  { q: "cono papas", tipo: "genérico", espera: "Cono para papas fritas primero", primero: nombre(/papas fritas/) },
  { q: "portapancho", tipo: "palabra junta", espera: "Cartones y bandejas para pancho", tres: nombre(/pancho/) },
  { q: "pochoclo", tipo: "sinónimo uruguayo", espera: "Conos para pop", primero: nombre(/pop/) },
  { q: "bolsa camiseta", tipo: "genérico", espera: "Bolsas camiseta", tres: categoria("Bolsas camiseta") },
  { q: "bolsas camiseta 40x50", tipo: "medida pegada", espera: "Bolsas camiseta 40 × 50 cm", tres: nombre(/camiseta.*40 × 50/) },
  { q: "bolsa basura consorcio", tipo: "sinónimo", espera: "Bolsas de residuos", tres: categoria("Bolsas de residuos") },
  { q: "bolsa residuos negra", tipo: "color", espera: "Bolsas de residuos negras primero", primero: nombre(/residuos.*negras/) },
  { q: "bolsa kraft", tipo: "material", espera: "Bolsas de papel kraft", tres: nombre(/kraft/) },
  { q: "bolsa vacio", tipo: "sin tilde", espera: "Bolsas para vacío", tres: categoria("Bolsas para vacío") },
  { q: "nailon", tipo: "otra grafía", espera: "Productos de nylon", tres: nombre(/nylon/i) },
  { q: "pirotines", tipo: "sinónimo uruguayo", espera: "Casquetes y pirotines", tres: categoria("Pirotines y moldes de papel") },
  { q: "blonda", tipo: "genérico", espera: "Blondas", tres: nombre(/blonda/i) },
  { q: "rodal", tipo: "genérico", espera: "Rodales", tres: nombre(/Rodal/) },
  { q: "servilletas", tipo: "plural", espera: "Servilletas", tres: categoria("Servilletas") },
  { q: "servileta", tipo: "error de tipeo", espera: "Servilletas", tres: categoria("Servilletas") },
  { q: "servilleta 33x33", tipo: "medida", espera: "Servilletas de 33 × 33 cm", primero: nombre(/Servilleta.*33 × 33/) },
  { q: "pajitas", tipo: "sinónimo", espera: "Sorbitos primero", primero: nombre(/Sorbito/) },
  { q: "sorbete", tipo: "sinónimo", espera: "Sorbitos primero", primero: nombre(/Sorbito/) },
  { q: "tenedor", tipo: "singular", espera: "Tenedores", primero: nombre(/Tenedor/) },
  { q: "cucharita", tipo: "diminutivo", espera: "Cucharitas", primero: nombre(/Cuchar/) },
  { q: "pote 250", tipo: "medida", espera: "Potes de 250", tres: nombre(/250/) },
  { q: "pote helado", tipo: "genérico", espera: "Potes térmicos para helado", tres: categoria("Potes térmicos para helado") },
  { q: "dips", tipo: "genérico", espera: "Potes dip", tres: (r) => /dip|salsa/i.test(r.nombre) },
  { q: "ensaladera", tipo: "genérico", espera: "Ensaladeras", primero: nombre(/Ensaladera/) },
  { q: "tapa para vaso", tipo: "genérico", espera: "Tapas o vasos con tapa", tres: nombre(/tapa/i) },
  { q: "guantes", tipo: "plural", espera: "Guantes", tres: nombre(/Guantes/) },
  { q: "cofia", tipo: "genérico", espera: "Cofias", primero: nombre(/Cofia/) },
  { q: "rollo registradora", tipo: "genérico", espera: "Rollos para registradora", tres: nombre(/registradora/) },
  { q: "cinta embalar", tipo: "uso", espera: "Cintas adhesivas", tres: categoria("Cintas adhesivas") },
  { q: "cinta scotch", tipo: "marca usada como genérico", espera: "Cintas adhesivas", tres: categoria("Cintas adhesivas") },
  { q: "precinto", tipo: "genérico", espera: "Precintos primero", primero: nombre(/Precinto/) },
  { q: "papel higienico", tipo: "sin tilde", espera: "Papel higiénico", tres: nombre(/Papel higiénico/) },
  { q: "lavandina", tipo: "sinónimo", espera: "Hipoclorito", primero: nombre(/Hipoclorito/) },
  { q: "bidon", tipo: "sin tilde", espera: "Productos de limpieza en bidón", tres: categoria("Productos de limpieza") },
  { q: "escoba", tipo: "genérico", espera: "Escoba primero", primero: nombre(/^Escoba/) },
  { q: "globos", tipo: "plural", espera: "Velas y globos", tres: categoria("Velas y globos") },
  { q: "contenedor 9 litros", tipo: "medida en litros", espera: "Contenedor de 9 L", primero: nombre(/Contenedor.*9 L/) },
  { q: "V550X1000", tipo: "código exacto", espera: "Ese producto primero", primero: codigo("V550X1000") },
  { q: "pizmar33", tipo: "código en minúsculas", espera: "Ese producto primero", primero: codigo("PIZMAR33") },
  { q: "D18X400", tipo: "código exacto", espera: "Ese producto primero", primero: codigo("D18X400") },
  { q: "besp110", tipo: "parte del código", espera: "Productos cuyo código empieza así", tres: (r) => /^BESP110/.test(r.sku ?? "") || /110/.test(r.nombre) },
  { q: "qwxzy", tipo: "sin coincidencias", espera: "Ningún resultado (muestra la ayuda por WhatsApp)", vacio: true },
];

const filas: string[] = [];

describe("buscador", () => {
  for (const c of CASOS) {
    test(`«${c.q}» → ${c.espera}`, () => {
      const r = buscar(datos, c.q, 500);
      const ok = c.vacio
        ? r.length === 0
        : (!c.primero || (r[0] !== undefined && c.primero(r[0]))) && (!c.tres || (r.length > 0 && r.slice(0, 3).every(c.tres)));
      filas.push(
        `| \`${c.q}\` | ${c.tipo} | ${c.espera} | ${r.length} | ${r.slice(0, 3).map((x) => x.nombre.replace(/\|/g, "/")).join("<br>") || "—"} | ${ok ? "Sí" : "**No**"} |`,
      );
      expect(ok, `primeros: ${r.slice(0, 3).map((x) => x.nombre).join(" · ")}`).toBe(true);
    });
  }
});

afterAll(() => {
  if (import.meta.env.MODE !== "doc") return;
  const ok = filas.filter((f) => f.endsWith("Sí |")).length;
  writeFileSync(
    "docs/PRUEBAS-BUSQUEDA.md",
    `# Pruebas del buscador

Consultas reales, escritas como las escribe la gente (sinónimos uruguayos, plurales, sin tildes, errores de tipeo, medidas pegadas y códigos).
Se corren con \`npm test\` (archivo \`tests/busqueda.test.ts\`); este documento se regenera con \`npm run pruebas:busqueda\`.

**Resultado: ${ok} de ${filas.length} consultas devuelven lo esperado arriba de todo.**

Criterio: cuando dice «primero», el primer resultado tiene que ser ese; en el resto, los tres primeros resultados tienen que ser de lo esperado.

| Consulta | Tipo | Qué se espera | Resultados | Tres primeros | OK |
|---|---|---|---:|---|---|
${filas.join("\n")}

## Cómo funciona

- El índice (\`/datos/busqueda.json\`) se arma en el build con MiniSearch y se descarga recién cuando alguien toca el buscador.
- La misma normalización corre en el build y en el navegador (\`src/lib/busqueda/normalizar.ts\`): minúsculas, sin tildes, singular, unidades separadas de los números (\`550cc\` → \`550 cc\`), medidas pegadas (\`40x50\`) y sinónimos (telgopor → espumaplast, pajita → sorbito, pirotín → casquete, lavandina → hipoclorito, consorcio/basura → residuo, stretch → paletizar, ml → cc, litro → l, entre otros).
- Equivalencias de capacidad: los productos de 500 cc o más se indexan también en litros, y los de hasta 5 L también en cc.
- Pesos: nombre ×3, código ×3, sinónimos ×1,6, categoría ×1,2, atributos ×0,8. Busca con todas las palabras; si no hay nada, acepta productos con alguna.
- Errores de tipeo: 1 letra en palabras de 5 a 8 letras y 2 en las más largas. La última palabra se busca también como comienzo (mientras se escribe).
- Códigos: si la consulta coincide con un código exacto o con el comienzo de un código, ese producto va primero.
`,
  );
});

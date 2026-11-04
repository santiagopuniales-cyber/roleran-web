"use client";
// Buscador en el navegador: descarga el índice y la librería (MiniSearch) recién la primera vez que se usa.
import type MiniSearch from "minisearch";
import type { AsPlainObject, SearchResult } from "minisearch";
import { normalizarCodigo, OPCIONES_BUSQUEDA, OPCIONES_INDICE, procesarTermino, tokenizar } from "./normalizar";

export interface Resultado {
  id: string;
  slug: string;
  nombre: string;
  sku: string | null;
  presentacion: string;
  imagen: string | null;
  placeholder: string;
  categoriaNombre: string;
  paso: number;
  minimo: number;
}

export interface Datos {
  ms: MiniSearch;
  codigos: Record<string, string>;
}

let promesa: Promise<Datos> | null = null;

/** Arma el buscador a partir del JSON del índice (el mismo que se sirve en /datos/busqueda.json). */
export function desdeJSON({ indice, codigos }: { indice: AsPlainObject; codigos: Record<string, string> }, Clase: typeof MiniSearch): Datos {
  return {
    ms: Clase.loadJS(indice, {
      fields: [...OPCIONES_INDICE.fields],
      storeFields: [...OPCIONES_INDICE.storeFields],
      tokenize: (texto: string, campo?: string) => (campo === "codigo" ? [normalizarCodigo(texto)] : tokenizar(texto)),
      processTerm: (t: string, campo?: string) => (campo === "codigo" ? t : procesarTermino(t)),
    }),
    codigos,
  };
}

export function cargarIndice(): Promise<Datos> {
  if (!promesa) {
    const json = fetch("/datos/busqueda.json").then((r) => {
      if (!r.ok) throw new Error(`índice ${r.status}`);
      return r.json();
    });
    promesa = Promise.all([json, import("minisearch")])
      .then(([datos, modulo]) => desdeJSON(datos, modulo.default))
      .catch((e) => {
        promesa = null;
        throw e;
      });
  }
  return promesa;
}

function aResultado(r: SearchResult): Resultado {
  return {
    id: r.id as string,
    slug: r.slug,
    nombre: r.nombre,
    sku: r.sku,
    presentacion: r.presentacion,
    imagen: r.imagen,
    placeholder: r.placeholder,
    categoriaNombre: r.categoriaNombre,
    paso: r.paso,
    minimo: r.minimo,
  };
}

/**
 * Primero los que tienen foto, sin perder relevancia. Los resultados se separan en dos grupos: los que
 * encajan casi tan bien como el mejor (70 % de su puntaje o más) y el resto; dentro de cada grupo van
 * primero los que tienen foto. Así el producto claramente buscado queda arriba aunque no tenga foto
 * («cono papas» → «Cono para papas fritas»), y entre parecidos («pote 250») suben los que se ven.
 * Si la búsqueda cayó a «alguna palabra», antes que nada va el que encontró más palabras.
 */
const PARECIDO_AL_MEJOR = 0.7;
function primeroConFoto(resultados: SearchResult[]): SearchResult[] {
  const mejor = resultados[0]?.score ?? 0;
  const grupo = (r: SearchResult) => (r.score >= mejor * PARECIDO_AL_MEJOR ? 0 : 1);
  return [...resultados].sort(
    (a, b) =>
      b.queryTerms.length - a.queryTerms.length ||
      grupo(a) - grupo(b) ||
      Number(!a.imagen) - Number(!b.imagen) ||
      b.score - a.score,
  );
}

export function buscar({ ms, codigos }: Datos, consulta: string, limite = 50): Resultado[] {
  const q = consulta.trim();
  if (!q) return [];
  const opciones = { ...OPCIONES_BUSQUEDA, tokenize: tokenizar, processTerm: procesarTermino };
  let resultados = ms.search(q, opciones);
  const codigo = normalizarCodigo(q);
  const pareceCodigo = codigo.length >= 3 && /\d/.test(codigo);
  const exacto = pareceCodigo ? codigos[codigo] : undefined;
  // Si ningún producto tiene todas las palabras, se aceptan los que tengan alguna (salvo que sea un código exacto).
  if (resultados.length === 0 && !exacto) resultados = ms.search(q, { ...opciones, combineWith: "OR" });
  resultados = primeroConFoto(resultados);

  // Código exacto o prefijo de código: va primero.
  if (pareceCodigo) {
    const prefijo = Object.entries(codigos)
      .filter(([c]) => c !== codigo && c.startsWith(codigo))
      .map(([, id]) => id);
    const primeros = [exacto, ...prefijo].filter(Boolean) as string[];
    if (primeros.length) {
      const extra = primeros
        .filter((id) => !resultados.some((r) => r.id === id))
        .map((id) => ({ id, campos: ms.getStoredFields(id) }))
        .filter(({ campos }) => campos)
        .map(({ id, campos }) => ({ ...campos, id, score: 0, terms: [], queryTerms: [], match: {} }) as unknown as SearchResult);
      const todos = [...resultados, ...extra];
      resultados = [
        ...primeros.map((id) => todos.find((r) => r.id === id)).filter(Boolean),
        ...todos.filter((r) => !primeros.includes(r.id as string)),
      ] as SearchResult[];
    }
  }
  return resultados.slice(0, limite).map(aResultado);
}

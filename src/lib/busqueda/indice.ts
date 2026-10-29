// Construye el índice de búsqueda en build (se sirve como /datos/busqueda.json y se carga recién al usar el buscador).
import "server-only";
import MiniSearch from "minisearch";
import { obtenerCategoria, obtenerProductos, placeholderDe, rutaCategoria } from "@/lib/catalogo";
import { normalizarCodigo, OPCIONES_INDICE, procesarTermino, tokenizar } from "./normalizar";

/** Sinónimos por categoría: palabras con las que la gente busca lo que hay en cada una. */
const SINONIMOS_CATEGORIA: Record<string, string> = {
  "bandejas-de-espumaplast": "telgopor espuma eps poliestireno expandido bandeja carniceria verduleria",
  "bandejas-de-carton": "carton bandeja masas sandwiches",
  "bandejas-de-aluminio": "aluminio descartable delivery comida horno",
  "blondas-rodales-y-bases": "blonda rodal base torta puntilla",
  "envases-pp-y-pet": "envase plastico transparente cristal microondas freezer tapa",
  "potes-con-tapa": "pote envase plastico tapa salsa aderezo",
  "potes-termicos-para-helado": "pote helado telgopor espumaplast termico",
  "frascos-y-botellas": "frasco botella envase plastico",
  "vasos-plasticos": "vaso plastico descartable",
  "vasos-termicos": "vaso termico cafe telgopor espumaplast",
  "vasos-de-polipapel": "vaso carton papel cafe",
  "copas-y-vasos-para-tragos": "copa trago acrilico",
  "cajas-para-pizza": "caja pizza carton",
  "cajas-para-masas-y-postres": "caja masas postre torta carton cartulina",
  "cajas-para-comidas": "caja carton comida delivery take away",
  "conos-y-portapanchos": "cono pancho papas fritas pop carton",
  "bolsas-camiseta": "bolsa camiseta nylon supermercado asa",
  "bolsas-de-residuos": "bolsa residuo basura consorcio nylon negra",
  "bolsas-de-papel": "bolsa papel kraft",
  "bolsas-en-rollo": "bolsa rollo nylon transparente",
  "bolsas-para-vacio": "bolsa vacio envasadora",
  "bolsas-de-nylon-por-kilo": "bolsa nylon kilo transparente",
  "bolsas-impresas": "bolsa impresa nylon",
  "bobinas-de-nylon": "bobina nylon tubular",
  "cubiertos-y-platos": "cubierto descartable plastico",
  "sorbitos-y-mezcladores": "sorbito pajita mezclador revolvedor",
  "mondadientes-y-palitos": "palito palillo madera",
  servilletas: "servilleta papel",
  "toallas-y-rollos-de-cocina": "toalla papel rollo cocina",
  "papel-higienico": "papel higienico rollo baño",
  "film-aluminio-y-papel-de-cocina": "papel film aluminio cocina",
  "papel-para-envolver": "papel envolver rollo",
  "pirotines-y-moldes-de-papel": "pirotin casquete molde papel reposteria",
  "mangas-y-reposteria": "reposteria torta",
  "velas-y-globos": "cumpleaños fiesta",
  "utensilios-de-cocina": "cocina utensilio",
  "contenedores-y-cajones": "contenedor cajon plastico",
  "articulos-de-limpieza": "limpieza",
  "productos-de-limpieza": "limpieza bidon",
  "guantes-y-cofias": "guante cofia descartable",
  "basureros-y-dispensadores": "basurero tacho papelera dispensador",
  "rollos-y-etiquetas": "rollo papel registradora ticket etiqueta",
  papeleria: "oficina libreria",
  "rotuladoras-y-turnos": "rotuladora etiquetadora turno",
  "cintas-adhesivas": "cinta adhesiva scotch embalar",
  "hilos-y-rafia": "hilo piolin",
  "mallas-y-precintos": "malla precinto",
  "film-para-embalar": "film embalar paletizar stretch",
  selladoras: "selladora termoselladora",
  organizacion: "organizador caja",
  bano: "baño",
  macetas: "maceta planta",
  "otros-hogar": "hogar",
};

/** Equivalencias de capacidad para que «1 litro» encuentre «1000 cc» y al revés. */
export function equivalencias(texto: string): string {
  const extra: string[] = [];
  for (const m of texto.matchAll(/(\d+(?:[.,]\d+)?)\s*(cc|ml)\b/gi)) {
    const n = Number(m[1].replace(",", "."));
    if (n >= 500 && n % 250 === 0) extra.push(`${n / 1000} l`);
  }
  for (const m of texto.matchAll(/(\d+(?:[.,]\d+)?)\s*(l|litros?|lts?)\b/gi)) {
    const n = Number(m[1].replace(",", "."));
    if (n > 0 && n <= 5) extra.push(`${Math.round(n * 1000)} cc`);
  }
  return [...new Set(extra)].join(" ");
}

export function construirIndice() {
  const ms = new MiniSearch({
    idField: "id",
    fields: [...OPCIONES_INDICE.fields],
    storeFields: [...OPCIONES_INDICE.storeFields],
    tokenize: (texto: string, campo?: string) => (campo === "codigo" ? [normalizarCodigo(texto)] : tokenizar(texto)),
    processTerm: (t: string, campo?: string) => (campo === "codigo" ? t : procesarTermino(t)),
  });
  const docs = obtenerProductos().map((p) => {
    const ruta = rutaCategoria(p.categoria);
    const secundarias = p.categoriasSecundarias.map((s) => obtenerCategoria(s)?.nombre ?? "");
    const a = p.atributos;
    return {
      id: p.id,
      slug: p.slug,
      nombre: p.nombre,
      sku: p.sku,
      codigo: p.sku ?? "",
      presentacion: p.presentacion.texto,
      imagen: p.imagenes[0] ? `${p.imagenes[0].base}-${p.imagenes[0].tamanos[0]}` : null,
      placeholder: placeholderDe(p),
      categoriaNombre: ruta.at(-1)?.nombre ?? "",
      categoria: [...ruta.map((c) => c.nombre), ...secundarias, SINONIMOS_CATEGORIA[p.categoria] ?? ""].join(" "),
      sinonimos: [...p.sinonimos, p.nombreOriginal].join(" "),
      atributos: [a.material, a.color, a.capacidad, a.medidas, a.marca, p.presentacion.texto, equivalencias(`${p.nombre} ${a.capacidad ?? ""}`)].filter(Boolean).join(" "),
      paso: p.paso,
      minimo: p.minimo,
    };
  });
  ms.addAll(docs);
  return {
    indice: ms.toJSON(),
    codigos: Object.fromEntries(docs.filter((d) => d.codigo).map((d) => [normalizarCodigo(d.codigo), d.id])),
  };
}

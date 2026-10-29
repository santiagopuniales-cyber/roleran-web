// Descripciones generadas SOLO con datos del producto (nombre, SKU, atributos, descripción original).
// Nada de promesas, usos dudosos ni adjetivos de relleno.
import { miles } from "./texto.mjs";

// Uso general de cada subcategoría: frases neutras y verdaderas para cualquier producto del grupo.
export const USOS = {
  "bandejas-de-espumaplast": "Para envasar, exhibir y llevar alimentos.",
  "bandejas-de-carton": "Para presentar y llevar masas, sándwiches, tortas y otros alimentos.",
  "bandejas-de-aluminio": "Para cocinar, congelar y entregar comidas.",
  "blondas-rodales-y-bases": "Para presentar tortas, masas y bocados.",
  "envases-pp-y-pet": "Envase transparente para guardar, exhibir y llevar alimentos.",
  "potes-con-tapa": "Para envasar y llevar comidas, salsas y postres.",
  "potes-termicos-para-helado": "Para envasar y llevar helado.",
  "frascos-y-botellas": "Para fraccionar y envasar.",
  "vasos-plasticos": "Para servir bebidas.",
  "vasos-termicos": "Para servir bebidas.",
  "vasos-de-polipapel": "Para servir bebidas frías y calientes.",
  "copas-y-vasos-para-tragos": "Para servir bebidas y postres.",
  "cajas-para-pizza": "Para entregar y llevar pizza.",
  "cajas-para-masas-y-postres": "Para llevar masas, tortas y postres.",
  "cajas-para-comidas": "Para entregar y llevar comida.",
  "conos-y-portapanchos": "Para servir papas fritas, pop y panchos.",
  "bolsas-camiseta": "Bolsa con asas para entregar compras.",
  "bolsas-de-residuos": "Para residuos.",
  "bolsas-de-papel": "Para entregar y llevar productos.",
  "bolsas-en-rollo": "Para fraccionar y entregar mercadería.",
  "bolsas-para-vacio": "Para envasar al vacío.",
  "bolsas-de-nylon-por-kilo": "Para fraccionar y envasar.",
  "bolsas-impresas": "Para envasar y presentar productos.",
  "bobinas-de-nylon": "Para embalar, cubrir y transportar.",
  "cubiertos-y-platos": "Descartables para servir y comer.",
  "sorbitos-y-mezcladores": "Para bebidas, café y tragos.",
  "mondadientes-y-palitos": "Para servir bocados, brochettes y copetines.",
  servilletas: "Para la mesa, el mostrador y el servilletero.",
  "toallas-y-rollos-de-cocina": "Para secar y limpiar.",
  "papel-higienico": "",
  "film-aluminio-y-papel-de-cocina": "Para envolver, cubrir y cocinar alimentos.",
  "papel-para-envolver": "Para envolver y embalar en el mostrador.",
  "pirotines-y-moldes-de-papel": "Para hornear y presentar.",
  "mangas-y-reposteria": "Para preparar y decorar tortas.",
  "velas-y-globos": "Para cumpleaños y fiestas.",
  "utensilios-de-cocina": "",
  "contenedores-y-cajones": "Para guardar, transportar y organizar.",
  "articulos-de-limpieza": "",
  "productos-de-limpieza": "",
  "guantes-y-cofias": "Para trabajar con higiene.",
  "basureros-y-dispensadores": "",
  "rollos-y-etiquetas": "",
  papeleria: "",
  "rotuladoras-y-turnos": "",
  "cintas-adhesivas": "Para cerrar cajas, embalar y rotular.",
  "hilos-y-rafia": "Para atar, cerrar bolsas y embalar.",
  "mallas-y-precintos": "Para atar, cerrar y presentar productos.",
  "film-para-embalar": "Para embalar y proteger mercadería.",
  selladoras: "Para sellar bolsas.",
  organizacion: "Para ordenar y guardar.",
  bano: "",
  macetas: "",
  "otros-hogar": "",
};

/** Texto de la presentación para una oración: "Se vende por caja de 1.000 unidades." */
export function oracionPresentacion(pres) {
  if (!pres) return "";
  const u = pres.unidades ? miles(pres.unidades) : null;
  const det = pres.detalle ?? "unidades";
  let base = "";
  switch (pres.tipo) {
    case "caja": base = `caja de ${u} ${det}`; break;
    case "funda": base = `funda de ${u} ${det}`; break;
    case "paquete": base = u ? `paquete de ${u} ${det}` : `paquete de ${pres.detalle}`; break;
    case "tubo": base = `tubo de ${u} ${det}`; break;
    case "rollo": base = u ? `rollo de ${u} ${det}` : "rollo"; break;
    case "kg": return "Se vende por kilo.";
    case "metro": return "Se vende por metro.";
    case "unidad": return "Se vende por unidad.";
    case "consultar": return "Se vende por unidad o por mayor; consultanos cómo viene envasado.";
    default: return "";
  }
  if (pres.fuente === "codigo" || pres.fuente === "ficha") return `Viene en ${base}.`;
  return `Se vende por ${base}${pres.aprox ? " aproximadamente" : ""}.`;
}

export function generarDescripciones(prod, { uso, notas }) {
  const partes = [];
  const fraseUso = uso ?? USOS[prod.categoria] ?? "";
  if (fraseUso) partes.push(fraseUso);
  for (const n of notas ?? []) partes.push(n);
  const pres = oracionPresentacion(prod.presentacion);
  if (pres) partes.push(pres);
  const descripcion = partes.join(" ").trim();

  const bits = [prod.nombre];
  const corta = [prod.nombre + "."];
  if (prod.presentacion && prod.presentacion.tipo !== "consultar") corta.push(prod.presentacion.texto.replace(/\.$/, "") + ".");
  if (fraseUso) corta.push(fraseUso);
  return { descripcion, descripcionCorta: corta.join(" ").slice(0, 200), _bits: bits };
}

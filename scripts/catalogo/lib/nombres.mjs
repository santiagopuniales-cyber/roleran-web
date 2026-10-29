// Limpieza automática de nombres de producto.
// Devuelve el nombre limpio (sin la cantidad del paquete) y la presentación detectada en el nombre.
// Lo que las reglas no resuelven bien se corrige a mano en data/correcciones.json.
import { decodificarEntidades, capitalizar } from "./texto.mjs";

// Palabras sin tilde en el original → forma correcta. Se aplican por palabra entera.
const TILDES = {
  plastico: "plástico", plasticos: "plásticos", carton: "cartón", vacio: "vacío", termico: "térmico",
  termicos: "térmicos", higienico: "higiénico", algodon: "algodón", budin: "budín", marron: "marrón",
  numero: "número", numeros: "números", triangulo: "triángulo", maquina: "máquina", cafe: "café",
  bidon: "bidón", jabon: "jabón", cajon: "cajón", economico: "económico", biologica: "biológica",
  escobillon: "escobillón", diametro: "diámetro", acrilico: "acrílico", sandwiches: "sándwiches",
  sandwich: "sándwich", sandwiche: "sándwich", pizzarra: "pizarra", polyester: "poliéster",
  vaiven: "vaivén", comoda: "cómoda", marmol: "mármol", cupula: "cúpula", copetin: "copetín",
  teoria: "Teoría", limpiez: "limpieza", degustacion: "degustación", cristal: "cristal",
  aisladora: "aisladora", promocion: "promoción", fragil: "frágil", baul: "baúl",
  organizador: "organizador", rectangulo: "rectángulo", oblea: "oblea", petaca: "petaca",
  helado: "helado", balanza: "balanza", panos: "paños", pano: "paño", espatula: "espátula",
  azucar: "azúcar", nylon: "nylon", recuperado: "recuperado", bano: "baño", anos: "años",
  telgopor: "telgopor", rapido: "rápido", calado: "calado", atencion: "atención",
  envasar: "envasar", pirotin: "pirotín", tamano: "tamaño", lamina: "lámina",
};

// Marcas y siglas: forma en que se escriben siempre.
const FORMAS_FIJAS = {
  pp: "PP", pet: "PET", pvc: "PVC", eps: "EPS", pse: "PSE", pcr: "PCR", byt: "BYT", pos: "POS",
  a4: "A4", ad: "AD", bd: "BD", wp: "WP", ip: "IP",
  atma: "Atma", sanremo: "Sanremo", zanetti: "Zanetti", darnel: "Darnel", theoto: "Theoto",
  florax: "Florax", nobre: "Nobre", vipp: "Vipp", elite: "Elite", alumay: "Alumay", wyda: "Wyda",
  bompack: "Bompack", conserv: "Conserv", plasvale: "Plasvale", maped: "Maped", kangaro: "Kangaro",
  orion: "Orion", suavex: "Suavex", sintal: "Sintal", limpaki: "Limpaki", harpers: "Harpers",
  tom: "Tom", superpro: "SuperPro", estra: "Estra", motex: "Motex", canmai: "Canmai",
  tashiro: "Tashiro", copobras: "Copobras", galvanotek: "Galvanotek", pandora: "Pandora",
  sindway: "Sindway", domo: "domo", coex: "coex", unisold: "unisold", tami: "Tami",
  american: "American", avon: "Avon", berta: "Berta", canadian: "Canadian", papelplast: "Papelplast",
  kraft: "kraft",
};

const UNIDAD_PACK = String.raw`(?:unidades|unidad|unids?\.?|unds?\.?|un\.?|u\.?)`;

/** Corrige mayúsculas acentuadas sueltas ("CartÓn" → "Cartón"). */
function arreglarMayusculasRotas(t) {
  return t.replace(/([a-záéíóúñü])([ÁÉÍÓÚÑÜ])/g, (_, a, b) => a + b.toLowerCase());
}

function esTodoMayusculas(t) {
  const letras = t.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, "");
  if (letras.length < 4) return false;
  const may = letras.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, "").length;
  return may / letras.length > 0.8;
}

function aEntero(s) {
  return Number(String(s).replace(/\./g, ""));
}

/**
 * Extrae la cantidad del paquete del nombre. Devuelve { texto sin la cantidad, pack }.
 * pack: { tipo, unidades, detalle } | { tipo: 'kg' } | { tipo: 'unidad' } | { tipo: 'metro' } | null
 */
function extraerPresentacion(t) {
  let pack = null;
  const quitar = (re, fn) => {
    if (pack) return;
    const m = t.match(re);
    if (m) {
      pack = fn(m);
      t = t.replace(m[0], " ");
    }
  };

  quitar(new RegExp(String.raw`\(?\bcaja\s*(?:x|de|\/)\s*(\d[\d.]*)\s*${UNIDAD_PACK}?\)?`, "i"), (m) => ({ tipo: "caja", unidades: aEntero(m[1]) }));
  quitar(/\bcajax\s*(\d[\d.]*)/i, (m) => ({ tipo: "caja", unidades: aEntero(m[1]) }));
  quitar(/(?:\bx|\/)\s*(\d[\d.]*)\s*caja\b/i, (m) => ({ tipo: "caja", unidades: aEntero(m[1]) }));
  quitar(/\bfunda\s*x\s*(\d+)/i, (m) => ({ tipo: "funda", unidades: aEntero(m[1]) }));
  quitar(new RegExp(String.raw`\bpaquete\s*[x\/]\s*(\d+)\s*${UNIDAD_PACK}?`, "i"), (m) => ({ tipo: "paquete", unidades: aEntero(m[1]) }));
  quitar(/\bpaq\.?\s*[x\/]\s*(\d+)/i, (m) => ({ tipo: "paquete", unidades: aEntero(m[1]) }));
  quitar(/\bkit\s*x\s*(\d+)/i, (m) => ({ tipo: "paquete", unidades: aEntero(m[1]) }));
  quitar(/\bx\s*(\d+)\s*rollos\b/i, (m) => ({ tipo: "paquete", unidades: aEntero(m[1]), detalle: "rollos" }));
  quitar(/\bx\s*(\d+)\s*bolsas\b/i, (m) => ({ tipo: "rollo", unidades: aEntero(m[1]), detalle: "bolsas" }));
  quitar(/\bx\s*(\d+)\s*pares\b/i, (m) => ({ tipo: "paquete", unidades: aEntero(m[1]), detalle: "pares" }));
  quitar(/\bx\s*(\d+)\s*paños\b/i, (m) => ({ tipo: "rollo", unidades: aEntero(m[1]), detalle: "paños" }));
  quitar(new RegExp(String.raw`\bx\s*(\d[\d.]*)\s*${UNIDAD_PACK}(?=[\s.,)]|$)`, "i"), (m) => ({ tipo: "paquete", unidades: aEntero(m[1]) }));
  quitar(/\bx\s*(\d[\d.]*)(?![\d,]|\s*(?:m|mts?|metros|cm|mm|kg|g|grs?|l|lts?|ml|cc|oz)\b)/i, (m) => ({ tipo: "paquete", unidades: aEntero(m[1]) }));
  quitar(new RegExp(String.raw`\s\/\s*(\d{2,})\s*${UNIDAD_PACK}?(?=\s|$)`, "i"), (m) => ({ tipo: "paquete", unidades: aEntero(m[1]) }));

  // Venta por kilo, por unidad o por metro
  const porKg = /\s*(?:\/\s*kg|\bx\s*kg|\bxkg|\bx\s*kilo|\/\s*kilo|\bpor\s*kilo)\b\.?/i;
  if (porKg.test(t)) {
    t = t.replace(porKg, " ");
    if (!pack) pack = { tipo: "kg" };
  }
  const porUnidad = /\s*(?:\/\s*un|\bxun|\bx\s*unidad|\bpor\s*unidad)\b\.?/i;
  if (porUnidad.test(t)) {
    t = t.replace(porUnidad, " ");
    if (!pack) pack = { tipo: "unidad" };
  }
  if (/\bx\s*m$/i.test(t.trim())) {
    t = t.replace(/\bx\s*m\s*$/i, " ");
    if (!pack) pack = { tipo: "metro" };
  }
  return { t, pack };
}

function formatearUnidades(t) {
  return (
    t
      // decimales con punto → coma (6.5 oz → 6,5 oz)
      .replace(/(\d)\.(\d)(?!\d{2,})/g, "$1,$2")
      // números pegados a unidades
      .replace(/(\d)\s*(cc)\b/gi, "$1 cc")
      .replace(/(\d)\s*ml\b/gi, "$1 ml")
      .replace(/(\d)\s*(?:cms?|centimetros|centímetros)\b\.?/gi, "$1 cm")
      .replace(/(\d)\s*mm\b/gi, "$1 mm")
      .replace(/(\d)\s*(?:mts?|metros?)\b\.?/gi, "$1 m")
      .replace(/(\d)\s*m\b/g, "$1 m")
      .replace(/(\d)\s*(?:lts?|litros?|l)\b\.?/gi, "$1 L")
      .replace(/(\d)\s*(?:kgs?|kilos?)\b\.?/gi, "$1 kg")
      .replace(/(\d)\s*(?:grs|gr|gramos|g)\b\.?/gi, "$1 g")
      .replace(/(\d)\s*(?:oz|onzas?)\b\.?/gi, "$1 oz")
      // medidas AxB y AxBxC → A × B (× C)
      .replace(/(\d+(?:,\d+)?)(\s*(?:cm|mm|m)?)\s*[x×]\s*(?=\d)/gi, (_, n, u) => `${n}${u ? " " + u.trim() : ""} × `)
      .replace(/ {2,}/g, " ")
  );
}

function aplicarDiccionarios(t) {
  return t.replace(/[A-Za-zÁÉÍÓÚÑÜáéíóúñü0-9]+/g, (palabra) => {
    const k = palabra.toLowerCase();
    if (FORMAS_FIJAS[k]) return FORMAS_FIJAS[k];
    if (TILDES[k]) {
      const r = TILDES[k];
      return palabra[0] === palabra[0].toUpperCase() && palabra[0] !== palabra[0].toLowerCase() ? capitalizar(r) : r;
    }
    return palabra;
  });
}

/** Limpia un nombre original de WooCommerce. */
export function limpiarNombre(original) {
  let t = decodificarEntidades(original).replace(/[\s ]+/g, " ").trim();
  t = arreglarMayusculasRotas(t);
  if (esTodoMayusculas(t)) t = t.toLowerCase();
  else {
    // palabras sueltas en mayúsculas que no son siglas conocidas → minúsculas
    t = t.replace(/\b[A-ZÁÉÍÓÚÑ]{4,}\b/g, (w) => (FORMAS_FIJAS[w.toLowerCase()] ? w : w.toLowerCase()));
  }
  t = t.replace(/[“”"]/g, "");
  // abreviaturas
  t = t
    .replace(/\bgde\b\.?/gi, "grande")
    .replace(/\bp\/\s*/gi, "para ")
    .replace(/\bc\/\s*/gi, "con ")
    .replace(/\bs\/\s*/gi, "sin ")
    .replace(/\brect\.\s*/gi, "rectangular ")
    .replace(/\bcam\.\s*/gi, "camiseta ")
    .replace(/\bn\s*[°º]\s*(?=\d)/gi, "N.º ")
    .replace(/\bn[°º]\s*/gi, "N.º ");
  const { t: sinPack, pack } = extraerPresentacion(t);
  t = formatearUnidades(sinPack);
  t = aplicarDiccionarios(t);
  t = t
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([.,;)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/[\s.,;:/–-]+$/g, "")
    .replace(/^[\s.,;:/–-]+/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
  return { nombre: capitalizar(t), pack };
}

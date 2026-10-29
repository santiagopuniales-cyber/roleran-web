// Extracción de atributos estructurados a partir del nombre limpio, el SKU y la descripción original.
// Regla de oro: solo datos que salen de esas fuentes. Lo inferido del SKU se marca como tal.
import { normalizar, numeroUY } from "./texto.mjs";

const MATERIALES = [
  [/pet-?pcr/, "PET-PCR"],
  [/\bpse\b|\bespuma(plast)?\b|\beps\b|\btelgopor\b|vaso termico|pote termico|marmita/, "Espumaplast (EPS)"],
  [/polipapel/, "Polipapel"],
  [/\bpet\b|tereftalato/, "PET"],
  [/\bpp\b|polipropileno/, "Polipropileno (PP)"],
  [/\bpvc\b/, "PVC"],
  [/baja densidad/, "Polietileno de baja densidad"],
  [/alta densidad/, "Polietileno de alta densidad"],
  [/\baluminio\b/, "Aluminio"],
  [/\bacrilico\b/, "Acrílico"],
  [/\bkraft\b/, "Papel kraft"],
  [/\bcartulina\b/, "Cartulina"],
  [/\bcarton\b/, "Cartón"],
  [/\bbambu\b/, "Bambú"],
  [/\bmadera\b/, "Madera"],
  [/\bnitrilo\b/, "Nitrilo"],
  [/\blatex\b/, "Látex"],
  [/\balgodon\b/, "Algodón"],
  [/\bpoliester\b|\bpolyester\b/, "Poliéster"],
  [/\bsisal\b/, "Sisal"],
  [/\bnylon\b/, "Nylon"],
  [/\bacero inox/, "Acero inoxidable"],
  [/\bbronce\b/, "Bronce"],
  [/\bpapel\b/, "Papel"],
];

const COLORES = [
  "transparente", "blanco", "blanca", "negro", "negra", "amarillo", "amarilla", "verde", "azul", "rojo", "roja",
  "dorado", "dorada", "plateado", "plateada", "marron", "celeste", "gris", "natural", "cristal", "rosa",
];
const COLOR_FORMA = {
  blanca: "Blanco", negra: "Negro", amarilla: "Amarillo", roja: "Rojo", dorada: "Dorado", plateada: "Plateado",
  marron: "Marrón", cristal: "Cristal (transparente)",
};

export const MARCAS = [
  "Atma", "Sanremo", "Zanetti", "Darnel", "Theoto", "Florax", "Nobre", "Vipp", "Elite", "Alumay", "Wyda", "Bompack",
  "Conserv", "Plasvale", "Maped", "Kangaro", "Teoría", "Orion", "Barón Rojo", "Suavex", "Sintal", "Limpaki",
  "Harpers", "Tom", "SuperPro", "Estra", "Motex", "Canmai", "Tashiro", "Copobras", "Ippon Sak", "Fira+", "Sindway",
  "Avon", "Berta", "Papelplast", "Galvanotek",
];

function primero(re, texto) {
  const m = texto.match(re);
  return m ? m[1].trim() : null;
}

/** Medidas de la descripción, formateadas: "190 × 184 × 85 mm". */
function formatearMedidas(s) {
  if (!s) return null;
  let t = s
    .replace(/DIAM/i, "Ø")
    .replace(/\s*[xX×]\s*/g, " × ")
    .replace(/(\d)\.(\d)/g, "$1,$2")
    .replace(/\s*cms?\b\.?/gi, " cm")
    .replace(/\s+/g, " ")
    .trim();
  t = t.replace(/(\d)(cm|mm)\b/g, "$1 $2");
  return t;
}

/**
 * @param {object} p  { nombre, nombreOriginal, sku, descripcionOriginal }
 * @returns atributos estructurados y presentación detectada en la descripción
 */
export function extraerAtributos({ nombre, nombreOriginal, descripcionOriginal }) {
  const desc = descripcionOriginal ?? "";
  const n = normalizar(`${nombre} ${nombreOriginal}`);
  const a = {};

  // material: la descripción técnica manda
  const matDesc = primero(/(?:^|\n)\s*\*?\s*Material:?\s+([^\n]+?)(?:\n|$|Colores?:|Medidas)/i, desc);
  const matConDosPuntos = /(?:^|\n)\s*\*?\s*Material:/i.test(desc);
  const matConocido = matDesc ? MATERIALES.find(([re]) => re.test(normalizar(matDesc))) : null;
  if (matDesc && (matConocido || matConDosPuntos)) {
    a.material = matConocido ? matConocido[1] : matDesc;
  } else {
    const m = MATERIALES.find(([re]) => re.test(n));
    if (m) a.material = m[1];
  }

  // color
  const colDesc = primero(/(?:^|\n)\s*Colou?res?:\s*([^\n]+?)(?:\n|$|Medidas)/i, desc);
  if (colDesc && colDesc.length < 40) a.color = colDesc.replace(/\.$/, "");
  else {
    const c = COLORES.find((c) => new RegExp(`\\b${c}\\b`).test(n));
    if (c) a.color = COLOR_FORMA[c] ?? c.charAt(0).toUpperCase() + c.slice(1);
  }

  // medidas
  const medDesc = primero(/Medidas?:?\s*([\dDIAM][^\n]*?)(?:\n|$| \/ | – )/i, desc);
  if (medDesc && /\d/.test(medDesc)) a.medidas = formatearMedidas(medDesc);
  else {
    const m = nombre.match(/(?<![\d,])(\d+(?:,\d+)?(?: (?:cm|mm|m))? × \d+(?:,\d+)?(?: × \d+(?:,\d+)?)?(?: (?:cm|mm|m)\b)?)/);
    if (m) a.medidas = m[1];
  }

  // capacidad
  const capDesc = primero(/Capacidad(?: \(ml\))?:?\s*([\d.,]+\s*(?:ml|l|lts|litros|cc)?)/i, desc);
  const capNom = nombre.match(/(\d+(?:,\d+)?) ?(cc|ml|L)\b/);
  if (capNom) a.capacidad = `${capNom[1]} ${capNom[2]}`;
  else if (capDesc) {
    const v = /ml$/i.test(capDesc) ? capDesc.replace(/\s*ml$/i, " ml") : capDesc.replace(/\s*(lts|litros|l)$/i, " L");
    a.capacidad = /[a-z]/i.test(v) ? v : `${v} ml`;
  }
  const oz = nombre.match(/(\d+(?:,\d+)?|1½) oz/);
  if (oz && !a.capacidad) a.capacidad = `${oz[1]} oz`;

  // uso apto (solo si lo dice la descripción original)
  const uso = primero(/Uso apto:?\s*([a-záéíóú]+)/i, desc);
  if (uso) a.usoApto = uso.toLowerCase() === "freezer" ? "Freezer" : uso.charAt(0).toUpperCase() + uso.slice(1).toLowerCase();
  if (/congelador y al microondas/i.test(desc)) a.usoApto = "Freezer y microondas";

  // código del fabricante
  const cod = primero(/C[oó]digo:?\s*#?\s*([A-Z0-9]+(?: Rectangular)?)\b/i, desc);
  if (cod) a.codigoFabricante = cod;

  // marca (del nombre)
  const marca = MARCAS.find((m) => new RegExp(`(^|[^a-záéíóú])${normalizar(m).replace("+", "\\+")}($|[^a-záéíóú])`).test(normalizar(nombre)));
  if (marca) a.marca = marca;

  // unidades por empaque cerrado (descripción)
  const emp = desc.match(/Unidades por (Caja|Funda|Bulto):?\s*(\d+)/i) ?? desc.match(/Cantidad por (funda|caja):?\s*(\d+)/i);
  if (emp) a.empaqueCerrado = { tipo: emp[1].toLowerCase(), unidades: Number(emp[2]) };

  return a;
}

/** Presentación que se deduce de la descripción original (si la hay). */
export function presentacionDeDescripcion(desc) {
  if (!desc) return null;
  const pats = [
    [/Caja de (\d+) unidades/i, "caja"],
    [/Caja contiene:?\s*(\d+)\s*unidades/i, "caja"],
    [/Caja con (\d+) unidades/i, "caja"],
    [/caja x\s?(\d+)\s*unidades/i, "caja"],
    [/funda x\s?(\d+)/i, "funda"],
    [/Contiene:?\s*(\d+)\s*unidades/i, "paquete"],
    [/paquete x\s?(\d+)\s*unidades/i, "paquete"],
    [/Cada paquete contiene (?:aproximadamente )?(\d+)/i, "paquete"],
    [/paquete de (\d+) unidades/i, "paquete"],
    [/paquetes? (?:de|por) (\d+) unidades/i, "paquete"],
    [/Presentaci[oó]n:?\s*(?:paquetes de )?(\d+)\s*unidades/i, "paquete"],
    [/Cantidad:?\s*(\d+)\s*unidades/i, "paquete"],
    [/(?:el )?(?:paquete|empaque) (?:viene (?:con|en)|contiene) (\d+)/i, "paquete"],
  ];
  for (const [re, tipo] of pats) {
    const m = desc.match(re);
    if (m) return { tipo, unidades: Number(m[1]) };
  }
  return null;
}

const PACKS_SKU = new Set([10, 12, 20, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 2000, 5000]);

/** Unidades por paquete que sugiere el SKU (ej. V550X1000 → 1000). Devuelve null si es una medida. */
export function packDesdeSku(sku, nombre) {
  if (!sku) return null;
  const m = sku.match(/(\d+)?(?:[A-Z]*)?[X\/](\d+)$/i);
  if (!m) return null;
  const n = Number(m[2]);
  if (!PACKS_SKU.has(n)) return null;
  // Si el nombre ya tiene una medida A × B donde B = n, el número del SKU es una medida, no un paquete.
  const dims = [...nombre.matchAll(/(\d+(?:,\d+)?) × (\d+)/g)].map((d) => Number(d[2]));
  if (dims.includes(n)) return null;
  // Si el número aparece en el nombre como largo, peso o capacidad (250 m, 150 m, 500 g), no es un paquete.
  if (new RegExp(`(^|[^\\d,])${n} ?(m|cm|mm|g|kg|ml|cc|L)\\b`).test(nombre)) return null;
  if (m[1] && new RegExp(`\\b${m[1]}\\b`).test(nombre) && Number(m[1]) === n) return null;
  return n;
}

export { numeroUY };

// Normalización compartida por el índice (en build) y por el buscador (en el navegador).
// Las dos puntas procesan el texto igual, así «Telgopor», «espuma» y «EPS» terminan en el mismo término.

/** Sinónimos → término canónico. Se aplican a cada palabra ya normalizada y en singular. */
export const SINONIMOS: Record<string, string> = {
  telgopor: "espumaplast",
  espuma: "espumaplast",
  eps: "espumaplast",
  pse: "espumaplast",
  isopor: "espumaplast",
  poliestireno: "espumaplast",
  plumavit: "espumaplast",
  pajita: "sorbito",
  bombilla: "sorbito",
  popote: "sorbito",
  sorbete: "sorbito",
  escarbadiente: "mondadiente",
  palillito: "mondadiente",
  pirotin: "casquete",
  capacillo: "casquete",
  pirotine: "casquete",
  aluminio: "aluminio",
  alu: "aluminio",
  plastico: "plastico",
  descartable: "descartable",
  desechable: "descartable",
  brocheta: "brochette",
  brochete: "brochette",
  pincho: "brochette",
  servilletero: "servilletero",
  toallita: "toalla",
  basura: "residuo",
  consorcio: "residuo",
  cesto: "cesto",
  tacho: "basurero",
  tarro: "basurero",
  papelera: "papelera",
  nailon: "nylon",
  nilon: "nylon",
  naylon: "nylon",
  polietileno: "nylon",
  bolsita: "bolsa",
  bolson: "bolsa",
  chupito: "shot",
  vasito: "vaso",
  copita: "copa",
  tapita: "tapa",
  potecito: "pote",
  envase: "envase",
  tupper: "pote",
  taper: "pote",
  pochoclo: "pop",
  palomita: "pop",
  pororo: "pop",
  pororó: "pop",
  hamburguesera: "hamburguesa",
  scotch: "cinta",
  cello: "cinta",
  celo: "cinta",
  stretch: "paletizar",
  strech: "paletizar",
  pallet: "paletizar",
  palet: "paletizar",
  recogedor: "pala",
  trapo: "pano",
  lavandina: "hipoclorito",
  cloro: "hipoclorito",
  jane: "hipoclorito",
  etiquetadora: "rotuladora",
  remarcadora: "rotuladora",
  abrochadora: "engrampadora",
  grampadora: "engrampadora",
  grampa: "gancho",
  cuadernola: "cuaderno",
  ml: "cc",
  mililitro: "cc",
  litro: "l",
  lt: "l",
  lts: "l",
  centimetro: "cm",
  cms: "cm",
  metro: "m",
  mts: "m",
  mt: "m",
  milimetro: "mm",
  kilo: "kg",
  kgs: "kg",
  gramo: "g",
  gr: "g",
  grs: "g",
  onza: "oz",
  numero: "nro",
  nro: "nro",
  no: "nro",
  n: "nro",
  "n.o": "nro",
};

const VACIAS = new Set([
  "de", "del", "la", "las", "el", "los", "para", "con", "y", "en", "a", "al", "por", "un", "una", "unos", "unas",
  "x", "e", "o", "u", "lo", "que", "mas", "muy", "tipo",
]);

const SIN_SINGULAR = new Set(["gas", "pos", "dips", "tres", "dos", "seis", "mas", "flex", "plus", "kraft", "sushi", "rou", "coex"]);

export function quitarTildes(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Minúsculas, sin tildes, separa números de unidades (550cc → 550 cc) y medidas (38x250 → 38 250). */
export function normalizarTexto(s: string): string {
  return quitarTildes(String(s).toLowerCase())
    .replace(/[º°]/g, "o")
    .replace(/½/g, " 1/2")
    .replace(/×/g, " x ")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/[^a-z0-9./ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function singular(t: string): string {
  if (t.length <= 3 || /\d/.test(t) || SIN_SINGULAR.has(t)) return t;
  if (t.endsWith("ces")) return t.slice(0, -3) + "z";
  if (/[lrndj]es$/.test(t) && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

/** Tokeniza texto normalizado. */
export function tokenizar(texto: string): string[] {
  return normalizarTexto(texto)
    .split(/[\s/]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);
}

/** Procesa un término: singular, sinónimo canónico; descarta palabras vacías. */
export function procesarTermino(termino: string): string | null {
  const t = termino.toLowerCase();
  if (VACIAS.has(t)) return null;
  const s = singular(t);
  return SINONIMOS[s] ?? SINONIMOS[t] ?? s;
}

/** Código (SKU) normalizado para comparar: solo letras y números. */
export function normalizarCodigo(s: string): string {
  return quitarTildes(String(s).toLowerCase()).replace(/[^a-z0-9]/g, "");
}

export const OPCIONES_INDICE = {
  fields: ["nombre", "sinonimos", "categoria", "atributos", "codigo"],
  storeFields: ["slug", "nombre", "sku", "presentacion", "imagen", "placeholder", "categoriaNombre", "id", "paso", "minimo"],
} as const;

export const OPCIONES_BUSQUEDA = {
  boost: { nombre: 3, codigo: 3, sinonimos: 1.6, categoria: 1.2, atributos: 0.8 },
  prefix: (term: string, i: number, terms: string[]) => i === terms.length - 1 && term.length >= 2,
  // Errores de tipeo: 1 letra en palabras de 5 a 8 letras, 2 en las más largas.
  // (Con un margen proporcional, «casquete» encontraba «paquete»; con 4 letras, «copa» encontraba «mopa».)
  fuzzy: (term: string) => (term.length >= 9 ? 2 : term.length >= 5 ? 1 : 0),
  combineWith: "AND" as const,
};

// Utilidades de texto compartidas por el pipeline del catálogo.

const ENTIDADES = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ndash;": "–",
  "&mdash;": "—",
  "&times;": "×",
  "&hellip;": "…",
};

/** Decodifica entidades HTML numéricas y con nombre. */
export function decodificarEntidades(s) {
  return String(s ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/gi, (m) => ENTIDADES[m.toLowerCase()] ?? m);
}

/** HTML a texto plano: separa párrafos con " / " y colapsa espacios. */
export function htmlATexto(html) {
  const t = decodificarEntidades(
    String(html ?? "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|h\d|div)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
  return t
    .split("\n")
    .map((l) => l.replace(/[\s ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Minúsculas sin tildes (la ñ se conserva como n para buscar). */
export function normalizar(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[º°]/g, "o");
}

/** Slug estable: minúsculas, sin tildes, guiones. */
export function slugificar(s) {
  return normalizar(s)
    .replace(/×/g, "x")
    .replace(/½/g, "-1-2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function capitalizar(s) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("es") + s.slice(1);
}

/** Número con coma decimal (estilo Uruguay): 6.5 → "6,5". */
export function numeroUY(n) {
  const v = typeof n === "number" ? n : Number(String(n).replace(",", "."));
  if (!Number.isFinite(v)) return String(n);
  return String(v).replace(".", ",");
}

/** Número con separador de miles (punto): 10000 → "10.000". */
export function miles(n) {
  return Number(n).toLocaleString("es-UY");
}

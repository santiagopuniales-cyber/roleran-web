// Escaneo de contenido del sitio exportado: busca en el texto visible (y en alt, aria-label, placeholder,
// title y metadescripciones) cosas que no deberían estar: relleno, emojis, tuteo, frases hechas de IA,
// datos inventados o internos, restos técnicos y el ID de Analytics de la web vieja.
// Uso: node scripts/qa/contenido.mjs (después de npm run build)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
// Con los precios de la web apagados (lo decide el dueño en el sistema), no puede aparecer ninguno.
const MOSTRAR_PRECIOS = JSON.parse(readFileSync("data/web.json", "utf8")).mostrarPrecios === true;

const REGLAS = [
  // [nombre, expresión, explicación]
  ["relleno", /\blorem\b|\bipsum\b|\bdolor sit\b/i, "texto de relleno"],
  ["nota de desarrollo", /\b(TODO|FIXME|XXX)\b/, "notas de desarrollo"],
  // Emojis (no cuenta ©, ® ni ™, que son símbolos de texto).
  ["emoji", /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/u, "emojis"],
  ["tuteo", /\b(puedes|tienes|quieres|necesitas|eres|contáctanos|escríbenos|llámanos|envíanos|descubre|encuentra|elige|visítanos|compra ahora|haz tu pedido|agrega al carrito)\b/i, "tuteo en vez de voseo"],
  [
    "frase hecha",
    /en el corazón de|sin lugar a dudas|no busques más|experiencia única|calidad premium|soluciones integrales|somos líderes|líderes en|los mejores precios|excelencia|comprometidos con|a tu medida|de primer nivel|inigualable|amplia trayectoria|nos enorgullece|tu aliado|mejor opción del mercado|elevá tu|potenciá tu/i,
    "frases hechas o de relleno",
  ],
  // "envío gratis" no está: el dueño lo confirmó (Montevideo y alrededores, 8/10/2026).
  ["dato inventado", /más de \d|\d+ años de|clientes satisfechos|\bestrellas\b|★|testimonio|certificad|\bISO \d|garantizad|pago seguro|24 ?horas|24\/7|\bpremio/i, "afirmaciones sin respaldo"],
  ...(MOSTRAR_PRECIOS ? [] : [["precio", /\$ ?\d|\bUYU ?\d|\bU\$S/i, "precios (los precios de la web están apagados en el sistema)"]]),
  ["dato interno", /facturaci[oó]n mensual|\bUSD\b|empleados|no aceptamos tarjeta|Memorae|Siigo/i, "datos internos que no se publican"],
  ["resto técnico", /\bundefined\b|\bNaN\b|\[object Object\]|&amp;|&#\d+;|&quot;|\bnull\b/, "restos técnicos en el texto"],
  ["puntuación", /S\.A\.\.|[^.]\.\.(?!\.)/, "puntos dobles (por ejemplo «Roleran S.A..»)"],
  ["inglés", /(?<!\p{L})(Add to cart|Read more|Search|Home|Cart|Checkout|Wishlist|My account|Sale|Shop now|Out of stock)(?!\p{L})/u, "textos en inglés"],
];

function* paginas(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* paginas(p);
    else if (n.endsWith(".html")) yield p;
  }
}

const decodificar = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

function textoVisible(html) {
  const cuerpo = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const atributos = [...cuerpo.matchAll(/\s(?:alt|aria-label|placeholder|title)="([^"]*)"/g)].map((m) => m[1]);
  const meta = [...html.matchAll(/<meta (?:name|property)="(?:description|og:title|og:description)" content="([^"]*)"/g)].map((m) => m[1]);
  const titulo = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";
  const texto = cuerpo.replace(/<[^>]+>/g, " ");
  return decodificar([texto, ...atributos, ...meta, titulo].join(" \n ")).replace(/\s+/g, " ");
}

// Frases que salen tal cual de la descripción original del producto en la web vieja (no son afirmaciones nuestras).
const PERMITIDOS = [/Más de 10 tonos/g];

const hallazgos = new Map();
let total = 0;
for (const archivo of paginas(OUT)) {
  total++;
  const ruta = "/" + relative(OUT, archivo).split(sep).join("/").replace(/index\.html$/, "");
  let texto = textoVisible(readFileSync(archivo, "utf8"));
  for (const p of PERMITIDOS) texto = texto.replace(p, "");
  for (const [nombre, re, explicacion] of REGLAS) {
    const m = re.exec(texto);
    if (!m) continue;
    if (!hallazgos.has(nombre)) hallazgos.set(nombre, { explicacion, ejemplos: [] });
    const h = hallazgos.get(nombre);
    if (h.ejemplos.length < 8) h.ejemplos.push(`${ruta}: «…${texto.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).trim()}…»`);
    h.cantidad = (h.cantidad ?? 0) + 1;
  }
}

// El ID de Google Analytics de la web vieja no puede aparecer en ningún archivo publicado (HTML, JS, JSON).
let conIdViejo = 0;
(function revisar(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) revisar(p);
    else if (/\.(html|js|json|txt|xml)$/.test(n) && readFileSync(p, "utf8").includes("G-9VW891H1TV")) conIdViejo++;
  }
})(OUT);

console.log(`${total} páginas revisadas.`);
if (conIdViejo) console.log(`El ID de Analytics de la web vieja aparece en ${conIdViejo} archivos.`);
for (const [nombre, h] of hallazgos) {
  console.log(`\n[${nombre}] ${h.explicacion}: ${h.cantidad} páginas`);
  for (const e of h.ejemplos) console.log(`  ${e}`);
}
if (hallazgos.size || conIdViejo) process.exit(1);
console.log("Sin hallazgos.");

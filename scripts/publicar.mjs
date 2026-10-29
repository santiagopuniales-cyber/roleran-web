// Publica la web con el catálogo del sistema al día. Uso: npm run publicar [-- --si-cambio] [-- --tarea] [-- --sin-publicar]
//
//   1. Baja del sistema el catálogo (data/sistema.json).
//   2. Con --si-cambio, si el sistema no cambió desde lo último commiteado, termina sin publicar.
//   3. Rearma el catálogo (fija los slugs de los productos nuevos), corre los unitarios, compila para
//      www.roleran.com.uy con los chequeos de enlaces y SEO y lo sube a Cloudflare Pages (que sirve www);
//      mientras www muestre la web vieja, también la dirección de prueba (Worker, sin indexar).
//   4. Commitea y sube los datos que cambiaron, para que el repo diga lo mismo que la web publicada.
//
// En la nube lo corre .github/workflows/publicar.yml (solo tras cada cambio del sistema y una vez por día). Con
// --sin-publicar hace todo menos subir a Cloudflare y commitear (para probar el armado).
// Con --tarea, si algo falla deja el detalle en ROLERAN_ESTADO/web-publicar.txt y no publica nada a
// medias. Los listados de revisión (docs/) se generan igual pero no se commitean. Si el repo tiene cambios a mano sin commitear,
// no hace nada: no se publica trabajo a medias ni se lo mezcla en un commit automático.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SI_CAMBIO = process.argv.includes("--si-cambio");
const TAREA = process.argv.includes("--tarea");
const SIN_PUBLICAR = process.argv.includes("--sin-publicar");
const DOMINIO = "https://www.roleran.com.uy";
const ESTADO = process.env.ROLERAN_ESTADO ?? "C:/Roleran/.estado";
const ARCHIVO_ERROR = path.join(ESTADO, "web-publicar.txt");
const LOG = path.join(ESTADO, "web-publicar.log");
const GENERADOS = [
  "data/sistema.json", "data/web.json", "data/catalogo.json", "data/categorias.json", "data/rubros.json",
  "data/redirecciones.json", "data/slugs.lock.json", "public/_redirects",
  "data/fotos-propias", "data/imagenes.json", "public/img/p",
];
// La conexión con el sistema vive en el repo privado roleran-web-privado (ver .gitignore): sin ella no
// se puede bajar el catálogo ni publicar la API de cotizaciones, así que se corta antes de empezar.
const FALTAN = ["scripts/catalogo/sistema.mjs", "scripts/imagenes/fotos-sistema.mjs", "functions", "worker"].filter((r) => !fs.existsSync(r));
// Un archivo cuenta como generado si es uno de esos o está adentro de una de esas carpetas.
const generado = (ruta) => GENERADOS.some((g) => ruta === g || ruta.startsWith(`${g}/`));

fs.mkdirSync(ESTADO, { recursive: true });
const log = (msg) => {
  const linea = `${new Date().toISOString()} ${msg}`;
  console.log(linea);
  fs.appendFileSync(LOG, linea + "\n");
};

function correr(comando, { salida = false } = {}) {
  const r = spawnSync(comando, { shell: true, encoding: "utf8", stdio: salida ? "pipe" : "inherit" });
  if (r.status !== 0) throw new Error(`Falló «${comando}»${salida ? `: ${(r.stderr || r.stdout).trim().slice(-800)}` : ""}`);
  return r.stdout ?? "";
}

/** true si www.roleran.com.uy ya sirve esta web (la vieja no tiene /datos/catalogo.json). */
async function dominioMuestraEstaWeb() {
  try {
    const r = await fetch(`${DOMINIO}/datos/catalogo.json`, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    return r.status === 200 && (r.headers.get("content-type") ?? "").includes("json");
  } catch {
    return false;
  }
}

const cambiosEn = (archivos) => correr(`git status --porcelain -- ${archivos.join(" ")}`, { salida: true }).trim();

try {
  if (FALTAN.length) throw new Error(`Falta el código privado (${FALTAN.join(", ")}): en la PC, npm run privado; en Actions lo trae publicar.yml.`);
  const ajenos = correr("git status --porcelain", { salida: true })
    .split("\n").filter(Boolean)
    .filter((l) => !generado(l.slice(3).trim().replace(/^"|"$/g, "")));
  if (ajenos.length) {
    log(`No se publica: hay cambios sin commitear en el repo (${ajenos.length}), por ejemplo ${ajenos[0].slice(3)}.`);
    process.exit(TAREA ? 0 : 1);
  }

  // www.roleran.com.uy lo sirve Cloudflare Pages (proyecto roleran-web): siempre se publica ahí el build
  // para el dominio (canónica e indexable). Mientras www siga mostrando la web vieja, también se publica
  // el Worker de la dirección de prueba (*.workers.dev, sin indexar). Con www ya en la web nueva, el
  // Worker queda solo redirigiendo a www y no se toca. SITIO_EN_DOMINIO=si (variable del repo) lo fija.
  const enDominio = process.env.SITIO_EN_DOMINIO === "si" || (await dominioMuestraEstaWeb());

  correr("node scripts/catalogo/sistema.mjs");
  if (SI_CAMBIO && !cambiosEn(["data/sistema.json"])) {
    log("El catálogo del sistema no cambió: nada que publicar.");
    fs.rmSync(ARCHIVO_ERROR, { force: true });
    process.exit(0);
  }

  // Fotos cargadas en el sistema → versiones web (las de la web vieja no se tocan).
  correr("node scripts/imagenes/fotos-sistema.mjs");
  correr("node scripts/imagenes/procesar.mjs --solo-propias");
  correr("node scripts/catalogo/construir.mjs --bloquear-slugs");
  correr("node scripts/catalogo/documentos.mjs");
  correr("npm test");
  log(`Build para ${DOMINIO} (Pages, indexable).`);
  correr("npm run build");
  correr("node scripts/qa/enlaces.mjs");
  correr("node scripts/seo/verificar.mjs");
  if (!SIN_PUBLICAR) correr("node scripts/cloudflare/pages.mjs");
  if (!enDominio) {
    log("Build para la dirección de prueba (www todavía muestra la web vieja).");
    correr("npm run build:cloudflare");
    correr("node scripts/qa/enlaces.mjs");
    correr("node scripts/seo/verificar.mjs");
    if (!SIN_PUBLICAR) correr("npx wrangler deploy");
  }
  if (SIN_PUBLICAR) {
    log("Armado y chequeos bien (--sin-publicar: no se subió ni se commiteó).");
    process.exit(0);
  }

  if (cambiosEn(GENERADOS)) {
    correr(`git add -- ${GENERADOS.join(" ")}`);
    correr(`git commit -m "Catálogo del sistema al día (${new Date().toISOString().slice(0, 10)})"`);
    correr("git push");
  }
  log("Web publicada con el catálogo del sistema.");
  fs.rmSync(ARCHIVO_ERROR, { force: true });
} catch (e) {
  log(`ERROR ${e.message}`);
  if (TAREA) {
    fs.writeFileSync(
      ARCHIVO_ERROR,
      `${new Date().toISOString()}\n${e.message}\n\nCorrer «npm run publicar» en C:\\Roleran\\web muestra el error completo. Log: ${LOG}\n`,
    );
  }
  process.exit(1);
}

// Sube out/ al proyecto de Cloudflare Pages «roleran-web», que es el que sirve www.roleran.com.uy.
// Por qué Pages y no el Worker: el dominio propio de un Worker exige mover el DNS de roleran.com.uy a
// Cloudflare (y con él el correo); Pages acepta www con un CNAME en el DNS de siempre (el del hosting),
// sin tocar la raíz ni el correo. La API de cotizaciones va como función de Pages
// (functions/api/cotizacion/[accion].ts, el mismo código del Worker).
//
// Antes de subir le agrega a out/_headers que *.pages.dev no se indexe: Google tiene que ver una sola
// web, la de www (las canónicas ya apuntan ahí).
// Uso: node scripts/cloudflare/pages.mjs   (después de npm run build)
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const PROYECTO = "roleran-web";
const REGLA = `\n# Solo www.roleran.com.uy se indexa (agregado por scripts/cloudflare/pages.mjs).\nhttps://${PROYECTO}.pages.dev/*\n  X-Robots-Tag: noindex\nhttps://:version.${PROYECTO}.pages.dev/*\n  X-Robots-Tag: noindex\n`;

// Sin la función de cotizaciones (viene del repo privado, npm run privado) la web quedaría publicada
// sin poder mandar pedidos al sistema: mejor no publicar.
if (!existsSync("functions/api/cotizacion")) {
  console.error("Falta functions/ (código privado): no se publica. Correr npm run privado.");
  process.exit(1);
}

if (!readFileSync("out/_headers", "utf8").includes(`${PROYECTO}.pages.dev`)) appendFileSync("out/_headers", REGLA);

const r = spawnSync(`npx wrangler pages deploy out --project-name ${PROYECTO} --branch main --commit-dirty=true`, {
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);

// Build para Cloudflare (Workers con archivos estáticos) mientras no esté el dominio propio: sin
// indexar y con la dirección *.workers.dev en canónicas, sitemap, Open Graph y JSON-LD. Usa los
// mismos _redirects y _headers de siempre (Cloudflare los lee tal cual). Uso: npm run build:cloudflare
//
// ▼ ÚNICO LUGAR DONDE SE DEFINE LA DIRECCIÓN TEMPORAL. Con roleran.com.uy se publica con
//   `npm run build` (URL e indexación por defecto) y este script deja de hacer falta.
const URL_CLOUDFLARE = "https://roleran.santipuniales.workers.dev";

import { spawnSync } from "node:child_process";

const url = (process.env.CLOUDFLARE_SITIO_URL || URL_CLOUDFLARE).replace(/\/+$/, "");
const env = { ...process.env, NEXT_PUBLIC_SITIO_URL: url, SITIO_INDEXAR: "false" };
console.log(`Build para Cloudflare: ${url} (sin indexar)`);

const r = spawnSync("npm run build", { stdio: "inherit", shell: true, env });
process.exit(r.status ?? 1);

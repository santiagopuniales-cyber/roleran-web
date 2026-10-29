// Si SITIO_INDEXAR=false, agrega «X-Robots-Tag: noindex, nofollow» a todas las respuestas en out/_headers
// (para una copia de prueba en Cloudflare). robots.txt sigue permitiendo rastrear: así Google ve el noindex.
import { readFileSync, writeFileSync } from "node:fs";

const ARCHIVO = "out/_headers";
if (process.env.SITIO_INDEXAR === "false") {
  const lineas = readFileSync(ARCHIVO, "utf8").split(/\r?\n/);
  const i = lineas.findIndex((l) => l.trim() === "/*");
  if (i < 0) throw new Error("out/_headers no tiene un bloque /*");
  lineas.splice(i + 1, 0, "  X-Robots-Tag: noindex, nofollow");
  writeFileSync(ARCHIVO, lineas.join("\n"));
  console.log("Indexación bloqueada: X-Robots-Tag noindex en out/_headers.");
}

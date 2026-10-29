// Copia acá el código privado de la web (repo privado roleran-web-privado): la API de cotizaciones que
// conecta la web con el sistema de gestión (worker/ y functions/), la lectura del catálogo y las fotos
// desde la base del sistema y el chequeo de espacio de la base. Este repo es público; eso no.
// Uso: npm run privado  (de ../web-privado, o de la carpeta que diga ROLERAN_PRIVADO).
// Los archivos copiados están en .gitignore: nunca se commitean en este repo.
import fs from "node:fs";
import path from "node:path";

const ORIGEN = path.resolve(process.env.ROLERAN_PRIVADO ?? "../web-privado");
const RUTAS = [
  "worker",
  "functions",
  "scripts/catalogo/sistema.mjs",
  "scripts/catalogo/espacio-base.mjs",
  "scripts/imagenes/fotos-sistema.mjs",
  "tests/worker.test.ts",
];

const faltan = RUTAS.filter((r) => !fs.existsSync(path.join(ORIGEN, r)));
if (faltan.length) {
  console.error(`En ${ORIGEN} falta: ${faltan.join(", ")}. ¿Está clonado roleran-web-privado?`);
  process.exit(1);
}
for (const r of RUTAS) {
  fs.rmSync(r, { recursive: true, force: true });
  fs.cpSync(path.join(ORIGEN, r), r, { recursive: true });
}
console.log(`Código privado copiado desde ${ORIGEN} (${RUTAS.length} rutas).`);

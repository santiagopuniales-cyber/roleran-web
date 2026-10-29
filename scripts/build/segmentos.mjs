// Corrige un error de Next 16 al exportar en Windows: los archivos de prefetch por segmento deberían llamarse
// «__next.pedido.__PAGE__.txt», pero en Windows la ruta trae «\» y Next los escribe como carpeta
// «__next.pedido\__PAGE__.txt». El navegador los pide con puntos y recibe 404 (prefetch fallido y errores en consola).
// Este paso aplana esas carpetas al nombre correcto. En Linux no encuentra nada que corregir.
import { readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
let movidos = 0;

function archivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : [p];
  });
}

function recorrer(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (!statSync(p).isDirectory()) continue;
    if (n.startsWith("__next.")) {
      for (const archivo of archivos(p)) {
        const plano = `${n}.${relative(p, archivo).split(sep).join(".")}`;
        renameSync(archivo, join(dir, plano));
        movidos++;
      }
      rmSync(p, { recursive: true, force: true });
    } else recorrer(p);
  }
}

recorrer(OUT);
console.log(movidos ? `Segmentos de prefetch aplanados: ${movidos}.` : "Segmentos de prefetch: nada que corregir.");

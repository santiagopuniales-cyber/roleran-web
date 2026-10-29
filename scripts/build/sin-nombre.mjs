// Corta el build si en la web armada aparece el nombre de quien la hizo (pedido de Roleran: la web es de
// Roleran y no lo nombra). Mientras se publica en la dirección de prueba *.workers.dev, esa dirección
// se tolera; con el dominio propio no puede quedar ni una.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve("out");
const PROHIBIDO = /puniales/i;
const url = process.env.NEXT_PUBLIC_SITIO_URL || "https://www.roleran.com.uy";
const tolerada = PROHIBIDO.test(url) ? new RegExp(url.replace(/^https?:\/\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") : null;

const malos = [];
function revisar(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) revisar(ruta);
    else if (/\.(html|txt|xml|json|js|css|webmanifest)$/.test(e.name) || e.name.startsWith("_")) {
      let texto = fs.readFileSync(ruta, "utf8");
      if (tolerada) texto = texto.replace(tolerada, "");
      if (PROHIBIDO.test(texto) || PROHIBIDO.test(e.name)) malos.push(path.relative(RAIZ, ruta));
    }
  }
}
revisar(RAIZ);
if (malos.length) {
  console.error(`El nombre aparece en ${malos.length} archivo(s) de la web, por ejemplo: ${malos.slice(0, 5).join(", ")}`);
  process.exit(1);
}
console.log(`Sin nombres personales en la web${tolerada ? " (salvo la dirección de prueba)" : ""}.`);

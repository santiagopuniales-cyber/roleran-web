// Compara los datos de contacto de src/config/sitio.ts con lo que dice la web vieja (HTML guardado en data/raw).
// Uso: node scripts/qa/datos-web-vieja.mjs   (Node 23.6+ lee el .ts directamente)
import { readFileSync } from "node:fs";
import { SITIO } from "../../src/config/sitio.ts";

const PAGINAS = {
  portada: "data/raw/snapshot-2026-10-06/home.html",
  contacto: "data/raw/snapshot-2026-10-06/contacto.html",
  nosotros: "data/raw/2026-10-07/nosotros.html",
};
const texto = Object.fromEntries(
  Object.entries(PAGINAS).map(([k, f]) => [
    k,
    readFileSync(f, "utf8")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " "),
  ]),
);
const todo = Object.values(texto).join(" ");
const html = Object.values(PAGINAS).map((f) => readFileSync(f, "utf8")).join(" ");
const sinTildes = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const controles = [
  ["Dirección", SITIO.direccion.calle, sinTildes(todo).includes(sinTildes(SITIO.direccion.calle))],
  ["Código postal", SITIO.direccion.codigoPostal, todo.includes(`CP ${SITIO.direccion.codigoPostal}`)],
  ...SITIO.telefonos.map((t) => ["Teléfono", t.mostrar, todo.includes(t.mostrar.replace("(+598) ", "")) && t.enlace === `tel:+598${t.mostrar.replace(/\D/g, "").slice(3)}`]),
  ["WhatsApp", SITIO.whatsapp.numero, html.includes(`&quot;number&quot;:&quot;${SITIO.whatsapp.numero}&quot;`) && SITIO.whatsapp.mostrar.replace(/\D/g, "") === `0${SITIO.whatsapp.numero.slice(3)}`],
  ["Horario", SITIO.horario.texto, /Lunes a viernes de 9 a ?17:30/i.test(texto.contacto) && SITIO.horario.abre === "09:00" && SITIO.horario.cierra === "17:30"],
  ...SITIO.emails.map((e) => ["Correo", e, todo.includes(e)]),
  ["Correo principal", SITIO.email, texto.contacto.includes(`Email: ${SITIO.email}`)],
  ["Nombre", SITIO.nombre, todo.includes(`© 2024 ${SITIO.nombre}`)],
];

let mal = 0;
for (const [que, valor, ok] of controles) {
  console.log(`${ok ? "OK " : "NO "} ${que}: ${valor}`);
  if (!ok) mal++;
}
if (mal) {
  console.log(`\n${mal} datos no coinciden con la web vieja.`);
  process.exit(1);
}
console.log("\nTodos los datos de contacto coinciden con la web vieja.");

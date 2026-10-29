// Chequeo del día del cambio de dominio (y de cualquier día después). Revisa en vivo, sin tocar nada:
//   · El correo sigue en el hosting: MX, SPF, DKIM, mail.roleran.com.uy y la raíz con su IP de siempre.
//   · La web: portada, ficha, canónica, indexación, robots, sitemap, cabeceras de seguridad, 404 propio
//     y que http pase a https.
//   · Las direcciones de la web vieja llevan a la página nueva (también entrando por la raíz).
//   · La API de cotizaciones responde en el dominio y llega al sistema (sin crear nada: pedidos
//     inválidos a propósito y /api/cotizacion/salud).
// Uso: npm run verificar:dominio                         (www.roleran.com.uy, después del cambio)
//      npm run verificar:dominio -- https://roleran.santipuniales.workers.dev   (antes: la de prueba)
//      npm run verificar:dominio -- https://roleran-web.pages.dev https://www.roleran.com.uy
//                                                     (Pages antes de apuntar www: sitio armado para www)
// Con una dirección que no es la del dominio, se salta lo que solo vale para el dominio (raíz, http)
// y espera que no se indexe. La canónica esperada es la del segundo argumento (por defecto, la misma).

const DOMINIO = "https://www.roleran.com.uy";
const BASE = (process.argv[2] ?? DOMINIO).replace(/\/+$/, "");
const ES_DOMINIO = BASE === DOMINIO;
const CANONICA = (process.argv[3] ?? BASE).replace(/\/+$/, "");
const IP_HOSTING = "45.228.65.111";

const resultados = [];
const anotar = (grupo, que, ok, detalle = "") => resultados.push({ grupo, que, ok: Boolean(ok), detalle });

async function dns(nombre, tipo) {
  const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${nombre}&type=${tipo}`, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(15000),
  });
  const j = await r.json();
  return (j.Answer ?? []).filter((a) => a.type === { A: 1, CNAME: 5, MX: 15, TXT: 16, NS: 2 }[tipo]).map((a) => a.data);
}

const pedir = (url, opciones = {}) => fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000), ...opciones });

/** Sigue las redirecciones a mano y devuelve la cadena de direcciones y el último estado. */
async function seguir(url, maximo = 6) {
  const cadena = [url];
  for (let i = 0; i < maximo; i++) {
    const r = await pedir(cadena.at(-1));
    const destino = r.headers.get("location");
    if (r.status < 300 || r.status >= 400 || !destino) return { cadena, estado: r.status, primera: cadena.length > 1 ? cadena[1] : null };
    cadena.push(new URL(destino, cadena.at(-1)).href);
  }
  return { cadena, estado: 0 };
}

async function correo() {
  const g = "Correo";
  const mx = await dns("roleran.com.uy", "MX");
  anotar(g, "MX de roleran.com.uy apunta al hosting", mx.some((m) => /roleran\.com\.uy\.?$/.test(m)), mx.join(", "));
  const raiz = await dns("roleran.com.uy", "A");
  anotar(g, `La raíz sigue en el hosting (${IP_HOSTING}, nube gris)`, raiz.includes(IP_HOSTING) && raiz.length === 1, raiz.join(", "));
  const mail = await dns("mail.roleran.com.uy", "A");
  anotar(g, "mail.roleran.com.uy llega al hosting", mail.includes(IP_HOSTING), mail.join(", "));
  const txt = await dns("roleran.com.uy", "TXT");
  anotar(g, "SPF", txt.some((t) => t.includes("v=spf1")), txt.find((t) => t.includes("v=spf1")) ?? "falta");
  const dkim = await dns("default._domainkey.roleran.com.uy", "TXT");
  anotar(g, "DKIM (default._domainkey)", dkim.some((t) => t.includes("v=DKIM1")), dkim.length ? "está" : "falta");
  const ns = await dns("roleran.com.uy", "NS");
  anotar(g, "Servidores de nombres (informativo)", true, ns.join(", "));
}

async function web() {
  const g = "Web";
  const portada = await pedir(`${BASE}/`);
  const html = portada.status === 200 ? await portada.text() : "";
  anotar(g, "Portada responde 200", portada.status === 200, String(portada.status));
  anotar(g, "Es la web nueva", html.includes("/_next/static/") && html.includes("Casi todo en descartables"));
  anotar(g, `Canónica ${CANONICA}/`, html.includes(`<link rel="canonical" href="${CANONICA}/"`), html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "sin canónica");
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html) || /noindex/i.test(portada.headers.get("x-robots-tag") ?? "");
  if (ES_DOMINIO) anotar(g, "Indexable (sin noindex ni x-robots-tag)", !noindex);
  else anotar(g, "Dirección de prueba sin indexar", noindex);
  const h = (n) => portada.headers.get(n) ?? "";
  anotar(g, "X-Frame-Options: DENY", h("x-frame-options") === "DENY");
  anotar(g, "Strict-Transport-Security", h("strict-transport-security").includes("max-age="));
  anotar(g, "CSP frame-ancestors 'none'", h("content-security-policy").includes("frame-ancestors 'none'"));
  anotar(g, "X-Content-Type-Options: nosniff", h("x-content-type-options") === "nosniff");

  const robots = await (await pedir(`${BASE}/robots.txt`)).text();
  anotar(g, "robots.txt con el sitemap de esta web", robots.includes(`Sitemap: ${CANONICA}/sitemap.xml`));
  if (ES_DOMINIO) anotar(g, "robots.txt no bloquea la web", !/^Disallow:\s*\/\s*$/m.test(robots));
  const sitemap = await pedir(`${BASE}/sitemap.xml`);
  const xml = sitemap.status === 200 ? await sitemap.text() : "";
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  anotar(g, "sitemap.xml con direcciones de esta web", urls.length > 800 && urls.every((u) => u.startsWith(`${CANONICA}/`)), `${urls.length} direcciones`);

  const ficha = await pedir(`${BASE}/productos/vaso-550-cc/`);
  anotar(g, "Ficha de producto 200", ficha.status === 200, String(ficha.status));
  const sinBarra = await pedir(`${BASE}/productos/vaso-550-cc`);
  anotar(g, "Sin barra final redirige a con barra", [301, 307, 308].includes(sinBarra.status) && (sinBarra.headers.get("location") ?? "").endsWith("/productos/vaso-550-cc/"), `${sinBarra.status} → ${sinBarra.headers.get("location")}`);
  const noExiste = await pedir(`${BASE}/esta-pagina-no-existe-${Date.now()}/`);
  const html404 = await noExiste.text();
  anotar(g, "Página que no existe: 404 propio", noExiste.status === 404 && html404.includes("No encontramos esta página"), String(noExiste.status));
  if (ES_DOMINIO) {
    const http = await pedir(DOMINIO.replace("https://", "http://") + "/");
    anotar(g, "http:// pasa a https://", [301, 302, 307, 308].includes(http.status) && (http.headers.get("location") ?? "").startsWith("https://"), `${http.status} → ${http.headers.get("location") ?? "sin redirección"}`);
  }
}

async function redirecciones() {
  const g = "Web vieja";
  const casos = [
    ["/product/vaso-550-cc-x1000/", "/productos/vaso-550-cc/"],
    ["/product-category/bandejas/", "/categorias/bandejas/"],
    ["/tienda/", "/productos/"],
    ["/cart/", "/pedido/"],
    ["/contacto/", "/contacto/"],
    ["/nosotros/", "/nosotros/"],
  ];
  for (const [vieja, nueva] of casos) {
    const r = await seguir(`${BASE}${vieja}`);
    anotar(g, `${vieja} → ${nueva}`, r.estado === 200 && r.cadena.at(-1) === `${BASE}${nueva}`, `${r.estado} ${r.cadena.at(-1)}`);
  }
  if (ES_DOMINIO) {
    for (const raiz of ["https://roleran.com.uy/product/vaso-550-cc-x1000/", "http://roleran.com.uy/"]) {
      const r = await seguir(raiz);
      const esperado = raiz.endsWith("/product/vaso-550-cc-x1000/") ? `${DOMINIO}/productos/vaso-550-cc/` : `${DOMINIO}/`;
      anotar(g, `Raíz: ${raiz} → ${esperado}`, r.estado === 200 && r.cadena.at(-1) === esperado, `${r.estado} ${r.cadena.join(" → ")}`);
    }
  }
}

async function api() {
  const g = "Cotizaciones";
  const url = `${BASE}/api/cotizacion/reservar`;
  const json = { "content-type": "application/json" };
  const get = await pedir(url);
  anotar(g, "GET a la API: 405", get.status === 405, String(get.status));
  const ajeno = await pedir(url, { method: "POST", headers: { ...json, origin: "https://otra-web.example" }, body: "{}" });
  anotar(g, "Desde otra web: 403", ajeno.status === 403, String(ajeno.status));
  const malo = await pedir(url, { method: "POST", headers: { ...json, origin: BASE }, body: JSON.stringify({ sesion: "corta", datos: {} }) });
  const cuerpo = await malo.json().catch(() => null);
  anotar(g, "Datos inválidos: 400 del Worker (la API corre en esta dirección)", malo.status === 400 && cuerpo?.error === "datos", `${malo.status} ${JSON.stringify(cuerpo)}`);
  const salud = await pedir(`${BASE}/api/cotizacion/salud`);
  anotar(g, "La web llega al sistema con su token (las cotizaciones entran)", salud.status === 200, `${salud.status} ${await salud.text()}`);
}

console.log(`Chequeo de ${BASE}${ES_DOMINIO ? "" : " (dirección de prueba)"}\n`);
for (const paso of [correo, web, redirecciones, api]) {
  try {
    await paso();
  } catch (e) {
    anotar(paso.name, "No se pudo revisar", false, e.message);
  }
}
let grupo = "";
for (const r of resultados) {
  if (r.grupo !== grupo) console.log(`\n${(grupo = r.grupo)}`);
  console.log(`  ${r.ok ? "OK" : "NO"}  ${r.que}${r.detalle ? `  (${r.detalle})` : ""}`);
}
const mal = resultados.filter((r) => !r.ok).length;
console.log(mal ? `\n${mal} problemas.` : "\nTodo en orden.");
process.exit(mal ? 1 : 0);

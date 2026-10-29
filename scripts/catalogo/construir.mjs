// Construye el catálogo limpio a partir de los datos crudos de WooCommerce.
// Uso: node scripts/catalogo/construir.mjs [carpeta-cruda]
// Entradas:  data/raw/<fecha>/p*.json, cats.json · data/correcciones.json · data/imagenes.json (opcional)
//            data/slugs.lock.json (slugs ya publicados; nunca se cambian)
// Salidas:   data/catalogo.json · data/categorias.json · data/rubros.json · data/redirecciones.json
//            docs/CATALOGO-REVISION.csv
import fs from "node:fs";
import path from "node:path";
import { decodificarEntidades, htmlATexto, normalizar, slugificar, miles } from "./lib/texto.mjs";
import { limpiarNombre } from "./lib/nombres.mjs";
import { extraerAtributos, presentacionDeDescripcion, packDesdeSku } from "./lib/atributos.mjs";
import { CATEGORIAS, REGLAS_CATEGORIA, buscarCategoria, categoriaRaiz } from "./lib/taxonomia.mjs";
import { RUBROS } from "./lib/rubros.mjs";
import { generarDescripciones } from "./lib/descripciones.mjs";

const RAIZ = process.cwd();
const leer = (p, def) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : def);

// Precios: salen del sistema y SOLO si el dueño prendió «Mostrar precios en la web pública» (con
// confirmación, en el sistema). Apagado, data/sistema.json no trae ningún precio: npm run datos:sistema
// ni los pide. Lo que diga data/web.json (mostrarPrecios) es lo que usa la web para mostrarlos.
const DATOS_SISTEMA = leer(path.join(RAIZ, "data", "sistema.json"), null);
const MOSTRAR_PRECIOS = DATOS_SISTEMA?.precios_en_web === true;
const PRECIOS = new Map(
  MOSTRAR_PRECIOS
    ? (DATOS_SISTEMA.productos ?? []).filter((p) => p.precios?.length).map((p) => [p.sku, p.precios.map((e) => ({ desde: Number(e.desde), precio: Number(e.precio) }))])
    : [],
);
const escribir = (p, datos) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, typeof datos === "string" ? datos : JSON.stringify(datos, null, 2) + "\n");
};

// ── 1. Datos crudos ────────────────────────────────────────────────────────────
function carpetaCrudaMasNueva() {
  const base = path.join(RAIZ, "data", "raw");
  const fechas = fs.readdirSync(base).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return path.join(base, fechas.at(-1));
}
const argCarpeta = process.argv.slice(2).find((a) => !a.startsWith("--"));
const BLOQUEAR_SLUGS = process.argv.includes("--bloquear-slugs");
const carpeta = argCarpeta ? path.resolve(argCarpeta) : carpetaCrudaMasNueva();
const crudos = fs
  .readdirSync(carpeta)
  .filter((f) => /^p\d+\.json$/.test(f))
  .sort((a, b) => Number(a.slice(1, -5)) - Number(b.slice(1, -5)))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(carpeta, f), "utf8")));
const catsViejas = JSON.parse(fs.readFileSync(path.join(carpeta, "cats.json"), "utf8"));

const correcciones = leer(path.join(RAIZ, "data", "correcciones.json"), {});
const imagenesInfo = leer(path.join(RAIZ, "data", "imagenes.json"), { imagenes: {} });
const slugsLock = leer(path.join(RAIZ, "data", "slugs.lock.json"), {});

const errores = [];
const avisos = [];

// ── 2. Producto por producto ──────────────────────────────────────────────────
function limpiarSku(sku) {
  const s = String(sku ?? "").trim().replace(/^\|+/, "");
  return s || null;
}

function idDe(p) {
  const sku = limpiarSku(p.sku);
  return sku ? slugificar(sku.replace(/\//g, "-").replace(/\+/g, "mas").replace(/ñ/gi, "n")) : `r${p.id}`;
}

function parsearPresentacion(txt) {
  // "caja:1000" · "paquete:12:rollos" · "kg" · "unidad" · "metro" · "consultar"
  const [tipo, unidades, detalle] = String(txt).split(":");
  return { tipo, unidades: unidades ? Number(unidades) : undefined, detalle: detalle || undefined };
}

function textoPresentacion(pres) {
  const u = pres.unidades ? miles(pres.unidades) : "";
  const det = pres.detalle ? ` ${pres.detalle}` : "";
  switch (pres.tipo) {
    case "caja": return `Caja × ${u}${det}`;
    case "funda": return `Funda × ${u}${det}`;
    case "paquete": return u ? `Paquete × ${u}${det}` : `Paquete de ${pres.detalle}`;
    case "tubo": return `Tubo × ${u}${det}`;
    case "rollo": return u ? `Rollo × ${u}${det}` : "Rollo";
    case "kg": return "Por kg";
    case "metro": return "Por metro";
    case "unidad": return "Por unidad";
    default: return "Por unidad o por mayor"; // igual que PRESENTACION_ABIERTA en src/lib/presentacion.ts
  }
}

const CATEGORIAS_UNIDAD = new Set([
  "utensilios-de-cocina", "contenedores-y-cajones", "articulos-de-limpieza", "basureros-y-dispensadores",
  "organizacion", "bano", "macetas", "otros-hogar", "selladoras", "rotuladoras-y-turnos", "papeleria",
]);

// Categorías donde una medida "A × B" sin unidad está en centímetros (convención de bolsas, papeles y cajas).
const CATEGORIAS_CM = new Set([
  "bolsas-camiseta", "bolsas-de-residuos", "bolsas-de-papel", "bolsas-en-rollo", "bolsas-para-vacio",
  "bolsas-de-nylon-por-kilo", "bolsas-impresas", "blondas-rodales-y-bases", "papel-para-envolver",
  "film-aluminio-y-papel-de-cocina", "toallas-y-rollos-de-cocina", "servilletas", "cajas-para-pizza",
  "cajas-para-masas-y-postres", "cajas-para-comidas", "conos-y-portapanchos", "bano",
]);

/** "33/33" → "33 × 33" (salvo rollos de registradora) y agrega "cm" a medidas sin unidad donde corresponde. */
function normalizarMedidasEnNombre(nombre, categoria) {
  let n = nombre;
  if (!/registradora|térmico|ticket/i.test(n)) n = n.replace(/\b(\d{2,})\/(\d{2,})\b/g, "$1 × $2");
  if (CATEGORIAS_CM.has(categoria)) {
    n = n.replace(/(?<![\d,])(\d+(?:,\d+)? × \d+(?:,\d+)?(?: × \d+(?:,\d+)?)?)(?![\d,]| ?×| ?(?:cm|mm|m)\b)/g, "$1 cm");
  }
  return n;
}

function asignarCategoria(texto) {
  for (const [re, slug] of REGLAS_CATEGORIA) if (re.test(texto)) return slug;
  return null;
}

function construirProducto(p, corr) {
  const id = idDe(p);
  const skuOriginal = String(p.sku ?? "");
  const sku = limpiarSku(p.sku);
  const nombreOriginal = decodificarEntidades(p.name).replace(/[\s ]+/g, " ").trim();
  const descripcionOriginal = htmlATexto(p.description);
  const auto = limpiarNombre(p.name);
  const catsViejasProd = p.categories.map((c) => c.slug);

  // categoría
  const textoCat = normalizar(`${corr.nombre ?? auto.nombre} | ${nombreOriginal} | cat:${catsViejasProd.join(" cat:")}`);
  let categoria = corr.categoria ?? asignarCategoria(textoCat);
  if (!categoria) {
    errores.push(`${id}: sin categoría (${auto.nombre})`);
    categoria = "hogar";
  }
  if (!buscarCategoria(categoria)) errores.push(`${id}: categoría inexistente ${categoria}`);
  const nombre = corr.nombre ?? normalizarMedidasEnNombre(auto.nombre, categoria);
  const nombreParaReglas = nombre;

  // presentación: corrección > nombre > descripción > código
  let pres = null;
  let fuente = null;
  if (corr.presentacion) {
    pres = parsearPresentacion(corr.presentacion);
    fuente = corr.fuentePresentacion ?? "revision";
  } else if (auto.pack) {
    pres = auto.pack;
    fuente = "nombre";
  } else {
    const pd = presentacionDeDescripcion(descripcionOriginal);
    const ficha = descripcionOriginal.match(/Unidades por (Caja|Funda|Bulto):?\s*(\d+)/i) ?? descripcionOriginal.match(/Cantidad por (funda|caja):?\s*(\d+)/i);
    if (pd) {
      pres = pd;
      fuente = "descripcion";
    } else if (ficha) {
      pres = { tipo: ficha[1].toLowerCase() === "funda" ? "funda" : "caja", unidades: Number(ficha[2]) };
      fuente = "ficha";
    } else {
      const ps = packDesdeSku(sku, nombre);
      if (ps) {
        pres = { tipo: "paquete", unidades: ps };
        fuente = "codigo";
      } else if (CATEGORIAS_UNIDAD.has(categoria) || /^Rollo de (film|papel aluminio|papel manteca)/.test(nombreParaReglas)) {
        pres = { tipo: "unidad" };
        fuente = "regla";
      }
    }
  }
  // Sin dato propio (la regla solo suponía venta por unidad): «Por unidad o por mayor». El origen queda en «fuente».
  if (fuente === "regla") pres = { tipo: "consultar" };
  if (!pres || pres.tipo === "consultar") {
    pres = { tipo: "consultar" };
    if (fuente !== "regla") fuente = null;
  }
  const presentacion = {
    tipo: pres.tipo,
    unidades: pres.unidades ?? null,
    detalle: pres.detalle ?? null,
    texto: corr.presentacionTexto ?? textoPresentacion(pres),
    fuente,
    aprox: /aprox/.test(corr.presentacionTexto ?? ""),
    // Solo dato interno: la web ya no muestra «a confirmar». Lo deducido del código o de la ficha cuenta como dato de Roleran.
    aConfirmar: pres.tipo === "consultar",
  };

  // atributos
  const atributos = { ...extraerAtributos({ nombre, nombreOriginal, sku, descripcionOriginal }) };
  for (const [k, v] of Object.entries(corr.atributos ?? {})) {
    if (v === null) delete atributos[k];
    else atributos[k] = v;
  }
  if (presentacion.unidades) atributos.unidadesPorPaquete = presentacion.unidades;
  atributos.presentacion = presentacion.texto;
  const extras = (corr.extras ?? []).map(([etiqueta, valor]) => ({ etiqueta, valor }));

  const pendientes = [...(corr.pendientes ?? [])];
  if (presentacion.fuente === "ficha") pendientes.push("Presentación tomada de la ficha del fabricante (caja cerrada): confirmar si se vende fraccionado.");
  if (presentacion.tipo === "consultar") pendientes.push("Falta la presentación de venta.");
  if (presentacion.fuente === "regla") pendientes.push("Sin presentación: antes se suponía venta por unidad.");

  const prod = {
    id,
    wpId: p.id,
    sku,
    skuOriginal,
    skuProvisorio: !sku,
    slug: null,
    nombre,
    nombreOriginal,
    categoria,
    categoriasSecundarias: corr.secundarias ?? [],
    categoriasViejas: catsViejasProd,
    rubros: [],
    atributos,
    extras,
    presentacion,
    paso: presentacion.tipo === "kg" ? 0.5 : 1,
    minimo: presentacion.tipo === "kg" ? 0.5 : 1,
    descripcionCorta: "",
    descripcion: "",
    imagenes: [],
    precios: (PRECIOS.get(sku) ?? []).sort((x, y) => x.desde - y.desde),
    visible: corr.visible ?? true,
    destacado: corr.destacado ?? false,
    pendientes,
    sinonimos: corr.sinonimos ?? [],
    duplicadoDe: corr.duplicadoDe ?? null,
    urlVieja: p.permalink ? new URL(p.permalink).pathname : null,
    fechaAlta: null,
    _corr: corr,
    _descOriginal: descripcionOriginal,
    _imagenesCrudas: p.images.map((im) => ({ id: im.id, src: im.src, nombre: im.name })),
  };
  const { descripcion, descripcionCorta } = generarDescripciones(prod, { uso: corr.uso, notas: corr.notas });
  prod.descripcion = descripcion;
  prod.descripcionCorta = descripcionCorta;
  return prod;
}

// ── 2b. El sistema de gestión manda (data/sistema.json, npm run datos:sistema) ──
// Qué productos hay, nombre, categoría, presentación, sinónimos, descripción y si se muestran salen
// del sistema. La descripción del sistema reemplaza a la armada por las reglas; vacía, queda la armada.
// Solo se pisa lo que difiere de lo que arman las reglas, así un producto sin cambios en el sistema
// queda igual que siempre (misma fuente de presentación, mismas descripciones).
const sistema = leer(path.join(RAIZ, "data", "sistema.json"), null)?.productos ?? null;
const sinUsar = new Set(sistema ?? []);
const sisPorWebId = new Map((sistema ?? []).filter((s) => s.web_id).map((s) => [s.web_id, s]));
const sisPorSku = new Map((sistema ?? []).map((s) => [s.sku, s]));

function presentacionDelSistema(s) {
  return { tipo: s.presentacion_tipo, unidades: s.unidades_por_presentacion ?? null, texto: s.presentacion_texto };
}

/** Correcciones que hacen falta para que el producto quede como dice el sistema. */
function cambiosDelSistema(prod, s) {
  const c = {};
  if (s.nombre !== prod.nombre) c.nombre = s.nombre;
  if (s.categoria_slug !== prod.categoria) {
    if (s.categoria_slug && buscarCategoria(s.categoria_slug)) c.categoria = s.categoria_slug;
    else avisos.push(`${prod.id}: la categoría del sistema «${s.categoria_slug}» no existe en la web; queda ${prod.categoria}`);
  }
  const pres = presentacionDelSistema(s);
  if (pres.tipo !== prod.presentacion.tipo || pres.unidades !== prod.presentacion.unidades || pres.texto !== prod.presentacion.texto) {
    c.presentacion = pres.unidades ? `${pres.tipo}:${pres.unidades}` : pres.tipo;
    c.presentacionTexto = pres.texto;
    c.fuentePresentacion = "sistema";
  }
  if (JSON.stringify(s.sinonimos ?? []) !== JSON.stringify(prod.sinonimos)) c.sinonimos = s.sinonimos ?? [];
  const visible = s.visible_web && s.activo;
  if (visible !== prod.visible) c.visible = visible;
  return c;
}

function conDescripcionDelSistema(prod, s) {
  const d = s.descripcion_corta?.trim();
  if (d) prod.descripcion = d;
  return prod;
}

const productos = crudos.map((p) => {
  const corr = correcciones[idDe(p)] ?? {};
  const prod = construirProducto(p, corr);
  if (!sistema) return prod;
  const s = sisPorWebId.get(prod.id) ?? sisPorSku.get(prod.sku ?? `PROV-${p.id}`);
  if (!s) {
    avisos.push(`${prod.id}: no está en el sistema; se oculta (${prod.nombre})`);
    return construirProducto(p, { ...corr, visible: false });
  }
  sinUsar.delete(s);
  const cambios = cambiosDelSistema(prod, s);
  return conDescripcionDelSistema(Object.keys(cambios).length ? construirProducto(p, { ...corr, ...cambios }) : prod, s);
});

// Productos dados de alta en el sistema que la web vieja no tenía.
for (const s of sinUsar) {
  const pres = presentacionDelSistema(s);
  const crudo = { id: null, sku: s.sku, name: s.nombre, description: "", categories: [], images: [], permalink: null };
  const corr = {
    ...(correcciones[idDe(crudo)] ?? {}),
    nombre: s.nombre,
    categoria: s.categoria_slug && buscarCategoria(s.categoria_slug) ? s.categoria_slug : undefined,
    presentacion: pres.unidades ? `${pres.tipo}:${pres.unidades}` : pres.tipo,
    presentacionTexto: pres.texto,
    fuentePresentacion: "sistema",
    sinonimos: s.sinonimos ?? [],
    visible: s.visible_web && s.activo,
  };
  const prod = conDescripcionDelSistema(construirProducto(crudo, corr), s);
  prod.skuProvisorio = !!s.sku_provisorio;
  prod.fechaAlta = s.creado_en;
  productos.push(prod);
}

// ── 3. Rubros ─────────────────────────────────────────────────────────────────
for (const prod of productos) {
  const texto = normalizar(`${prod.nombre} ${prod.nombreOriginal}`);
  const set = new Set();
  const cats = [prod.categoria, ...prod.categoriasSecundarias];
  for (const r of RUBROS) {
    const porCat = cats.some((c) => r.categorias.includes(c));
    const porTexto = r.incluye.test(texto);
    if ((porCat || porTexto) && !r.excluye.test(texto)) set.add(r.slug);
  }
  for (const cambio of prod._corr.rubros ?? []) {
    if (cambio.startsWith("-")) set.delete(cambio.slice(1));
    else set.add(cambio.replace(/^\+/, ""));
  }
  prod.rubros = RUBROS.map((r) => r.slug).filter((s) => set.has(s));
}

// ── 4. Fechas de alta (para orden "novedades" y control) ─────────────────────
const fechas = new Map();
for (const f of fs.readdirSync(carpeta).filter((f) => /^fechas\d+\.json$/.test(f))) {
  for (const r of JSON.parse(fs.readFileSync(path.join(carpeta, f), "utf8"))) fechas.set(r.id, r);
}
for (const prod of productos) prod.fechaAlta = fechas.get(prod.wpId)?.date?.slice(0, 10) ?? prod.fechaAlta;

// ── 5. Imágenes (estado definido en data/imagenes.json por el pipeline de imágenes) ──
for (const prod of productos) {
  const lista = [];
  for (const im of prod._imagenesCrudas) {
    const info = imagenesInfo.imagenes[String(im.id)];
    if (!info) continue;
    const asignacion = info.productos?.[prod.id];
    const estado = asignacion?.estado ?? info.estado;
    if (estado !== "usar") continue;
    lista.push({
      id: String(im.id),
      base: info.base,
      tamanos: info.tamanos,
      ancho: info.ancho,
      alto: info.alto,
      origen: info.origen,
      alt: prod.nombre,
    });
  }
  const propias = (imagenesInfo.propias?.[prod.id] ?? []).map((im) => ({ ...im, alt: prod.nombre }));
  prod.imagenes = [...propias, ...lista];
}

// ── 6. Slugs estables ─────────────────────────────────────────────────────────
const usados = new Set(Object.values(slugsLock));
for (const prod of productos) {
  if (slugsLock[prod.id]) {
    prod.slug = slugsLock[prod.id];
    continue;
  }
  let base = slugificar(prod.nombre);
  let slug = base;
  if (usados.has(slug) && prod.presentacion.unidades) slug = `${base}-x${prod.presentacion.unidades}`;
  if (usados.has(slug)) slug = `${base}-${prod.id}`;
  let i = 2;
  while (usados.has(slug)) slug = `${base}-${i++}`;
  usados.add(slug);
  slugsLock[prod.id] = slug;
  prod.slug = slug;
}

// ── 7. Duplicados (mismo nombre y presentación) ──────────────────────────────
const porClave = new Map();
for (const prod of productos.filter((p) => p.visible)) {
  const k = normalizar(`${prod.nombre}|${prod.presentacion.texto}`);
  if (!porClave.has(k)) porClave.set(k, []);
  porClave.get(k).push(prod.id);
}
for (const [k, ids] of porClave) if (ids.length > 1) avisos.push(`Posible duplicado visible: ${ids.join(", ")} (${k})`);

// ── 8. Validaciones ──────────────────────────────────────────────────────────
for (const prod of productos) {
  const n = prod.nombre;
  if (/&[#a-z0-9]+;/i.test(n)) errores.push(`${prod.id}: entidad HTML en el nombre: ${n}`);
  if (/ {2}/.test(n)) errores.push(`${prod.id}: doble espacio: ${n}`);
  const letras = n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letras.length > 5 && letras === letras.toUpperCase()) errores.push(`${prod.id}: todo en mayúsculas: ${n}`);
  if (!prod.slug) errores.push(`${prod.id}: sin slug`);
  if (!prod.categoria) errores.push(`${prod.id}: sin categoría`);
  if (prod.duplicadoDe && !productos.some((p) => p.id === prod.duplicadoDe)) errores.push(`${prod.id}: duplicadoDe inexistente`);
}
const idsVistos = new Set();
for (const prod of productos) {
  if (idsVistos.has(prod.id)) errores.push(`id repetido: ${prod.id}`);
  idsVistos.add(prod.id);
}
for (const id of Object.keys(correcciones)) {
  if (!id.startsWith("_") && !idsVistos.has(id)) errores.push(`corrección para un id que no existe: ${id}`);
}

// ── 9. Categorías con conteos ────────────────────────────────────────────────
const visibles = productos.filter((p) => p.visible);
const categorias = CATEGORIAS.map((c) => {
  const directos = visibles.filter((p) => p.categoria === c.slug || p.categoriasSecundarias.includes(c.slug));
  const hijos = CATEGORIAS.filter((h) => h.padre === c.slug).map((h) => h.slug);
  const total = visibles.filter(
    (p) => [p.categoria, ...p.categoriasSecundarias].some((s) => s === c.slug || hijos.includes(s)),
  ).length;
  return { ...c, hijos, cantidad: total, cantidadDirecta: directos.length };
});
for (const c of categorias) if (c.cantidad === 0) avisos.push(`Categoría vacía: ${c.slug}`);

// ── 10. Redirecciones ────────────────────────────────────────────────────────
const porId = new Map(productos.map((p) => [p.id, p]));
const redirecciones = [];
for (const prod of productos) {
  const destino = prod.visible ? prod : porId.get(prod.duplicadoDe);
  if (destino) {
    if (prod.urlVieja) redirecciones.push({ desde: prod.urlVieja, hacia: `/productos/${destino.slug}/`, tipo: "producto" });
    // Duplicado oculto: su página nueva también lleva a la del producto que queda.
    if (destino !== prod) redirecciones.push({ desde: `/productos/${prod.slug}/`, hacia: `/productos/${destino.slug}/`, tipo: "producto" });
    continue;
  }
  if (prod.duplicadoDe) {
    errores.push(`${prod.id}: duplicado de un producto que no existe`);
    continue;
  }
  // Oculto desde el sistema: la URL vieja y la de la web nueva llevan a su categoría.
  const hacia = categorias.find((c) => c.slug === prod.categoria)?.cantidad ? `/categorias/${prod.categoria}/` : "/productos/";
  if (prod.urlVieja) redirecciones.push({ desde: prod.urlVieja, hacia, tipo: "producto" });
  redirecciones.push({ desde: `/productos/${prod.slug}/`, hacia, tipo: "producto" });
}
// categorías viejas → la categoría nueva que concentra sus productos, contando los de sus subcategorías
// viejas (en WooCommerce un producto de «Bandejas de espuma» casi nunca estaba también en «BANDEJAS»).
// Si una categoría nueva tiene el 70 % o más, va ahí; si no, a la categoría principal con más productos.
// data/correcciones.json → _categoriasViejas fija el destino a mano cuando el nombre pide otro.
const correccionesCat = correcciones._categoriasViejas ?? {};
const familiaVieja = (cv) => [cv.slug, ...catsViejas.filter((c) => c.parent === cv.id).flatMap(familiaVieja)];
const masComun = (claves) => {
  const conteo = new Map();
  for (const k of claves) conteo.set(k, (conteo.get(k) ?? 0) + 1);
  return [...conteo.entries()].sort((a, b) => b[1] - a[1])[0] ?? [undefined, 0];
};
for (const cv of catsViejas) {
  const urlVieja = new URL(cv.permalink).pathname;
  let destino = correccionesCat[cv.slug];
  if (!destino) {
    const familia = familiaVieja(cv);
    const prods = visibles.filter((p) => p.categoriasViejas.some((s) => familia.includes(s)));
    const [hoja, n] = masComun(prods.map((p) => p.categoria));
    destino = n >= 0.7 * prods.length ? hoja : masComun(prods.map((p) => categoriaRaiz(p.categoria).slug))[0];
  }
  if (!destino) {
    errores.push(`categoría vieja sin destino: ${cv.slug}`);
    continue;
  }
  redirecciones.push({ desde: urlVieja, hacia: `/categorias/${destino}/`, tipo: "categoria" });
  // WooCommerce también responde a /product-category/<slug-hijo>/ sin el padre
  const corta = `/product-category/${cv.slug}/`;
  if (corta !== urlVieja) redirecciones.push({ desde: corta, hacia: `/categorias/${destino}/`, tipo: "categoria" });
}

// ── 11. Salidas ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- se descartan campos internos
const limpio = productos.map(({ _corr, _descOriginal, _imagenesCrudas, ...resto }) => resto);
// Apagado no puede salir ningún precio, pase lo que pase más arriba.
if (!MOSTRAR_PRECIOS && limpio.some((p) => p.precios?.length)) throw new Error("Hay precios en el catálogo con los precios de la web apagados: no se publica.");
escribir(path.join(RAIZ, "data", "web.json"), { mostrarPrecios: MOSTRAR_PRECIOS, local: DATOS_SISTEMA?.local ?? null });
escribir(path.join(RAIZ, "data", "catalogo.json"), { generado: new Date().toISOString().slice(0, 10), fuente: path.relative(RAIZ, carpeta).replace(/\\/g, "/"), productos: limpio });
escribir(path.join(RAIZ, "data", "categorias.json"), categorias);
escribir(
  path.join(RAIZ, "data", "rubros.json"),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se descartan las reglas internas
  RUBROS.map(({ incluye, excluye, categorias: cats, ...r }) => ({
    ...r,
    cantidad: visibles.filter((p) => p.rubros.includes(r.slug)).length,
  })),
);
escribir(path.join(RAIZ, "data", "redirecciones.json"), redirecciones);
if (BLOQUEAR_SLUGS) escribir(path.join(RAIZ, "data", "slugs.lock.json"), Object.fromEntries(Object.entries(slugsLock).sort()));

// CSV de revisión
const csvCampo = (v) => {
  const s = String(v ?? "");
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const filas = [
  ["sku", "id", "visible", "nombre original", "nombre nuevo", "categoria vieja", "categoria nueva", "secundarias", "rubros", "atributos", "presentacion", "fuente presentacion", "foto", "dudas"],
];
for (const prod of productos) {
  const attrs = Object.entries(prod.atributos)
    .filter(([k]) => !["presentacion", "unidadesPorPaquete"].includes(k))
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" | ");
  const fotoEstados = prod._imagenesCrudas.map((im) => imagenesInfo.imagenes[String(im.id)]?.productos?.[prod.id]?.estado ?? imagenesInfo.imagenes[String(im.id)]?.estado ?? "sin revisar");
  filas.push([
    prod.skuOriginal || "(sin código)",
    prod.id,
    prod.visible ? "sí" : `no (duplicado de ${prod.duplicadoDe})`,
    prod.nombreOriginal,
    prod.nombre,
    prod.categoriasViejas.join(" + "),
    prod.categoria,
    prod.categoriasSecundarias.join(" + "),
    prod.rubros.join(" + "),
    attrs,
    prod.presentacion.texto,
    prod.presentacion.fuente ?? "",
    prod.imagenes.length ? `usar (${prod.imagenes.length})` : fotoEstados.length ? `sin foto usable: ${[...new Set(fotoEstados)].join(", ")}` : "sin foto en la web vieja",
    prod.pendientes.join(" "),
  ]);
}
escribir(path.join(RAIZ, "docs", "CATALOGO-REVISION.csv"), "﻿" + filas.map((f) => f.map(csvCampo).join(",")).join("\n") + "\n");

// ── Resumen ──────────────────────────────────────────────────────────────────
const conFoto = visibles.filter((p) => p.imagenes.length).length;
console.log(`Productos: ${productos.length} (visibles ${visibles.length}, ocultos ${productos.length - visibles.length})`);
console.log(`Con foto usable: ${conFoto} · con placeholder: ${visibles.length - conFoto}`);
console.log(`Presentación: ${["nombre", "descripcion", "revision", "codigo", "regla"].map((f) => `${f} ${productos.filter((p) => p.presentacion.fuente === f).length}`).join(" · ")} · a confirmar sin dato ${productos.filter((p) => p.presentacion.tipo === "consultar").length}`);
console.log(`Redirecciones: ${redirecciones.length}`);
for (const a of avisos) console.log("AVISO", a);
if (errores.length) {
  for (const e of errores) console.error("ERROR", e);
  process.exit(1);
}
console.log("OK");

"use client";
// Página «Cotización»: renglones, notas, datos opcionales y pedido de cotización por WhatsApp.
import { BotonWhatsApp } from "@/components/BotonWhatsApp";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { EstadoVacio } from "@/components/EstadoVacio";
import { IconoChat, IconoCheck, IconoCopiar, IconoPapelera } from "@/components/iconos";
import { Placeholder } from "@/components/Placeholder";
import { claseBoton, Etiqueta } from "@/components/ui";
import { SITIO } from "@/config/sitio";
import { evento } from "@/lib/analytics";
import { pedido, usePedido } from "@/lib/pedido/almacen";
import { anunciar } from "@/lib/pedido/anuncios";
import { copiarTexto } from "@/lib/pedido/copiar";
import { avisarEnvio, huella, reservarCodigo } from "@/lib/pedido/sistema";
import { unidadDeVenta } from "@/lib/pedido/unidades";
import { faltaParaEnviar, urlPedido, urlWhatsApp } from "@/lib/pedido/whatsapp";
import { SelectorCantidad } from "./SelectorCantidad";

const campo =
  "w-full rounded-control border border-borde-fuerte bg-white px-3 py-2.5 outline-none placeholder:text-tinta-tenue focus:border-verde focus:ring-2 focus:ring-verde/20";

// Rojo también con el foco puesto (al frenar el envío, el cursor queda en el campo que falta).
const campoConError = campo
  .replace("border-borde-fuerte", "border-alerta")
  .replace("focus:border-verde", "focus:border-alerta")
  .replace("focus:ring-verde/20", "focus:ring-alerta/20");

const sinSuscripcion = () => () => {};

export function PaginaPedido() {
  const p = usePedido();
  const id = useId();
  // false en el HTML estático, true en el navegador: el pedido vive en localStorage.
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [noCopio, setNoCopio] = useState(false);
  const [verMensaje, setVerMensaje] = useState(false);
  const [avisarFaltante, setAvisarFaltante] = useState(false);
  const refEntrega = useRef<HTMLFieldSetElement>(null);
  const refDireccion = useRef<HTMLInputElement>(null);

  // Código del sistema: se pide cuando la cotización está completa y se reusa mientras no se mande.
  // Si después de mandarla cambia algo, ese código ya no vale y se pide otro.
  const huellaActual = huella(p);
  const codigo = p.codigo && (!p.enviado || p.enviado === huellaActual) ? p.codigo : "";
  const completa = montado && p.renglones.length > 0 && !faltaParaEnviar(p);
  const reservadoPara = useRef("");
  useEffect(() => {
    if (!completa || p.enviado === huellaActual || (codigo && reservadoPara.current === huellaActual)) return;
    const control = new AbortController();
    const espera = window.setTimeout(async () => {
      const nuevo = await reservarCodigo(p, control.signal);
      if (!nuevo || control.signal.aborted) return;
      reservadoPara.current = huellaActual;
      if (nuevo !== p.codigo || p.enviado) pedido.codigo(nuevo);
    }, 700);
    return () => {
      window.clearTimeout(espera);
      control.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la huella resume todo el contenido de p
  }, [completa, huellaActual]);

  if (!montado) {
    return (
      <>
        <h1 className="sr-only">Cotización</h1>
        <div className="mt-6 h-64 rounded-panel bg-white motion-safe:animate-pulse" aria-busy="true" aria-label="Cargando tu cotización" />
      </>
    );
  }

  if (p.renglones.length === 0) {
    return (
      <div className="mt-6">
        <h1 className="sr-only">Cotización</h1>
        <EstadoVacio
          titulo="Tu cotización está vacía"
          texto={
            <p>
              Buscá productos y tocá <strong>Agregar</strong>. Cuando termines, pedís la cotización por WhatsApp y te pasamos el precio según la
              cantidad. También podés mandarnos tu lista directamente.
            </p>
          }
        >
          <Link href="/productos/" className={claseBoton("primario")}>
            Ver productos
          </Link>
          <BotonWhatsApp mensaje="Quiero cotizar esta lista:" variante="secundario">
            Mandar mi lista por WhatsApp
          </BotonWhatsApp>
        </EstadoVacio>
      </div>
    );
  }

  const conCodigo = { ...p, codigo };
  const { url, texto } = urlPedido(conCodigo);
  const avisar = (via: "whatsapp" | "copia") => {
    if (!codigo) return;
    avisarEnvio(conCodigo, via);
    pedido.enviado(huellaActual);
  };
  const falta = faltaParaEnviar(p);
  // Retiro o envío (y la dirección si es envío) son obligatorios: sin eso no se manda ni se copia.
  const frenarSiFalta = () => {
    if (!falta) return false;
    setAvisarFaltante(true);
    const destino = falta === "entrega" ? refEntrega.current : refDireccion.current;
    destino?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (falta === "direccion") refDireccion.current?.focus({ preventScroll: true });
    anunciar(falta === "entrega" ? "Elegí retiro en el local o envío" : "Escribí la dirección de entrega");
    return true;
  };
  const copiar = async () => {
    if (frenarSiFalta()) return;
    if (await copiarTexto(texto)) {
      avisar("copia");
      setNoCopio(false);
      setCopiado(true);
      anunciar("Lista copiada");
      window.setTimeout(() => setCopiado(false), 2500);
    } else {
      // El navegador no deja copiar solo: se muestra el mensaje para copiarlo a mano.
      // Lo va a copiar a mano: también cuenta como mandada.
      avisar("copia");
      setNoCopio(true);
      setVerMensaje(true);
    }
  };
  const alEnviar = (e: React.MouseEvent) => {
    if (frenarSiFalta()) {
      e.preventDefault();
      return;
    }
    avisar("whatsapp");
    evento("begin_checkout", {
      items: p.renglones.map((r) => ({ item_id: r.producto.sku ?? r.producto.id, item_name: r.producto.nombre, quantity: r.cantidad })),
    });
  };
  const errorEntrega = avisarFaltante && falta === "entrega";
  const errorDireccion = avisarFaltante && falta === "direccion";

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[1.85rem] md:text-[2.4rem]">Cotización</h1>
          {codigo && (
            <p className="numeros text-sm text-tinta-tenue" data-testid="codigo-cotizacion">
              Código <strong className="text-tinta">{codigo}</strong>
            </p>
          )}
        </div>

        <ul className="mt-5 divide-y divide-borde overflow-hidden rounded-panel border border-borde bg-white">
          {p.renglones.map((r) => {
            const u = unidadDeVenta(r.producto.presentacion);
            return (
              <li key={r.producto.id} className="grid grid-cols-[4rem_1fr] gap-x-3 gap-y-3 p-3 sm:grid-cols-[5rem_1fr_auto] sm:p-4">
                <Link href={`/productos/${r.producto.slug}/`} className="block h-16 w-16 overflow-hidden rounded-control border border-borde bg-white sm:h-20 sm:w-20" tabIndex={-1} aria-hidden="true">
                  {r.producto.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${r.producto.imagen}.webp`} alt="" width={80} height={80} className="h-full w-full object-contain" />
                  ) : (
                    <Placeholder tipo={r.producto.placeholder} />
                  )}
                </Link>
                <div className="min-w-0">
                  <Link href={`/productos/${r.producto.slug}/`} className="-my-1 inline-block py-1 font-semibold leading-snug hover:text-verde">
                    {r.producto.nombre}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Etiqueta>
                      {r.producto.presentacion}
                    </Etiqueta>
                    {r.producto.sku && <span className="numeros text-xs text-tinta-tenue">Cód. {r.producto.sku}</span>}
                  </div>
                  <label className="mt-2.5 block">
                    <span className="sr-only">Nota para {r.producto.nombre}</span>
                    <input
                      className={`${campo} h-11 py-0 text-base md:h-10 md:pointer-fine:text-sm`}
                      placeholder="Nota: color, medida, marca…"
                      value={r.nota}
                      maxLength={140}
                      onChange={(e) => pedido.cambiarNota(r.producto.id, e.target.value)}
                    />
                  </label>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-start">
                  <div className="flex items-center gap-2">
                    <SelectorCantidad
                      valor={r.cantidad}
                      paso={r.producto.paso}
                      minimo={r.producto.minimo}
                      etiqueta={`Cantidad de ${r.producto.nombre}`}
                      onCambio={(n) => pedido.cambiarCantidad(r.producto.id, n)}
                    />
                    <span className="w-16 text-sm text-tinta-tenue">{r.cantidad === 1 ? u.singular : u.plural}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      pedido.quitar(r.producto.id);
                      anunciar(`${r.producto.nombre}: quitado de la cotización`);
                    }}
                    className="inline-flex h-11 items-center gap-1.5 rounded-control px-2.5 text-sm font-medium text-tinta-suave hover:bg-alerta-claro hover:text-alerta"
                  >
                    <IconoPapelera tamano={18} /> Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <section className="mt-8" aria-labelledby={`${id}-datos`}>
          <h2 id={`${id}-datos`} className="text-2xl">
            Tus datos
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Nombre <span className="font-normal text-tinta-tenue">(opcional)</span></span>
              <input className={campo} autoComplete="name" value={p.cliente.nombre} onChange={(e) => pedido.cliente({ nombre: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Empresa o comercio <span className="font-normal text-tinta-tenue">(opcional)</span></span>
              <input className={campo} autoComplete="organization" value={p.cliente.empresa} onChange={(e) => pedido.cliente({ empresa: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">RUT <span className="font-normal text-tinta-tenue">(si necesitás factura con RUT)</span></span>
              <input className={campo} inputMode="numeric" value={p.cliente.rut} onChange={(e) => pedido.cliente({ rut: e.target.value.replace(/[^\d]/g, "").slice(0, 12) })} />
            </label>
            <fieldset ref={refEntrega} aria-describedby={errorEntrega ? `${id}-error-entrega` : undefined} className="scroll-mt-28">
              <legend className="mb-1.5 text-sm font-semibold">¿Retirás o te lo enviamos?</legend>
              <div className="flex gap-2">
                {(
                  [
                    ["retiro", "Retiro en el local"],
                    ["envio", "Envío"],
                  ] as const
                ).map(([valor, etiqueta]) => (
                  <label
                    key={valor}
                    className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border px-3 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-verde ${
                      p.cliente.entrega === valor ? "border-verde bg-verde-claro text-verde" : errorEntrega ? "border-alerta bg-white" : "border-borde-fuerte bg-white"
                    }`}
                  >
                    <input type="radio" name="entrega" value={valor} className="sr-only" checked={p.cliente.entrega === valor} onChange={() => pedido.cliente({ entrega: valor })} />
                    {p.cliente.entrega === valor && <IconoCheck tamano={16} />}
                    {etiqueta}
                  </label>
                ))}
              </div>
              {errorEntrega && (
                <p id={`${id}-error-entrega`} className="mt-1.5 text-sm font-semibold text-alerta">
                  Elegí una de las dos opciones.
                </p>
              )}
            </fieldset>
            {p.cliente.entrega === "envio" && (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold">Dirección de entrega</span>
                <input
                  ref={refDireccion}
                  className={`${errorDireccion ? campoConError : campo} scroll-mt-28`}
                  autoComplete="street-address"
                  placeholder="Ej.: Av. Italia 3456, Malvín"
                  aria-invalid={errorDireccion || undefined}
                  aria-describedby={errorDireccion ? `${id}-error-direccion` : undefined}
                  maxLength={160}
                  value={p.cliente.direccion}
                  onChange={(e) => pedido.cliente({ direccion: e.target.value })}
                />
                {errorDireccion && (
                  <span id={`${id}-error-direccion`} className="mt-1.5 block text-sm font-semibold text-alerta">
                    Falta la dirección.
                  </span>
                )}
              </label>
            )}
            {p.cliente.entrega === "retiro" && (
              <p className="text-sm text-tinta-suave sm:col-span-2">
                Retirás en {SITIO.direccion.calle}, {SITIO.horario.texto.toLowerCase()}.
              </p>
            )}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Nota general</span>
              <textarea
                className={`${campo} min-h-24`}
                placeholder="Por ejemplo: «paso a buscarlo el jueves de mañana» o algo que no encontraste en la web."
                value={p.notaGeneral}
                maxLength={600}
                onChange={(e) => pedido.notaGeneral(e.target.value)}
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Pedir cotización">
        <div className="rounded-panel border border-borde bg-white p-4 sm:p-5">
          <p className="titulo text-2xl">
            {p.renglones.length} {p.renglones.length === 1 ? "producto" : "productos"}
          </p>
          <p className="mt-2 text-sm text-tinta-suave">
            Se abre WhatsApp con la lista escrita. Te pasamos el precio según la cantidad y la disponibilidad; si te sirve, lo preparamos.
          </p>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={alEnviar} className={claseBoton("primario", "grande", "mt-5 h-auto! min-h-13 w-full whitespace-normal! px-4! py-2.5 text-center leading-tight sm:px-6!")} data-testid="enviar-whatsapp">
              <IconoChat tamano={22} /> Pedir cotización por WhatsApp
            </a>
          ) : (
            <div className="mt-5 rounded-control bg-kraft-claro p-3 text-sm text-kraft-tinta" role="status">
              Tu lista es larga para mandarla directo. Copiala, abrí WhatsApp y pegala en el chat.
            </div>
          )}
          <button type="button" onClick={copiar} className={claseBoton(url ? "secundario" : "primario", "normal", "mt-3 w-full")} data-testid="copiar-pedido">
            {copiado ? <IconoCheck tamano={20} /> : <IconoCopiar tamano={20} />} {copiado ? "Lista copiada" : "Copiar lista"}
          </button>
          {noCopio && (
            <p className="mt-2 rounded-control bg-kraft-claro p-3 text-sm text-kraft-tinta" role="status">
              Este navegador no deja copiar solo. Mantené apretado el mensaje de abajo, elegí «Seleccionar todo» y «Copiar».
            </p>
          )}
          {!url && (
            <a href={urlWhatsApp()} target="_blank" rel="noopener noreferrer" onClick={alEnviar} className={claseBoton("secundario", "normal", "mt-3 w-full")}>
              <IconoChat tamano={20} /> Abrir WhatsApp
            </a>
          )}
          <details className="mt-4 text-sm" open={verMensaje} onToggle={(e) => setVerMensaje(e.currentTarget.open)}>
            <summary className="flex h-11 cursor-pointer items-center font-semibold text-verde">Ver el mensaje</summary>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-control bg-lienzo p-3 select-all font-sans text-[0.85rem] leading-relaxed text-tinta-suave">{texto}</pre>
          </details>
          <div className="mt-4 border-t border-borde pt-4">
            {confirmarVaciar ? (
              <div role="alertdialog" aria-labelledby={`${id}-vaciar`} className="rounded-control bg-alerta-claro p-3">
                <p id={`${id}-vaciar`} className="text-sm font-semibold text-alerta">
                  ¿Vaciar la cotización? Se borran todos los productos.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className={claseBoton("peligro", "chico")}
                    onClick={() => {
                      pedido.vaciar();
                      setConfirmarVaciar(false);
                      anunciar("Cotización vaciada");
                    }}
                    autoFocus
                  >
                    Sí, vaciar
                  </button>
                  <button type="button" className={claseBoton("fantasma", "chico")} onClick={() => setConfirmarVaciar(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-control px-2 text-sm font-medium text-tinta-suave hover:text-alerta" onClick={() => setConfirmarVaciar(true)}>
                <IconoPapelera tamano={18} /> Vaciar cotización
              </button>
            )}
          </div>
        </div>
        <Link href="/productos/" className="mt-2 inline-flex h-11 items-center font-semibold text-verde hover:underline">
          ← Seguir agregando productos
        </Link>
      </aside>
    </div>
  );
}

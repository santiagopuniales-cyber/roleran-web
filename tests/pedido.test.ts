// Pedido por WhatsApp: número, código de pedido, SKUs y caracteres especiales bien codificados en el enlace.
import { describe, expect, test } from "vitest";
import { LIMITE_URL_WHATSAPP, SITIO } from "@/config/sitio";
import { armarMensaje, faltaParaEnviar, mensajeConsulta, textoRenglon, urlPedido, urlWhatsApp, type Pedido } from "@/lib/pedido/whatsapp";
import type { ProductoResumen } from "@/lib/tipos";

const producto = (p: Partial<ProductoResumen>): ProductoResumen => ({
  id: "x",
  slug: "x",
  nombre: "Producto",
  sku: null,
  presentacion: "Por unidad",
  imagen: null,
  placeholder: "caja",
  paso: 1,
  minimo: 1,
  ...p,
});

const PEDIDO: Pedido = {
  codigo: "R-7K2",
  enviado: "",
  renglones: [
    { producto: producto({ nombre: "Vaso 550 cc", sku: "V550X1000", presentacion: "Paquete × 1.000" }), cantidad: 3, nota: "" },
    { producto: producto({ nombre: "Pote dip 1½ oz (45 cc) con tapa", sku: "DIPS1.5OZ", presentacion: "Paquete × 100" }), cantidad: 2, nota: "Si hay, transparentes & con tapa" },
    { producto: producto({ nombre: "Rollo de papel sulfito 50 cm", sku: "SULF0,50", presentacion: "Por kg", paso: 0.5, minimo: 0.5 }), cantidad: 2.5, nota: "" },
    { producto: producto({ nombre: "Rollo de bolsas 28 × 40 cm", sku: "ROLR57/57/25", presentacion: "Por unidad o por mayor" }), cantidad: 1, nota: "" },
    { producto: producto({ nombre: "Malla para pollo arrollado N.º 16", sku: "MPOLLO#16?", presentacion: "Por metro" }), cantidad: 10, nota: "" },
  ],
  notaGeneral: "Paso el jueves 10 % antes de las 12",
  cliente: { nombre: "Ana", empresa: "Rotisería Ñandú", rut: "211234560018", entrega: "envio", direccion: "Av. Italia 1234, apto 5" },
};

describe("enlace de WhatsApp", () => {
  const { url, texto } = urlPedido(PEDIDO);

  test("va al número de Roleran", () => {
    expect(SITIO.whatsapp.numero).toBe("59893626134");
    expect(url).not.toBeNull();
    expect(url!.startsWith("https://wa.me/59893626134?text=")).toBe(true);
  });

  test("el texto viaja codificado y se recupera idéntico", () => {
    const param = new URL(url!).searchParams.get("text");
    expect(param).toBe(texto);
    // Nada de caracteres que rompan la URL sin codificar.
    const crudo = url!.split("?text=")[1];
    expect(crudo).not.toMatch(/[ #&?\n×ñÑ½º]/);
    expect(crudo).toContain("%0A"); // saltos de línea
  });

  test("incluye el código de pedido y todos los SKU", () => {
    expect(texto).toContain("(R-7K2)");
    for (const r of PEDIDO.renglones) expect(texto).toContain(`Cód. ${r.producto.sku}`);
    const param = new URL(url!).searchParams.get("text")!;
    expect(param).toContain("Cód. ROLR57/57/25");
    expect(param).toContain("Cód. MPOLLO#16?");
    expect(param).toContain("Cód. SULF0,50");
  });

  test("renglones según cómo se vende", () => {
    expect(textoRenglon(PEDIDO.renglones[0])).toBe("3 × Vaso 550 cc (Paquete × 1.000) · Cód. V550X1000");
    expect(textoRenglon(PEDIDO.renglones[2])).toBe("2,5 kg de Rollo de papel sulfito 50 cm · Cód. SULF0,50");
    expect(textoRenglon(PEDIDO.renglones[3])).toBe("1 × Rollo de bolsas 28 × 40 cm (consultar presentación) · Cód. ROLR57/57/25");
    expect(textoRenglon(PEDIDO.renglones[4])).toBe("10 m de Malla para pollo arrollado N.º 16 · Cód. MPOLLO#16?");
  });

  test("notas, datos del cliente y cierre", () => {
    expect(texto).toContain("   Nota: Si hay, transparentes & con tapa");
    expect(texto).toContain("Nota: Paso el jueves 10 % antes de las 12");
    expect(texto).toContain("Empresa: Rotisería Ñandú");
    expect(texto).toContain("RUT: 211234560018");
    expect(texto).toContain("Entrega: envío a Av. Italia 1234, apto 5");
    expect(texto.endsWith("¿Me pasan precio y disponibilidad? Gracias.")).toBe(true);
  });

  test("sin datos opcionales no agrega renglones vacíos", () => {
    const t = armarMensaje({ ...PEDIDO, renglones: PEDIDO.renglones.slice(0, 1), notaGeneral: " ", cliente: { nombre: "", empresa: "", rut: "", entrega: "", direccion: "" } });
    expect(t).toBe("Hola, Roleran S.A. Quiero cotizar estos productos (R-7K2):\n\n1) 3 × Vaso 550 cc (Paquete × 1.000) · Cód. V550X1000\n\n¿Me pasan precio y disponibilidad? Gracias.");
  });

  test("pedido demasiado largo: sin URL, con el texto para copiar", () => {
    const largo: Pedido = { ...PEDIDO, renglones: Array.from({ length: 60 }, (_, i) => ({ ...PEDIDO.renglones[0], producto: { ...PEDIDO.renglones[0].producto, sku: `SKU${i}` } })) };
    const r = urlPedido(largo);
    expect(r.url).toBeNull();
    expect(r.texto).toContain("60) 3 × Vaso 550 cc");
    expect(urlWhatsApp(r.texto).length).toBeGreaterThan(LIMITE_URL_WHATSAPP);
  });

  test("consulta por un producto", () => {
    const m = mensajeConsulta("Vaso 550 cc", "V550X1000", "https://www.roleran.com.uy/productos/vaso-550-cc/");
    expect(m).toBe("Hola, Roleran S.A. Quiero consultar por: Vaso 550 cc (Cód. V550X1000).\nhttps://www.roleran.com.uy/productos/vaso-550-cc/");
    expect(new URL(urlWhatsApp(m)).searchParams.get("text")).toBe(m);
  });
});

describe("código de pedido", () => {
  test("sin código del sistema, el mensaje sale igual y sin paréntesis vacíos", () => {
    const t = armarMensaje({ ...PEDIDO, codigo: "" });
    expect(t.split("\n")[0]).toBe("Hola, Roleran S.A. Quiero cotizar estos productos:");
  });
});

describe("faltaParaEnviar", () => {
  const con = (cliente: Partial<Pedido["cliente"]>): Pedido => ({ ...PEDIDO, cliente: { ...PEDIDO.cliente, ...cliente } });
  test("sin retiro ni envío elegido", () => expect(faltaParaEnviar(con({ entrega: "" }))).toBe("entrega"));
  test("envío sin dirección o con una que no se puede buscar", () => {
    expect(faltaParaEnviar(con({ entrega: "envio", direccion: "" }))).toBe("direccion");
    expect(faltaParaEnviar(con({ entrega: "envio", direccion: "  casa " }))).toBe("direccion");
  });
  test("completo", () => {
    expect(faltaParaEnviar(con({ entrega: "envio", direccion: "Rivera y Soca" }))).toBeNull();
    expect(faltaParaEnviar(con({ entrega: "retiro", direccion: "" }))).toBeNull();
  });
});

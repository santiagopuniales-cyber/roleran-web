// Precios por cantidad: la interfaz existe y funciona con datos de ejemplo aunque la bandera esté apagada.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { filasEscala, formatearPesos, precioPara } from "@/components/precios/escalas";
import { PrecioDesde } from "@/components/precios/PrecioDesde";
import { TablaEscalas } from "@/components/precios/TablaEscalas";
import { BANDERAS, SITIO } from "@/config/sitio";
import web from "../data/web.json";
import catalogo from "../data/catalogo.json";
import sistema from "../data/sistema.json";

// Datos de ejemplo (no son precios reales de Roleran).
const EJEMPLO = [
  { desde: 10, precio: 80 },
  { desde: 1, precio: 100 },
  { desde: 50, precio: 65.5 },
  { desde: 0, precio: 1 }, // inválida: se descarta
];

describe("escalas de precio", () => {
  test("ordena, calcula rangos y ahorro", () => {
    expect(filasEscala(EJEMPLO)).toEqual([
      { desde: 1, hasta: 9, precio: 100, ahorro: null },
      { desde: 10, hasta: 49, precio: 80, ahorro: 20 },
      { desde: 50, hasta: null, precio: 65.5, ahorro: 35 },
    ]);
  });

  test("precio según la cantidad", () => {
    expect(precioPara(EJEMPLO, 1)).toBe(100);
    expect(precioPara(EJEMPLO, 9)).toBe(100);
    expect(precioPara(EJEMPLO, 10)).toBe(80);
    expect(precioPara(EJEMPLO, 500)).toBe(65.5);
    expect(precioPara([], 5)).toBeNull();
  });

  test("formato en pesos uruguayos", () => {
    expect(formatearPesos(1490)).toBe("$ 1.490");
    expect(formatearPesos(65.5)).toBe("$ 65,5");
  });

  test("la tabla muestra cada escala", () => {
    const html = renderToStaticMarkup(<TablaEscalas precios={EJEMPLO} unidad="Paquete × 100" />);
    expect(html).toContain('data-testid="tabla-escalas"');
    expect(html).toContain("Precio por cantidad (Paquete × 100)");
    expect(html).toContain("1 a 9");
    expect(html).toContain("10 a 49");
    expect(html).toContain("50 o más");
    expect(html).toContain("$ 65,5");
    expect(html).toContain("35 %");
  });

  test("«desde» muestra el menor precio; sin escalas no muestra nada", () => {
    expect(renderToStaticMarkup(<PrecioDesde precios={EJEMPLO} />)).toContain("$ 65,5");
    expect(renderToStaticMarkup(<PrecioDesde precios={[]} />)).toBe("");
    expect(renderToStaticMarkup(<TablaEscalas precios={[]} unidad="x" />)).toBe("");
  });
});

// El dueño decide en el sistema si la web muestra precios. Apagado, el catálogo publicado no puede
// traer ni uno (aunque en el sistema cambien todos los precios).
describe("precios en la web pública: solo si el dueño los prendió", () => {
  test("la web muestra precios exactamente cuando el sistema lo dice", () => {
    expect(web.mostrarPrecios).toBe((sistema as { precios_en_web?: boolean }).precios_en_web === true);
    expect(BANDERAS.MOSTRAR_PRECIOS).toBe(web.mostrarPrecios);
  });

  test("apagado, ningún producto trae precios (ni en lo que se baja del sistema)", () => {
    if (web.mostrarPrecios) return;
    expect((catalogo.productos as { precios?: unknown[] }[]).filter((p) => p.precios?.length)).toEqual([]);
    expect((sistema.productos as { precios?: unknown[] }[]).filter((p) => p.precios?.length)).toEqual([]);
  });
});


describe("datos del local", () => {
  test("lo que diga el sistema manda; si no dijo nada, lo escrito en la web", () => {
    const local = (web as { local?: { horario: { texto: string } } | null }).local;
    expect(SITIO.horario.texto).toBe(local ? local.horario.texto : "Lunes a viernes de 9 a 17:30");
    expect(SITIO.horario.dias.every((d) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(d))).toBe(true);
  });
});

// Configuración del sitio: todos los datos de contacto y las banderas viven acá.
// Ningún componente escribe estos datos a mano. Todo coincide con la web vieja (data/raw: portada, contacto y nosotros)
// o lo confirmó Roleran.
import web from "../../data/web.json" with { type: "json" };

/** Lo que el dueño edita en el sistema (Configuración → Web pública). null = lo escrito acá abajo. */
interface DatosDelLocal {
  telefonos: { mostrar: string; enlace: string }[];
  whatsapp: { numero: string; mostrar: string };
  email: string;
  /** dias: 1 = lunes … 7 = domingo. */
  horario: { dias: number[]; abre: string; cierra: string; texto: string; corto: string };
  aviso: string | null;
}
const LOCAL = ((web as { local?: DatosDelLocal | null }).local ?? null) as DatosDelLocal | null;
const DIAS_SCHEMA = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const SITIO = {
  /** Así se presentan: «Roleran S.A.» (pie y banner de la web vieja). */
  nombre: "Roleran S.A.",
  razonSocial: "Roleran S.A.",
  /** Dirección pública del sitio (canónicas, sitemap, Open Graph, JSON-LD y robots). Para otro destino: NEXT_PUBLIC_SITIO_URL. */
  url: (process.env.NEXT_PUBLIC_SITIO_URL || "https://www.roleran.com.uy").replace(/\/+$/, ""),
  lema: "Casi todo en descartables",
  descripcion:
    "Distribuidora de envases descartables en Montevideo: bandejas, vasos, bolsas, cajas, potes, film y más. Armá tu lista y pedí la cotización por WhatsApp.",

  direccion: {
    calle: "Martín García 2287",
    ciudad: "Montevideo",
    departamento: "Montevideo",
    codigoPostal: "11800",
    pais: "UY",
    paisNombre: "Uruguay",
  },
  coordenadas: { lat: -34.8870993, lng: -56.1686526 },
  /** Enlace para abrir el lugar en Google Maps (busca por dirección para no depender de la ficha sin reclamar). */
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=Mart%C3%ADn+Garc%C3%ADa+2287%2C+11800+Montevideo%2C+Uruguay",
  opinionesUrl: "https://www.google.com/maps/search/?api=1&query=Roleran+Mart%C3%ADn+Garc%C3%ADa+2287+Montevideo",

  telefonos: LOCAL?.telefonos ?? [
    { mostrar: "(+598) 2403 1024", enlace: "tel:+59824031024" },
    { mostrar: "(+598) 2401 4993", enlace: "tel:+59824014993" },
  ],
  whatsapp: LOCAL?.whatsapp ?? {
    numero: "59893626134",
    mostrar: "093 626 134",
  },
  /** Correo principal: el de la página de contacto de la web vieja (o el que se ponga en el sistema). */
  email: LOCAL?.email || process.env.NEXT_PUBLIC_EMAIL_CONTACTO || "roleransa@gmail.com",
  /** Los tres que muestra la web vieja: roleransa@gmail.com (contacto y pie), info@ (pie) y contacto@ (pie de la portada). */
  emails: ["roleransa@gmail.com", "info@roleran.com.uy", "contacto@roleran.com.uy"],

  /** Como la página de contacto y la portada de la web vieja (confirmado 9 a 17:30). */
  horario: LOCAL
    ? { texto: LOCAL.horario.texto, corto: LOCAL.horario.corto, dias: LOCAL.horario.dias.map((d) => DIAS_SCHEMA[d - 1]), abre: LOCAL.horario.abre, cierra: LOCAL.horario.cierra }
    : {
        texto: "Lunes a viernes de 9 a 17:30",
        corto: "Lun. a vie. 9 a 17:30",
        dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        abre: "09:00",
        cierra: "17:30",
      },

  /** Aviso arriba de todo (feriados, vacaciones): lo escribe el dueño en el sistema. */
  aviso: LOCAL?.aviso ?? null,

  /** Redes sociales: vacías hasta que el negocio confirme cuáles usa. */
  redes: [] as { nombre: string; url: string }[],

  /** Cloudflare Web Analytics (sin cookies). Cuenta solo en este dominio; los gráficos están en el panel de
   *  Cloudflare → Analytics → Análisis web. Vacío el token = no cuenta nada. */
  contadorVisitas: { token: "3eb99b344bd84b32badc55e44bb8ff66", dominio: "www.roleran.com.uy" },

  /** Google Analytics 4: solo se activa si la variable de entorno tiene un ID. */
  analyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
} as const;

/** Dónde el envío es gratis (confirmado por el dueño el 8/10/2026). */
export const ZONA_ENVIO_GRATIS = "Montevideo y alrededores";

export const BANDERAS = {
  /**
   * Mostrar precios y precios por cantidad: lo decide el dueño en el sistema («Mostrar precios en la web
   * pública», con confirmación). Apagado, el catálogo no trae ningún precio (scripts/catalogo).
   */
  MOSTRAR_PRECIOS: web.mostrarPrecios === true,
  /** «Envío gratis»: confirmado por el dueño (8/10/2026) para Montevideo y alrededores; la zona está en ZONA_ENVIO_GRATIS. */
  MOSTRAR_ENVIOS_SIN_COSTO: true,
  /** «Facturamos con RUT»: confirmado (facturan electrónicamente). */
  MOSTRAR_FACTURA_RUT: true,
} as const;

/** Marcas que muestra la portada de la web vieja (solo el nombre, sin sus logos). */
export const MARCAS_QUE_TRABAJAN = ["Galvanotek", "Atma", "Cotnyl", "Zanetti", "Darnel", "Bandex", "Sanremo"];

/** Largo máximo de la URL de WhatsApp antes de ofrecer «Copiar lista». */
export const LIMITE_URL_WHATSAPP = 1900;

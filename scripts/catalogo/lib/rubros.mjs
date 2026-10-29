// Rubros (tipos de negocio) y reglas para asignarlos a cada producto.
// Un producto entra en un rubro si su categoría está en `categorias` o si su texto coincide con `incluye`,
// y no coincide con `excluye`. Las excepciones se corrigen en data/correcciones.json.
// El texto está normalizado (minúsculas, sin tildes): las palabras van con `s?` para que coincidan los plurales.
// `primero`: categorías que encabezan la página del rubro (lo más propio del rubro arriba); el resto sigue
// en el orden de la taxonomía.

export const RUBROS = [
  {
    slug: "rotiserias-y-delivery",
    nombre: "Rotiserías y delivery",
    titulo: "Envases y descartables para rotiserías y delivery",
    intro:
      "Para despachar comida: bandejas de aluminio con tapa, estuches de espumaplast, potes y dips para salsas, cajas para pizza, hamburguesa y chivito, bolsas, cubiertos, servilletas, guantes y rollos para la registradora.",
    categorias: [
      "bandejas-de-aluminio", "envases-pp-y-pet", "potes-con-tapa", "cajas-para-pizza", "cajas-para-comidas",
      "conos-y-portapanchos", "cubiertos-y-platos", "bolsas-camiseta", "guantes-y-cofias",
    ],
    incluye: /\b(estuches?|marmitas?|hamburguesas?|bolsas?.*(kraft|delivery|empanadas?)|antigrasa|cajon baul|film|aluminio|servilletas?|sorbitos?|dips?|salsas?|registradora|pos|sobres? de papel para cubiertos)\b/,
    excluye: /\b(torteras?|blister|frutillas?|massini|flan|budin|macetas?|jarras?|caja organizadora|alfombras?|cortinas?|paletizar|carameleras?|miel|helados?|sundae|pionono|esponjas?|bidon|decorada|oblea)\b/,
    primero: ["bandejas-de-aluminio", "envases-pp-y-pet", "cajas-para-pizza", "cajas-para-comidas", "potes-con-tapa"],
  },
  {
    slug: "panaderias-y-confiterias",
    nombre: "Panaderías y confiterías",
    titulo: "Envases para panaderías y confiterías",
    intro:
      "Cajas para masas y postres, bandejas de cartón, blondas, rodales, pirotines, moldes de papel, torteras, bolsas para bizcochos y baguettes, envases transparentes para exhibir, guantes y cofias.",
    categorias: [
      "cajas-para-masas-y-postres", "bandejas-de-carton", "blondas-rodales-y-bases", "pirotines-y-moldes-de-papel",
      "mangas-y-reposteria", "bolsas-camiseta", "guantes-y-cofias",
    ],
    incluye: /\b(bizcochos?|baguettes?|pan dulce|budin|torteras?|bisagra|petaca|triangular|massini|flan|pino|sulfito|manteca|sandwich(es)?|empanadas?|pionono|discos?|decorada)\b/,
    excluye: /\b(hamburguesas?|helados?|pancho)\b/,
    primero: ["cajas-para-masas-y-postres", "bandejas-de-carton", "blondas-rodales-y-bases", "pirotines-y-moldes-de-papel", "envases-pp-y-pet"],
  },
  {
    slug: "heladerias",
    nombre: "Heladerías",
    titulo: "Descartables para heladerías",
    intro: "Potes térmicos para helado, cucharitas, bolsas para helado, palitos, copones, vasos, sorbitos y servilletas.",
    categorias: ["potes-termicos-para-helado"],
    incluye: /\b(helados?|sundae|copon(es)?|cucharitas?|cucharas?|vasos? termicos?|servilleta (de )?repuesto|servilleta bocadillo|sorbitos?)\b/,
    excluye: /\b(molde para helados?)\b/,
    primero: ["potes-termicos-para-helado", "bolsas-impresas", "cubiertos-y-platos"],
  },
  {
    slug: "carnicerias-y-supermercados",
    nombre: "Carnicerías y supermercados",
    titulo: "Insumos para carnicerías, almacenes y supermercados",
    intro:
      "Bandejas de espumaplast y plásticas, film, bolsas en rollo y unisold, bolsas para vacío, mallas para carne, papel para envolver, etiquetas de balanza, rotuladoras, números para turnos y cajones.",
    categorias: [
      "bandejas-de-espumaplast", "bolsas-en-rollo", "bolsas-para-vacio", "mallas-y-precintos", "papel-para-envolver",
      "bolsas-camiseta", "bolsas-de-nylon-por-kilo", "rollos-y-etiquetas", "rotuladoras-y-turnos", "selladoras",
      "bolsas-de-residuos", "guantes-y-cofias",
    ],
    incluye: /\b(film|cajon para carniceria|cosechero|bandejas? plasticas? blancas?)\b/,
    excluye: /\b(platos?|discos?|marmitas?|vasos?|oblea|decorada|paletizar|ganchos|biologicas?)\b/,
    primero: ["bandejas-de-espumaplast", "film-aluminio-y-papel-de-cocina", "bolsas-en-rollo", "bolsas-para-vacio", "mallas-y-precintos", "papel-para-envolver"],
  },
  {
    slug: "restaurantes-y-gastronomia",
    nombre: "Restaurantes y gastronomía",
    titulo: "Insumos para restaurantes, bares y cafeterías",
    intro:
      "Servilletas y toallas, film y aluminio, guantes y cofias, utensilios, contenedores, vasos para café y tragos, sorbitos, bolsas de residuos y artículos de limpieza para la cocina y el salón.",
    categorias: [
      "servilletas", "toallas-y-rollos-de-cocina", "film-aluminio-y-papel-de-cocina", "guantes-y-cofias",
      "utensilios-de-cocina", "contenedores-y-cajones", "sorbitos-y-mezcladores", "productos-de-limpieza",
      "articulos-de-limpieza", "papel-higienico", "basureros-y-dispensadores", "bolsas-de-residuos",
      "vasos-de-polipapel", "vasos-termicos", "copas-y-vasos-para-tragos", "mondadientes-y-palitos",
    ],
    incluye: /\b(vasos?|individuales|servilleteros?|mostaceros?|dispensador|copas?|shots?|registradora|pos)\b/,
    excluye: /\b(cajon baul|cosechero|macetas?|ropa|algodon de azucar|palitos? para helados?|biologicas?)\b/,
    primero: ["servilletas", "vasos-plasticos", "vasos-de-polipapel", "copas-y-vasos-para-tragos", "film-aluminio-y-papel-de-cocina", "utensilios-de-cocina"],
  },
  {
    slug: "eventos-y-cumpleanos",
    nombre: "Eventos y cumpleaños",
    titulo: "Descartables para eventos y cumpleaños",
    intro:
      "Velas, globos, vasos, copas y shots, platos y cubiertos, servilletas de colores, torteras, cajas para torta y masas, bandejas para tortas, pirotines, carameleras, cajitas para sorpresas, pop, panchos y palitos para copetín.",
    categorias: [
      "velas-y-globos", "cubiertos-y-platos", "blondas-rodales-y-bases", "copas-y-vasos-para-tragos", "vasos-plasticos",
      "mangas-y-reposteria", "cajas-para-masas-y-postres",
    ],
    incluye: /\b(vasos?|shots?|servilletas? (lisa de color|color|con disenos)|sombrillitas?|espaditas?|brochette|picks?|degustacion|platos?|pirotin(es)?|casquetes?|torteras?|cupulas?|carameleras?|cajita feliz|pop|algodon de azucar|pancho|sandwich(es)?|copetinero|cinta para regalos|discos?|decorada|mezcladores? de plastico para tragos|sorbitos?|bandejas? de carton (rectangular|redonda)|fuente oval de carton)\b/,
    // ^tapa: el texto junta el nombre nuevo y el viejo, así que «...con tapa vaso 500...» no es una tapa suelta.
    excluye: /\b(termicos?|dispensador|helados?|soplete)\b|^tapas?\b/,
    primero: ["velas-y-globos", "pirotines-y-moldes-de-papel", "mangas-y-reposteria", "cajas-para-masas-y-postres", "envases-pp-y-pet", "blondas-rodales-y-bases", "bandejas-de-carton", "vasos-plasticos", "copas-y-vasos-para-tragos", "cubiertos-y-platos", "servilletas"],
  },
  {
    slug: "comercios-y-oficinas",
    nombre: "Comercios y oficinas",
    titulo: "Embalaje y artículos para comercios y oficinas",
    intro:
      "Rollos para registradora, etiquetas, rotuladoras, notas de pedido, cintas adhesivas, bolsas camiseta y de papel, papel kraft, nylon burbuja y film para embalar.",
    categorias: [
      "rollos-y-etiquetas", "papeleria", "rotuladoras-y-turnos", "cintas-adhesivas", "film-para-embalar", "hilos-y-rafia",
      "bolsas-camiseta", "bolsas-de-papel",
    ],
    incluye: /\b(kraft|corrugado|cintero|bobinas?|precintos?|bandas? elasticas?|portarrollos para papel)\b/,
    excluye: /\b(bizcochos?|baguettes?|empanadas?|delivery|sobre de papel para cubiertos)\b/,
    primero: ["rollos-y-etiquetas", "papeleria", "rotuladoras-y-turnos", "cintas-adhesivas", "film-para-embalar"],
  },
];

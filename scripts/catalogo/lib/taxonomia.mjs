// Taxonomía nueva del catálogo, diseñada a partir de los productos reales.
// Cada producto tiene una categoría principal (la más específica) y opcionalmente secundarias.
// Las reglas asignan la categoría por palabras clave; las excepciones van en data/correcciones.json.

/** @type {{slug:string,nombre:string,padre:string|null,orden:number,descripcion:string,placeholder:string}[]} */
export const CATEGORIAS = [
  // ── Bandejas
  { slug: "bandejas", nombre: "Bandejas", padre: null, orden: 1, placeholder: "bandeja",
    descripcion: "Bandejas de espumaplast, cartón y aluminio, y bases para tortas. Para exhibir, envasar y llevar comida." },
  { slug: "bandejas-de-espumaplast", nombre: "Bandejas de espumaplast", padre: "bandejas", orden: 1, placeholder: "bandeja",
    descripcion: "Bandejas blancas, negras y amarillas, platos, discos, estuches y marmitas de espumaplast (poliestireno expandido), en varias medidas." },
  { slug: "bandejas-de-carton", nombre: "Bandejas y fuentes de cartón", padre: "bandejas", orden: 2, placeholder: "bandeja",
    descripcion: "Bandejas rectangulares y redondas numeradas, fuentes ovales y bandejas chicas de cartón para masas, sándwiches, pizzas y postres." },
  { slug: "bandejas-de-aluminio", nombre: "Bandejas y platos de aluminio", padre: "bandejas", orden: 3, placeholder: "bandeja",
    descripcion: "Bandejas de aluminio con tapa (D4 a D8), budineras y platos de aluminio para cocinar, congelar y entregar." },
  { slug: "blondas-rodales-y-bases", nombre: "Blondas, rodales y bases para tortas", padre: "bandejas", orden: 4, placeholder: "rodal",
    descripcion: "Blondas plásticas, rodales de papel redondos y rectangulares, bandejas plateadas y discos dorados para presentar tortas y masas." },

  // ── Envases de PP y PET
  { slug: "envases-pp-y-pet", nombre: "Envases de PP y PET", padre: null, orden: 2, placeholder: "envase",
    descripcion: "Bandejas, estuches, potes con tapa bisagra y torteras transparentes. Según las fichas de los fabricantes, los de PP (polipropileno) son aptos para microondas y los de PET, para freezer." },

  // ── Potes y frascos
  { slug: "potes-y-frascos", nombre: "Potes y frascos", padre: null, orden: 3, placeholder: "pote",
    descripcion: "Potes con tapa para comidas, salsas, miel y helado; frascos, rociadores y botellas plásticas." },
  { slug: "potes-con-tapa", nombre: "Potes con tapa", padre: "potes-y-frascos", orden: 1, placeholder: "pote",
    descripcion: "Potes plásticos con tapa, lisos y acanalados, potes para salsas (dips), potes de miel y carameleras." },
  { slug: "potes-termicos-para-helado", nombre: "Potes térmicos para helado", padre: "potes-y-frascos", orden: 2, placeholder: "pote",
    descripcion: "Potes térmicos de espumaplast para helado de 1/2 kg, 3/4 kg y 1 kg." },
  { slug: "frascos-y-botellas", nombre: "Frascos y botellas", padre: "potes-y-frascos", orden: 3, placeholder: "botella",
    descripcion: "Frascos de PVC y PP, rociadores con gatillo, atomizadores y botellas transparentes y opacas." },

  // ── Vasos
  { slug: "vasos-y-copas", nombre: "Vasos y copas", padre: null, orden: 4, placeholder: "vaso",
    descripcion: "Vasos plásticos, térmicos y de polipapel, shots, copas y tapas." },
  { slug: "vasos-plasticos", nombre: "Vasos plásticos", padre: "vasos-y-copas", orden: 1, placeholder: "vaso",
    descripcion: "Vasos plásticos de 50 cc a 1000 cc, vasos con tapa domo, shots y tapas." },
  { slug: "vasos-termicos", nombre: "Vasos térmicos", padre: "vasos-y-copas", orden: 2, placeholder: "vaso",
    descripcion: "Vasos térmicos de espumaplast de 120 ml a 300 ml." },
  { slug: "vasos-de-polipapel", nombre: "Vasos de polipapel", padre: "vasos-y-copas", orden: 3, placeholder: "vaso",
    descripcion: "Vasos de polipapel (cartón) y sus tapas, de 190 cc a 360 cc." },
  { slug: "copas-y-vasos-para-tragos", nombre: "Copas y vasos para tragos", padre: "vasos-y-copas", orden: 4, placeholder: "copa",
    descripcion: "Copas de vino y champagne, copones y vasos de acrílico para tragos." },

  // ── Cajas de cartón
  { slug: "cajas-de-carton", nombre: "Cajas de cartón", padre: null, orden: 5, placeholder: "caja",
    descripcion: "Cajas para pizza, masas, postres, hamburguesas y chivitos, conos y portapanchos." },
  { slug: "cajas-para-pizza", nombre: "Cajas para pizza", padre: "cajas-de-carton", orden: 1, placeholder: "caja",
    descripcion: "Cajas de cartón para pizza marrones, blancas e impresas, de 23 × 23 a 42 × 42 cm, y cajas para pizza al metro." },
  { slug: "cajas-para-masas-y-postres", nombre: "Cajas para masas y postres", padre: "cajas-de-carton", orden: 2, placeholder: "caja",
    descripcion: "Cajas para masas de 1/4 kg a 1 ½ kg, cajas para postre, cajas para muffins y cajas con visor." },
  { slug: "cajas-para-comidas", nombre: "Cajas para comidas", padre: "cajas-de-carton", orden: 3, placeholder: "caja",
    descripcion: "Cajas para hamburguesa, chivito, sándwiches, ravioles, crepas y take away." },
  { slug: "conos-y-portapanchos", nombre: "Conos y portapanchos", padre: "cajas-de-carton", orden: 4, placeholder: "caja",
    descripcion: "Conos para papas fritas y pop, cilindros, bandejas y cartones para panchos." },

  // ── Bolsas
  { slug: "bolsas", nombre: "Bolsas", padre: null, orden: 6, placeholder: "bolsa",
    descripcion: "Bolsas camiseta, de residuos, de papel, en rollo, para vacío, de nylon por kilo e impresas." },
  { slug: "bolsas-camiseta", nombre: "Bolsas camiseta", padre: "bolsas", orden: 1, placeholder: "bolsa",
    descripcion: "Bolsas camiseta autorizadas y compostables en varias medidas." },
  { slug: "bolsas-de-residuos", nombre: "Bolsas de residuos", padre: "bolsas", orden: 2, placeholder: "bolsa",
    descripcion: "Bolsas de residuos sueltas y en rollo, desde la medida de papelera hasta 120 × 140 cm." },
  { slug: "bolsas-de-papel", nombre: "Bolsas de papel", padre: "bolsas", orden: 3, placeholder: "bolsa-papel",
    descripcion: "Bolsas de papel kraft con asa, bolsas para bizcochos, empanadas, baguettes, farmacia y botellas." },
  { slug: "bolsas-en-rollo", nombre: "Bolsas en rollo", padre: "bolsas", orden: 4, placeholder: "bolsa",
    descripcion: "Rollos de bolsas transparentes, rollos unisold multipliegue para supermercados y bolsas en rollo por kilo." },
  { slug: "bolsas-para-vacio", nombre: "Bolsas para vacío", padre: "bolsas", orden: 5, placeholder: "bolsa",
    descripcion: "Bolsas para envasar al vacío de 16 × 25 a 35 × 50 cm." },
  { slug: "bolsas-de-nylon-por-kilo", nombre: "Bolsas de nylon por kilo", padre: "bolsas", orden: 6, placeholder: "bolsa",
    descripcion: "Bolsas de baja y alta densidad, blanco leche, recuperadas y de polipropileno, que se venden por kilo." },
  { slug: "bolsas-impresas", nombre: "Bolsas impresas", padre: "bolsas", orden: 7, placeholder: "bolsa",
    descripcion: "Bolsas impresas para pan dulce, budín y hamburguesas, y bolsas para helado." },
  { slug: "bobinas-de-nylon", nombre: "Bobinas de nylon", padre: "bolsas", orden: 8, placeholder: "bolsa",
    descripcion: "Bobinas tubulares de nylon negras y transparentes." },

  // ── Cubiertos, platos y sorbitos
  { slug: "cubiertos-platos-y-sorbitos", nombre: "Cubiertos, platos y sorbitos", padre: null, orden: 7, placeholder: "cubierto",
    descripcion: "Cubiertos descartables, platos, sorbitos, mezcladores, mondadientes y palitos." },
  { slug: "cubiertos-y-platos", nombre: "Cubiertos y platos", padre: "cubiertos-platos-y-sorbitos", orden: 1, placeholder: "cubierto",
    descripcion: "Tenedores, cuchillos y cucharas descartables, cucharitas para helado y platos plásticos." },
  { slug: "sorbitos-y-mezcladores", nombre: "Sorbitos y mezcladores", padre: "cubiertos-platos-y-sorbitos", orden: 2, placeholder: "palito",
    descripcion: "Sorbitos biodegradables y mezcladores de plástico y madera para café y tragos." },
  { slug: "mondadientes-y-palitos", nombre: "Mondadientes y palitos", padre: "cubiertos-platos-y-sorbitos", orden: 3, placeholder: "palito",
    descripcion: "Mondadientes, palitos de brochette, para sushi, para helado, picks y espaditas de copetín." },

  // ── Servilletas y papel
  { slug: "servilletas-y-papel-higienico", nombre: "Servilletas y papel higiénico", padre: null, orden: 8, placeholder: "servilleta",
    descripcion: "Servilletas, toallas intercaladas, rollos de cocina y papel higiénico." },
  { slug: "servilletas", nombre: "Servilletas", padre: "servilletas-y-papel-higienico", orden: 1, placeholder: "servilleta",
    descripcion: "Servilletas de repuesto para servilletero, servilletas de mesa, de colores y con diseños, e individuales de papel." },
  { slug: "toallas-y-rollos-de-cocina", nombre: "Toallas y rollos de cocina", padre: "servilletas-y-papel-higienico", orden: 2, placeholder: "rollo",
    descripcion: "Toallas intercaladas, rollos de toalla y rollos de cocina." },
  { slug: "papel-higienico", nombre: "Papel higiénico", padre: "servilletas-y-papel-higienico", orden: 3, placeholder: "rollo",
    descripcion: "Papel higiénico en paquetes y rollos jumbo." },

  // ── Film, aluminio y papel de cocina
  { slug: "film-aluminio-y-papel-de-cocina", nombre: "Film, aluminio y papel de cocina", padre: null, orden: 9, placeholder: "rollo",
    descripcion: "Film para alimentos, papel aluminio en rollo y en hojas, papel manteca, papel antigrasa y láminas de teflón." },

  // ── Papel para envolver
  { slug: "papel-para-envolver", nombre: "Papel para envolver", padre: null, orden: 10, placeholder: "rollo",
    descripcion: "Papel pino, sulfito, kraft y celeste en rollo y cortado, y portarrollos para mostrador." },

  // ── Repostería y cumpleaños
  // El slug viejo queda (ya está publicado); el nombre no dice «cumpleaños» para no confundirse con el rubro
  // «Eventos y cumpleaños», que junta todo lo de una fiesta (vasos, platos, torteras, cajas, etc.).
  { slug: "reposteria-y-cumpleanos", nombre: "Repostería, velas y globos", padre: null, orden: 11, placeholder: "torta",
    descripcion: "Pirotines, moldes de papel, mangas, colorantes, cúpulas para tortas, velas y globos." },
  { slug: "pirotines-y-moldes-de-papel", nombre: "Pirotines y moldes de papel", padre: "reposteria-y-cumpleanos", orden: 1, placeholder: "torta",
    descripcion: "Casquetes (pirotines) numerados y de colores, y moldes de papel para pan dulce, budín, rosca y massini." },
  { slug: "mangas-y-reposteria", nombre: "Mangas y repostería", padre: "reposteria-y-cumpleanos", orden: 2, placeholder: "torta",
    descripcion: "Mangas descartables y flex, colorantes, acetato y cúpulas para tortas." },
  { slug: "velas-y-globos", nombre: "Velas y globos", padre: "reposteria-y-cumpleanos", orden: 3, placeholder: "fiesta",
    descripcion: "Velas de cumpleaños y de números, globos y soportes para globos." },

  // ── Cocina
  { slug: "cocina-y-gastronomia", nombre: "Cocina y gastronomía", padre: null, orden: 12, placeholder: "cocina",
    descripcion: "Utensilios de cocina, contenedores, bandejas plásticas y cajones para comercios gastronómicos y para la casa." },
  { slug: "utensilios-de-cocina", nombre: "Utensilios de cocina", padre: "cocina-y-gastronomia", orden: 1, placeholder: "cocina",
    descripcion: "Sopletes, ralladores, coladores, moldes, jarras medidoras, mostaceros, servilleteros y otros utensilios." },
  { slug: "contenedores-y-cajones", nombre: "Contenedores y cajones", padre: "cocina-y-gastronomia", orden: 2, placeholder: "cocina",
    descripcion: "Contenedores con cierre, bandejas plásticas reutilizables, cajones para carnicería y cajones para delivery." },

  // ── Limpieza
  { slug: "limpieza-e-higiene", nombre: "Limpieza e higiene", padre: null, orden: 13, placeholder: "limpieza",
    descripcion: "Artículos y productos de limpieza, guantes, cofias, basureros y dispensadores." },
  { slug: "articulos-de-limpieza", nombre: "Artículos de limpieza", padre: "limpieza-e-higiene", orden: 1, placeholder: "limpieza",
    descripcion: "Escobas, lampazos, mopas, baldes, paños, rejillas, esponjas y cepillos." },
  { slug: "productos-de-limpieza", nombre: "Productos de limpieza", padre: "limpieza-e-higiene", orden: 2, placeholder: "limpieza",
    descripcion: "Bidones de limpiador, detergente, hipoclorito, jabón y antigrasa, y aromatizadores." },
  { slug: "guantes-y-cofias", nombre: "Guantes y cofias", padre: "limpieza-e-higiene", orden: 3, placeholder: "limpieza",
    descripcion: "Guantes de nitrilo, látex, nylon y goma, y cofias descartables." },
  { slug: "basureros-y-dispensadores", nombre: "Basureros y dispensadores", padre: "limpieza-e-higiene", orden: 4, placeholder: "limpieza",
    descripcion: "Tarros de basura, papeleras y dispensadores de papel higiénico, toalla y jabón." },

  // ── Oficina y comercio
  { slug: "oficina-y-comercio", nombre: "Oficina y comercio", padre: null, orden: 14, placeholder: "oficina",
    descripcion: "Rollos para registradora y etiquetas de balanza, rotuladoras, notas de pedido y artículos de papelería." },
  { slug: "rollos-y-etiquetas", nombre: "Rollos y etiquetas", padre: "oficina-y-comercio", orden: 1, placeholder: "oficina",
    descripcion: "Rollos de papel térmico y común para registradora, rollos para rotuladora y etiquetas de balanza." },
  { slug: "papeleria", nombre: "Papelería", padre: "oficina-y-comercio", orden: 2, placeholder: "oficina",
    descripcion: "Notas de pedido, cuadernolas, hojas A4, marcadores, tijeras, engrampadoras y calculadoras." },
  { slug: "rotuladoras-y-turnos", nombre: "Rotuladoras y turnos", padre: "oficina-y-comercio", orden: 3, placeholder: "oficina",
    descripcion: "Máquinas rotuladoras de precios, dispensadores y rollos de números para turnos." },

  // ── Embalaje
  { slug: "embalaje", nombre: "Embalaje, hilos y cintas", padre: null, orden: 15, placeholder: "embalaje",
    descripcion: "Cintas adhesivas, cinteros, film para paletizar, nylon burbuja, hilos, rafia, mallas, precintos y selladoras." },
  { slug: "cintas-adhesivas", nombre: "Cintas adhesivas", padre: "embalaje", orden: 1, placeholder: "embalaje",
    descripcion: "Cintas transparentes, marrones, de papel, impresas, doble faz, aisladora y cinteros." },
  { slug: "hilos-y-rafia", nombre: "Hilos y rafia", padre: "embalaje", orden: 2, placeholder: "embalaje",
    descripcion: "Hilos de nylon, algodón, poliéster y sisal, y rafia por kilo." },
  { slug: "mallas-y-precintos", nombre: "Mallas y precintos", padre: "embalaje", orden: 3, placeholder: "embalaje",
    descripcion: "Mallas para carne arrollada y frutas, precintos y ganchos forrados." },
  { slug: "film-para-embalar", nombre: "Film para embalar y burbuja", padre: "embalaje", orden: 4, placeholder: "embalaje",
    descripcion: "Film para paletizar, con y sin mango, nylon burbuja por metro y cartón corrugado." },
  { slug: "selladoras", nombre: "Selladoras", padre: "embalaje", orden: 5, placeholder: "embalaje",
    descripcion: "Máquinas selladoras de bolsas." },

  // ── Hogar
  { slug: "hogar", nombre: "Hogar", padre: null, orden: 16, placeholder: "hogar",
    descripcion: "Cajas organizadoras, cestos, artículos de baño, macetas y otros artículos para la casa." },
  { slug: "organizacion", nombre: "Cajas organizadoras y cestos", padre: "hogar", orden: 1, placeholder: "hogar",
    descripcion: "Cajas organizadoras de 10 a 53 litros, cestos rattan y cómodas." },
  { slug: "bano", nombre: "Baño", padre: "hogar", orden: 2, placeholder: "hogar",
    descripcion: "Tapas de inodoro, cortinas, alfombras, escobillas y papeleras de baño." },
  { slug: "macetas", nombre: "Macetas", padre: "hogar", orden: 3, placeholder: "hogar",
    descripcion: "Macetas de 22 a 45 cm, macetas de cultivo y de pared." },
  { slug: "otros-hogar", nombre: "Otros para el hogar", padre: "hogar", orden: 4, placeholder: "hogar",
    descripcion: "Perchas, palillos para ropa, tendederos, cestos de ropa, bancos, felpudos y hules." },
];

// Reglas de asignación: [expresión sobre el texto normalizado (nombre limpio + original + categorías viejas), slug].
// Se evalúan en orden y gana la primera que coincide. El texto está en minúsculas y sin tildes.
export const REGLAS_CATEGORIA = [
  // repostería y fiesta (antes que bandejas/discos)
  [/\b(casquete|pirotin)/, "pirotines-y-moldes-de-papel"],
  [/\bmolde (pan dulce|budin carton|rosca|papel para massini|mini budin)|\bmolde budin carton/, "pirotines-y-moldes-de-papel"],
  [/\b(manga|colorante|acetato|cupula)/, "mangas-y-reposteria"],
  [/\b(vela|globo)/, "velas-y-globos"],
  [/\b(disco dorado|bandeja plateada|blonda|rodal)/, "blondas-rodales-y-bases"],
  // bandejas
  [/\b(espuma|espumaplast|marmita)\b/, "bandejas-de-espumaplast"],
  [/\baluminio\b.*\b(bandeja|plato|budinera)|\b(bandeja|plato|budinera)\b.*\baluminio\b|\bbudinera\b/, "bandejas-de-aluminio"],
  [/\b(fuente de carton|bandeja de carton|bandeja carton|bandeja n\.o|raviolera)\b/, "bandejas-de-carton"],
  // vasos
  [/\b(vaso|tapa vaso|shots?|copa|copon)\b.*\b(termico)\b|\bvaso termico/, "vasos-termicos"],
  [/\bpolipapel\b/, "vasos-de-polipapel"],
  [/\b(acrilico|copa)\b/, "copas-y-vasos-para-tragos"],
  [/\b(vaso|shots?|tapa vaso|dispensador de vasos)\b/, "vasos-plasticos"],
  // envases PP/PET
  [/\b(pp|pet|polipropileno|byt|blister|tortera|ensaladera|triangulo|bisagra|petaca|g-?680|g ?650|frutilla)\b/, "envases-pp-y-pet"],
  // potes
  [/\bpote termico|\bhelado (1|3\/4)/, "potes-termicos-para-helado"],
  [/\b(frasco|botella|atomizador|rociador)\b/, "frascos-y-botellas"],
  [/\b(pote|dips|caramelera)\b/, "potes-con-tapa"],
  // cajas de cartón
  [/\bpizza\b/, "cajas-para-pizza"],
  [/\b(masa|postre|muffin|cupcake|tiras carton|caja con visor)/, "cajas-para-masas-y-postres"],
  [/\b(cono (de pop|papas)|pancho|cilindro fritas)/, "conos-y-portapanchos"],
  [/\b(hamburguesa|chivito|sandwiches|ravioles|crepas|take away|cajita feliz)\b.*\b(caja|estuche|cajita)|\b(caja|estuche|cajas)\b.*\b(hamburguesa|chivito|sandwiches|ravioles|crepas|take away)/, "cajas-para-comidas"],
  // bolsas
  [/\b(camiseta|compostable)/, "bolsas-camiseta"],
  [/\b(residuo|biologica)/, "bolsas-de-residuos"],
  [/\bvacio\b/, "bolsas-para-vacio"],
  [/\bbobina tubular/, "bobinas-de-nylon"],
  [/\bimpresa.*\b(pan dulce|budin|hamburguesa)|\bbolsa.*helado|\bpolipropileno\b.*bolsa|\bbolsas? polipropileno|hojas polipropileno/, "bolsas-impresas"],
  [/\b(unisold|bolsas? (en )?rollo|rollo de bolsas|bolsa en rollo|rollo hoja)\b/, "bolsas-en-rollo"],
  [/\bbolsa.*\b(papel|kraft|bizcocho|baguette|empanada)|\bsobre papel/, "bolsas-de-papel"],
  [/\b(baja densidad|alta densidad|blanco leche|recuperado)\b/, "bolsas-de-nylon-por-kilo"],
  // cubiertos
  [/\b(sorbito|mezclador)/, "sorbitos-y-mezcladores"],
  [/\b(mondadientes|brochette|palitos? (para sushi|para helado|pick)|espadita|palito pick|algodon de azucar)/, "mondadientes-y-palitos"],
  [/\b(tenedor|cuchara|cuchillo|platos plasticos)/, "cubiertos-y-platos"],
  // papel
  [/\bpapel higienico/, "papel-higienico"],
  [/\b(toalla|rollo tom|papel cocina)\b/, "toallas-y-rollos-de-cocina"],
  [/\bservilleta/, "servilletas"],
  [/\b(paletizar|burbuja)\b/, "film-para-embalar"],
  [/\b(film|aluminio|manteca|antigrasa|teflon|freidora)\b/, "film-aluminio-y-papel-de-cocina"],
  [/\b(pino|sulfito|kraft|papel celeste|papel impreso|corrugado|portarrollos)\b/, "papel-para-envolver"],
  // embalaje
  [/\b(cinta|cintero)\b/, "cintas-adhesivas"],
  [/\b(hilo|rafia|ovillo)/, "hilos-y-rafia"],
  [/\b(malla|precinto|gancho.*forrado)/, "mallas-y-precintos"],
  [/\bselladora/, "selladoras"],
  // oficina
  [/\b(rotuladora|turno|numeros dobles|motex)/, "rotuladoras-y-turnos"],
  [/\b(registradora|termico|etiqueta|ticket)/, "rollos-y-etiquetas"],
  [/\b(nota de pedido|cuadernola|hojas a4|marcador|tijera|engrampadora|ganchos engrampadora|banda elastica|calculadora)/, "papeleria"],
  // limpieza
  [/\b(guante|cofia)/, "guantes-y-cofias"],
  [/\b(bidon|aromatizador|limpiador|hipoclorito|detergente)\b/, "productos-de-limpieza"],
  [/\b(basurero|tarro basura|tarro basurero|papelera|dispensador)\b/, "basureros-y-dispensadores"],
  [/\b(escoba|escobillon|lampazo|mopa|balde|pano|rejilla|franela|esponja|cepillo|palangana|palo)\b/, "articulos-de-limpieza"],
  // hogar
  [/\b(tapa inodoro|cortina|alfombra|escobilla)/, "bano"],
  [/\bmaceta/, "macetas"],
  [/\b(caja organizadora|caja organizador|organizador|cesto rattan|comoda)/, "organizacion"],
  [/\b(percha|palillos|tendedero|cesto de ropa|banco|felpudo|hule|pvc transparente|canasto)/, "otros-hogar"],
  // cocina
  [/\b(contenedor|cajon|bandeja plasvale|bandeja plastico|bandeja de plastico)/, "contenedores-y-cajones"],
  // último recurso: la categoría vieja
  [/cat:articulos-de-cocina/, "utensilios-de-cocina"],
  [/cat:articulos-de-limpiez/, "articulos-de-limpieza"],
  [/cat:articulos-de-oficina/, "papeleria"],
  [/cat:bandejas-de-pp-y-pet/, "envases-pp-y-pet"],
  [/cat:bandejas-de-espuma/, "bandejas-de-espumaplast"],
  [/cat:bolsas-en-rollo-por/, "bolsas-en-rollo"],
  [/cat:rollos-papel/, "rollos-y-etiquetas"],
];

export function buscarCategoria(slug) {
  return CATEGORIAS.find((c) => c.slug === slug);
}

export function categoriaRaiz(slug) {
  let c = buscarCategoria(slug);
  while (c && c.padre) c = buscarCategoria(c.padre);
  return c;
}

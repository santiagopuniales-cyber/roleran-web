# Web de Roleran

Sitio de **Roleran S.A.** (envases descartables, Martín García 2287, Montevideo): catálogo, buscador, pedido por WhatsApp y páginas institucionales. Es un sitio estático (Next.js con exportación estática) servido por Cloudflare Pages en https://www.roleran.com.uy.

La conexión con el sistema de gestión de la empresa (API de cotizaciones, lectura del catálogo) no está en este repositorio: vive en un repositorio privado y se agrega solo al publicar (`npm run privado`, ver `.gitignore`). Sin ese código la web se arma y se prueba igual, pero no se puede publicar.

## Requisitos

- Node.js 20.9 o más nuevo y npm.
- Solo para regenerar la fuente: Python 3 con `pip install fonttools brotli` (la fuente recortada ya está en el repo).

## Uso diario

```bash
npm ci                 # instalar dependencias
npm run dev            # desarrollo en http://localhost:3000
npm run build          # genera el sitio en out/ (redirecciones, build, arreglo de prefetch y CSP)
npm run servir         # sirve out/ en http://localhost:4173 como lo haría Cloudflare (_headers, _redirects, 404)
npm run privado        # copia el código privado (desde ../web-privado)
npm run publicar       # trae el catálogo del sistema, arma, prueba, publica en Cloudflare y commitea los datos
```

## Controles de calidad

```bash
npm test               # unitarios: buscador, pedido por WhatsApp, precios por cantidad, redirecciones
npm run e2e            # Playwright: Chromium y WebKit, 390 y 1280 px, axe, teclado, desbordes
npm run verificar      # enlaces internos, SEO técnico y redirecciones, escaneo de contenido (sobre out/)
npm run lighthouse     # Lighthouse en celular, mediana de 5 corridas (con npm run servir en otra terminal)
npm run lint
```

Los navegadores de Playwright van en `../.pw-browsers` (`npm run pw:instalar`), no en la caché compartida de la máquina: los scripts ya ponen `PLAYWRIGHT_BROWSERS_PATH`.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Datos del negocio (teléfonos, horario, correo, banderas) | `src/config/sitio.ts` |
| Catálogo que baja del sistema | `data/sistema.json` (generado al publicar) |
| Catálogo limpio que usa la web | `data/catalogo.json`, `data/categorias.json`, `data/rubros.json` (generados) |
| Correcciones manuales de productos | `data/correcciones.json` |
| Capa de acceso a datos (lo único que leen las páginas) | `src/lib/catalogo.ts` |
| Páginas | `src/app/` |
| Buscador | `src/lib/busqueda/` |
| Pedido por WhatsApp | `src/lib/pedido/` y `src/components/pedido/` |
| Colores, tipografía y medidas | `src/app/globals.css` (bloque `@theme`) |
| Redirecciones de la web vieja | `public/_redirects` (generado por `scripts/seo/redirecciones.mjs`) |
| Cabeceras de seguridad y caché | `public/_headers` |

## Cambiar el catálogo

1. Productos (qué hay, nombre, categoría, presentación, sinónimos, «Activo», «Visible en la web», fotos): en el sistema de gestión. La web se publica sola unos minutos después de cada cambio (`.github/workflows/publicar.yml`, disparado por el sistema; además una vez por día por si algo falló).
2. Lo que es solo de la web (rubros a mano, notas de la descripción, atributos): `data/correcciones.json`. Un nombre o una presentación puestos ahí se pisan con lo del sistema.
3. `npm run catalogo` regenera los JSON y los listados de revisión (en `docs/`, que no se commitea) y valida todo.

Las URLs de los productos están fijadas en `data/slugs.lock.json`: cambiar un nombre no cambia su dirección. Un producto que se oculta o se desactiva deja de publicarse y su URL redirige a su categoría.

## Variables de entorno (opcionales)

Ver `.env.example`.

## Precios

La web está lista para mostrar precios por cantidad, pero está apagado (`BANDERAS.MOSTRAR_PRECIOS` en `src/config/sitio.ts`). Si se prenden, los precios salen del sistema.

// Navegadores de Playwright aislados en C:\Roleran\.pw-browsers (al lado de este proyecto), para no tocar
// la caché compartida de otros proyectos de la máquina. Importarlo ANTES que @playwright/test:
// Playwright lee la variable cuando se carga.
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CARPETA_NAVEGADORES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.pw-browsers");
process.env.PLAYWRIGHT_BROWSERS_PATH ||= CARPETA_NAVEGADORES;

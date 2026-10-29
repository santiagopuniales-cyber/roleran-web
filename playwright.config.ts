// E2E sobre el sitio exportado (out/), servido por scripts/servir.mjs, que imita a Cloudflare Pages
// (barra final, 404.html, _headers y _redirects). Corre en Chromium y WebKit, en 390 y 1280 px.
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Navegadores aislados en ../.pw-browsers (npm run e2e ya lo pone; esto cubre a los procesos de los tests).
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve(__dirname, "../.pw-browsers");

const PUERTO = 4173;
// Con BASE_URL se prueba un sitio ya publicado (por ejemplo, el de Cloudflare antes de cambiar el DNS).
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e.json" }]],
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PUERTO}`,
    locale: "es-UY",
    timezoneId: "America/Montevideo",
    trace: "retain-on-failure",
  },
  webServer: BASE_URL
    ? undefined
    : {
        command: `node scripts/servir.mjs ${PUERTO}`,
        url: `http://localhost:${PUERTO}/`,
        reuseExistingServer: true,
      },
  projects: [
    { name: "chromium-390", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "chromium-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    { name: "webkit-390", use: { ...devices["iPhone 13"] } },
    { name: "webkit-1280", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 900 } } },
  ],
});

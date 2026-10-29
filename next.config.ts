import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { availableParallelism } from "node:os";
import type { NextConfig } from "next";

// Build ID que depende solo del código (no del catálogo): así, si cambia un producto, las demás páginas
// salen idénticas y Cloudflare sube solo lo que cambió (con un ID al azar se resubían ~5.200 archivos
// por publicación). Los manifiestos de _next/static/<ID>/ se cachean como inmutables y dependen del
// código, no de los datos, por eso el ID cambia con cualquier cambio de código commiteado.
function buildIdDelCodigo(): string | null {
  try {
    const codigo = execSync(
      "git ls-files -s -- . \":!data\" \":!public\" \":!docs\" \":!e2e\" \":!tests\" \":!vigia\" \":!screenshots\" \":!*.md\"",
      { encoding: "utf8" },
    );
    return createHash("sha256").update(codigo).digest("hex").slice(0, 20);
  } catch {
    return null; // sin git: Next genera uno al azar
  }
}

// Exportación estática para Cloudflare Pages: sin servidor, sin optimización de imágenes
// en tiempo real (las imágenes se procesan en build con scripts/imagenes).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  generateBuildId: buildIdDelCodigo,
  // En GitHub Actions Next usa núcleos − 1 procesos para armar las páginas (con 2 núcleos, uno solo):
  // como mínimo 2, que arman bastante más rápido.
  ...(process.env.CI ? { experimental: { cpus: Math.max(2, availableParallelism() - 1) } } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

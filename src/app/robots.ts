import type { MetadataRoute } from "next";
import { SITIO } from "@/config/sitio";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/buscar/", "/datos/"] }],
    sitemap: `${SITIO.url}/sitemap.xml`,
    host: SITIO.url,
  };
}

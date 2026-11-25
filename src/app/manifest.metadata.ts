// Preserved metadata prototype; manifest.webmanifest/route.ts owns the public URL.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InfluNex",
    short_name: "InfluNex",
    description: "Influencer ve UGC içerik üretici pazaryeri",
    start_url: "/tr",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#c9ff5b",
  };
}

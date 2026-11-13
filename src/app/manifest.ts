import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07130c",
    theme_color: "#0b3d2e",
    icons: [{ src: "/elanjai-logo.png", sizes: "505x505", type: "image/png", purpose: "any" }],
  };
}

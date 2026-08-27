import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HxH Tracker",
    short_name: "HxH Tracker",
    description: "Trackea tu progreso viendo Hunter x Hunter (2011), sincronizado entre dispositivos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0d0c",
    theme_color: "#0a0d0c",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

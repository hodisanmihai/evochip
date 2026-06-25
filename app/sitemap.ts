import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://evochip.ro",
      lastModified: new Date(),
    },
    {
      url: "https://evochip.ro/proiecte",
      lastModified: new Date(),
    },
  ];
}

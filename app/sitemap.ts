import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/lib/projects/public";
import { listingPath, PROJECTS_PER_PAGE, projectUrl, SITE_URL } from "@/lib/projects/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublicProjects();
  return [
    { url: SITE_URL },
    ...Array.from({ length: Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE)) }, (_, index) => ({
      url: `${SITE_URL}${listingPath(index + 1)}`,
    })),
    // created_at is not a modification timestamp. No synthetic lastmod values.
    ...projects.map((project) => ({ url: projectUrl(project), images: project.image_urls ?? [] })),
  ];
}

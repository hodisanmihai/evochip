import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { readAll } from "@/lib/supabase/services/readAll";
import { normalizeProject, PROJECT_SELECT, type ProjectResponse } from "@/lib/types/project";
import { projectSlug } from "@/lib/projects/slug";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createPublicClient();
  const projects = await readAll((from, to) => client.from("projects")
    .select(PROJECT_SELECT).order("id", { ascending: true }).range(from, to).returns<ProjectResponse[]>());
  return [
    {
      url: "https://evochip.ro",
      lastModified: new Date(),
    },
    {
      url: "https://evochip.ro/proiecte",
      lastModified: new Date(),
    },
    ...projects.map(normalizeProject).filter((project) => project.car_models).map((project) => ({
      url: `https://evochip.ro/proiecte/${projectSlug(project)}`,
    })),
  ];
}

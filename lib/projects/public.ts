import "server-only";
import { cache } from "react";
import { createPublicClient } from "../supabase/public";
import { readAll } from "../supabase/services/readAll";
import { normalizeProject, PROJECT_SELECT, type ProjectResponse } from "../types/project";

// Anonymous access uses the existing RLS rules; never expose admin/session data.
export const getPublicProjects = cache(async () => {
  const client = createPublicClient();
  const rows = await readAll((from, to) => client.from("projects")
    .select(`${PROJECT_SELECT}, created_at`)
    .order("created_at", { ascending: false }).order("id", { ascending: false })
    .range(from, to).returns<(ProjectResponse & { created_at: string | null })[]>());
  return rows.map((row) => ({ ...normalizeProject(row), created_at: row.created_at })).filter((project) => project.car_models);
});

export const getPublicProject = cache(async (slug: string) => {
  const match = /-(\d+)-evochip$/.exec(slug);
  if (!match) return null;
  const { data, error } = await createPublicClient().from("projects").select(PROJECT_SELECT)
    .eq("id", match[1]).returns<ProjectResponse[]>().maybeSingle();
  if (error) throw error;
  return data?.car_models ? normalizeProject(data) : null;
});

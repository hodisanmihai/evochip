import { createPublicClient } from "../public";
import { getContact } from "./contact";
import { allRows } from "./readAll";
import type { PriceProp } from "./landingTypes";

import { normalizeProject, PROJECT_SELECT } from "@/lib/types/project";
import type { ProjectResponse } from "@/lib/types/project";

export async function getLandingData() {
  const supabase = createPublicClient();
  const [projectsRes, pricesRes, socialsRes] = await Promise.all([
    supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(6)
      .returns<ProjectResponse[]>(),
    allRows((from, to) => supabase.from("prices").select("*").order("id", { ascending: true }).range(from, to).returns<PriceProp[]>()),
    getContact(supabase),
  ]);

  const projects = (projectsRes.data ?? []).map(normalizeProject);

  return {
    projects,
    projectsError: Boolean(projectsRes.error),
    prices: pricesRes.data ?? [],
    contact: socialsRes.contact,
    pricesError: Boolean(pricesRes.error),
  };
}

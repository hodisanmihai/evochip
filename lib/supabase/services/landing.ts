import { supabase } from "../client";

export async function getLandingData() {
  const [projectsRes, pricesRes, socialsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("prices").select("*"),
    supabase.from("contact").select("*"),
  ]);

  return {
    projects: projectsRes.data ?? [],
    prices: pricesRes.data ?? [],
    contact: socialsRes.data?.[0] ?? null,
  };
}

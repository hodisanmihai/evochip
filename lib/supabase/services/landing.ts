import { supabase } from "../client";

export async function getLandingData() {
  const [projectsRes, pricesRes, socialsRes] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `
      id,
      combustion,
      engine_capacity,
      engine_code,
      transmition,
      initial_power,
      new_power,
      image_url,
      stage (
        id,
        solution_name
      ),
      car_models (
        id,
        car_model,
        car_brand,
        car_brands (
          id,
          car_brand
        )
      )
    `
      )
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

import { supabase } from "../client";

type RawProject = {
  id: number;
  combustion: string;
  engine_capacity: number | null;
  engine_code: string;
  transmition: string;
  initial_power: number | null;
  initial_torque: number | null;
  new_power: number | null;
  new_torque: number | null;
  note: string;
  image_url: string;
  dyno_file_url: string;
  video_url: string;
  mods: string[] | string | null;

  stage: {
    id: number;
    solution_name: string;
  }[];

  car_models: {
    id: number;
    car_model: string;
    car_brand: number;
    car_brands?: {
      id: number;
      car_brand: string;
    }[];
  }[];
};

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
        initial_torque,
        new_power,
        new_torque,
        note,
        image_url,
        dyno_file_url,
        video_url,
        mods,
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

  // Normalization step for projects
  const rawProjects = (projectsRes.data ?? []) as RawProject[];

  const projects = rawProjects.map((project) => ({
    ...project,
    car_models: Array.isArray(project.car_models)
      ? project.car_models[0]
      : project.car_models,
    stage: project.stage ?? null,
  }));

  return {
    projects,
    prices: pricesRes.data ?? [],
    contact: socialsRes.data?.[0] ?? null,
  };
}

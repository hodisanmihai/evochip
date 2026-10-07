import type { Project } from "../types/project";

export function projectSlug(project: Project): string {
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${slugify(project.car_models?.car_brands?.car_brand || "Unknown")}-${slugify(project.car_models?.car_model || "Unknown")}-${slugify(project.engine_code || "Unknown")}-${slugify(String(project.new_power || 0))}-hp-${slugify(project.stage?.solution_name ?? "Stage nespecificat")}-${project.id}-evochip`;
}

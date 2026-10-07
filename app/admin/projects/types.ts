import type { AdminProject, CarBrand, Stage } from "@/lib/types/project";

export type { CarBrand, ProjectFields } from "@/lib/types/project";
export type ProjectItem = AdminProject;
export type CarBrandItem = CarBrand;
export type RemapItem = Stage;
export type EntityType = "projects" | "car_brands" | "remaps";
export type AnyItem = ProjectItem | CarBrandItem | RemapItem;

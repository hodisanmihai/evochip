
import { normalizeMods } from "../data/validation.ts";
import { projectImages } from "../projects/gallery.ts";
export interface CarBrand {
  id: number;
  car_brand: string;
  created_at?: string;
}

export interface Stage {
  id: number;
  solution_name: string;
  created_at?: string;
}

export interface CarModel {
  id: number;
  car_model: string;
  car_brand: number;
  car_brands: CarBrand | null;
}

// The stored row contains foreign-key IDs, rather than joined objects.
export type ImageMetadata = Record<string, { original: string; description: string }>;

export interface ProjectRow {
  id: number;
  car_models: number | null;
  stage: number | null;
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
  image_urls?: string[] | null;
  image_metadata?: ImageMetadata;
  dyno_file_url: string;
  video_url: string;
  mods: string[] | string | null;
}

export type Project = Omit<ProjectRow, "car_models" | "stage"> & {
  car_models: CarModel | null;
  stage: Stage | null;
};

// The admin list joins the car model, but keeps the stage ID for editing.
export type AdminProject = Omit<ProjectRow, "car_models"> & {
  car_models: CarModel | null;
};

type NumericFormField =
  | "engine_capacity"
  | "initial_power"
  | "initial_torque"
  | "new_power"
  | "new_torque";

export type ProjectFields = Omit<ProjectRow, "id" | "mods" | NumericFormField> &
  Record<NumericFormField, string> & { mods: string[]; image_urls: string[] };

// Only the API boundary accepts both object and array relation shapes.
type Relation<T> = T | T[] | null;
type CarModelResponse = Omit<CarModel, "car_brands"> & {
  car_brands: Relation<CarBrand>;
};

export type ProjectResponse = Omit<Project, "car_models" | "stage"> & {
  car_models: Relation<CarModelResponse>;
  stage: Relation<Stage>;
};

export type AdminProjectResponse = Omit<AdminProject, "car_models"> & {
  car_models: Relation<CarModelResponse>;
};

function singleRelation<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeCarModel(value: Relation<CarModelResponse>): CarModel | null {
  const model = singleRelation(value);
  return model
    ? { ...model, car_brands: singleRelation(model.car_brands) }
    : null;
}

export function normalizeProject(project: ProjectResponse): Project {
  const images = projectImages(project.image_url, project.image_urls);
  return {
    ...project,
    mods: normalizeMods(project.mods),
    image_url: images[0] ?? "",
    image_urls: images,
    car_models: normalizeCarModel(project.car_models),
    stage: singleRelation(project.stage),
  };
}

export function normalizeAdminProject(project: AdminProjectResponse): AdminProject {
  const images = projectImages(project.image_url, project.image_urls);
  return { ...project, image_url: images[0] ?? "", image_urls: images, car_models: normalizeCarModel(project.car_models) };
}

export const PROJECT_SELECT = `
  id, combustion, engine_capacity, engine_code, transmition,
  initial_power, initial_torque, new_power, new_torque,
  note, image_url, image_urls, image_metadata, dyno_file_url, video_url, mods,
  stage (id, solution_name),
  car_models (id, car_model, car_brand, car_brands (id, car_brand))
`;

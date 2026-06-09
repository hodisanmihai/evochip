export type EntityType = "projects" | "car_models" | "remaps";

export interface CarModel {
  id: number;
  car_brand: string;
}

export interface ProjectItem {
  id: string | number;
  brand_id: number | null;
  car_model: string;
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
  mods: string[] | string | null;
  stage: number | null;
  dyno_file_url: string;
  created_at?: string;
  car_models?: CarModel;
}

export interface CarModelItem {
  id: string | number;
  car_brand: string;
  created_at?: string;
}

export interface RemapItem {
  id: string | number;
  solution_name: string;
  created_at?: string;
}

export type AnyItem = ProjectItem | CarModelItem | RemapItem;

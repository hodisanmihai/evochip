export type EntityType = "projects" | "car_brands" | "remaps";

export interface CarBrand {
  id: number;
  car_brand: string;
}

export interface ProjectItem {
  id: number;
  car_models: {
    id: number;

    car_model: string;

    car_brand: number;

    car_brands?: {
      id: number;

      car_brand: string;
    };
  };
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
  stage: number | null;
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

export interface ProjectFields {
  car_models: number | null;
  combustion: string;
  engine_capacity: string;
  engine_code: string;
  transmition: string;
  initial_power: string;
  initial_torque: string;
  new_power: string;
  new_torque: string;
  note: string;
  mods: string[];
  stage: number | null;
  image_url: string;
  dyno_file_url: string;
  video_url: string;
}

export type AnyItem = ProjectItem | CarModelItem | RemapItem;

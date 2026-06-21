export interface CarBrand {
  id: number;
  car_brand: string;
}

export interface CarModelData {
  id: number;
  car_model: string;
  car_brand: number;
  car_brands?: {
    id: number;
    car_brand: string;
  };
}

export interface ProjectItem {
  id: number;
  car_models: CarModelData;
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
  stage: RemapItem | null;
}

export interface ProjectDisplay {
  id: number;
  brandId: number;
  brandName: string;
  modelId: number;
  modelName: string;
  combustion: string;
  engine_code: string;
  initial_power: number | null;
  new_power: number | null;
  stage: RemapItem | null;
  image_url: string;
}

export interface CarFilters {
  search: string;
  brandId: number | null;
  modelId: number | null;
  stage: string | null;
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

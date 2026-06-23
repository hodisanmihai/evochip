export type ContactProp = {
  telefon: string;

  email: string;

  facebook_url?: string;

  instagram_url?: string;

  tiktok_url?: string;
};

export type PriceProp = {
  id: string;
  title: string;
  price: string;
  text_1?: string;
  text_2?: string;
  text_3?: string;
  text_4?: string;
  text_5?: string;
};

export type CarBrand = {
  id: number;
  car_brand: string;
};

export type CarModel = {
  id: number;
  car_model: string;
  car_brand: number;
  car_brands?: CarBrand | CarBrand[];
};

export type Remap = {
  id: number | string;
  solution_name: string;
};

export type ProjectProps = {
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
  stage: Remap[] | null;
  car_models: CarModel;
};

// Alias pentru consistency
export type ProjectItem = ProjectProps;

import { normalizeMods } from "@/lib/data/validation";
import { projectImages } from "@/lib/projects/gallery";
import { ProjectItem, ProjectFields } from "../../../types";

const initialProjectState: ProjectFields = {
  car_models: null,

  combustion: "",
  engine_capacity: "",
  engine_code: "",
  transmition: "",
  initial_power: "",
  initial_torque: "",
  new_power: "",
  new_torque: "",
  note: "",
  mods: [],
  stage: null,
  image_url: "",
  image_urls: [],
  dyno_file_url: "",
  video_url: "",
};

export const getProjectState = (item?: ProjectItem | null): ProjectFields => {
  if (!item) return initialProjectState;


  return {
    car_models: item.car_models?.id ?? null,

    combustion: item.combustion || "",
    engine_capacity: item.engine_capacity?.toString() || "",
    engine_code: item.engine_code || "",
    transmition: item.transmition || "",
    initial_power: item.initial_power?.toString() || "",
    initial_torque: item.initial_torque?.toString() || "",
    new_power: item.new_power?.toString() || "",
    new_torque: item.new_torque?.toString() || "",
    note: item.note || "",
    mods: normalizeMods(item.mods),
    stage: item.stage ?? null,
    image_url: item.image_url || "",
    image_urls: projectImages(item.image_url, item.image_urls),
    dyno_file_url: item.dyno_file_url || "",
    video_url: item.video_url || "",
  };
};

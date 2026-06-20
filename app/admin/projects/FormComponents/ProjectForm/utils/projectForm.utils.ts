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
  dyno_file_url: "",
  video_url: "",
};

export const getProjectState = (item?: ProjectItem | null): ProjectFields => {
  if (!item) return initialProjectState;

  console.log("dyno_file_url:", item.dyno_file_url);
  console.log("image_url:", item.image_url);

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
    mods: getProjectMods(item.mods),
    stage: item.stage ?? null,
    image_url: item.image_url || "",
    dyno_file_url: item.dyno_file_url || "",
    video_url: item.video_url || "",
  };
};

export const getProjectMods = (mods: ProjectItem["mods"]): string[] => {
  if (!mods) return [];

  if (typeof mods === "string") {
    try {
      const parsed = JSON.parse(mods);
      if (Array.isArray(parsed)) {
        return parsed
          .map((m) => {
            try {
              return JSON.parse(m);
            } catch {
              return m;
            }
          })
          .filter((m): m is string => typeof m === "string");
      }
    } catch {
      return mods
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    }
  }

  if (Array.isArray(mods)) {
    return mods
      .map((m) => {
        if (typeof m === "string") {
          try {
            return JSON.parse(m);
          } catch {
            return m;
          }
        }
        return String(m);
      })
      .filter((m): m is string => typeof m === "string");
  }

  return [];
};

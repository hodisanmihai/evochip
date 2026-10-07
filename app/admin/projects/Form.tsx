"use client";

import { validateProject, normalizeMods, withPerformanceDefaults } from "@/lib/data/validation";

import { createClient } from "@/lib/supabase/client";
import { useNotification } from "../context/NotificationContext";
import {
  EntityType,
  ProjectItem,
  CarBrandItem,
  RemapItem,
  ProjectFields,
} from "./types";
import ProjectForm from "./FormComponents/ProjectForm/ProjectForm";
import CarModelForm from "./FormComponents/CarModelForm";
import RemapForm from "./FormComponents/RemapForm";
import { remapsService } from "./services/remap";
import { carModelsService } from "./services/carModels";

import type { ProjectRow } from "@/lib/types/project";

import { notifyProjectsChanged } from "@/lib/projects/useProjectRefresh";

interface FormProps {
  type: EntityType;
  isOpen: boolean;
  onClose: () => void;
  item?: ProjectItem | CarBrandItem | RemapItem | null;
  onSaved?: () => void;
}
interface CarModelFields {
  car_brand: string;
}

const Form = ({ type, isOpen, onClose, item, onSaved }: FormProps) => {
  const { show } = useNotification();
  const entityLabel =
    type === "projects"
      ? "Proiect"
      : type === "car_brands"
        ? "Brand"
        : "Solutie";

  const handleSaveRemap = async (data: { solution_name: string }) => {
    try {
      await remapsService.save(item as RemapItem, data);

      notifyProjectsChanged();
      show("Solutie salvata cu succes.", "success");
      onSaved?.();
    } catch {
      show("Eroare la salvare", "error");
    }
  };

  const handleSaveCarModel = async (data: CarModelFields) => {
    try {
      await carModelsService.save(item as CarBrandItem, data);

      notifyProjectsChanged();
      show(
        item?.id ? "Brand actualizat cu succes." : "Brand adaugat cu succes.",
        "success",
      );

      onSaved?.();
    } catch {
      show("Eroare la salvare", "error");
    }
  };

  const handleSaveProject = async (data: ProjectFields): Promise<boolean> => {
    data = withPerformanceDefaults(data);
    if (Object.keys(validateProject(data)).length) {
      show("Datele proiectului nu sunt valide.", "error");
      return false;
    }
    const supabase = createClient();

    const payload: Omit<ProjectRow, "id"> = {
      car_models: data.car_models,
      combustion: data.combustion,
      engine_capacity: Number(data.engine_capacity),
      engine_code: data.engine_code.trim(),
      transmition: data.transmition,
      initial_power: Number(data.initial_power),
      initial_torque: Number(data.initial_torque),
      new_power: Number(data.new_power),
      new_torque: Number(data.new_torque),
      note: data.note,
      mods: normalizeMods(data.mods),
      stage: data.stage,
      image_url: data.image_url,
      dyno_file_url: data.dyno_file_url,
      video_url: data.video_url,
    };

    try {
      const query = item?.id
        ? supabase.from("projects").update(payload).eq("id", item.id)
        : supabase.from("projects").insert([payload]);
      const { data: saved, error } = await query.select("id").single();
      if (error) throw error;
      if (!saved) throw new Error("Proiectul nu a fost salvat.");
      notifyProjectsChanged();
      show("Proiect salvat", "success");
      return true;
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Încearcă din nou.";
      show("Eroare la salvare: " + message, "error");
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#111111] border border-zinc-800 p-6 rounded-xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">
          {item?.id ? `Editeaza ${entityLabel}` : `Adauga ${entityLabel}`}
        </h2>

        {(() => {
          switch (type) {
            case "car_brands":
              return (
                <CarModelForm
                  key={item?.id ?? "new-car-model"}
                  item={item as CarBrandItem}
                  onSave={handleSaveCarModel}
                  onClose={onClose}
                />
              );
            case "projects":
              return (
                <ProjectForm
                  key={item?.id ?? "new-project"}
                  item={item as ProjectItem}
                  onSave={handleSaveProject}
                  onCommitted={() => onSaved?.()}
                  onClose={onClose}
                />
              );
            case "remaps":
              return (
                <RemapForm
                  key={item?.id ?? "new-remap"}
                  item={item as RemapItem}
                  onSave={handleSaveRemap}
                  onClose={onClose}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default Form;

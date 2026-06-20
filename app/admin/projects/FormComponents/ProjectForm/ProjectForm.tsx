"use client";

import { useState } from "react";
import {
  inputClass,
  labelClass,
  TRANSMITION_OPTIONS,
  COMBUSTION_OPTIONS,
} from "../constants";
import BrandAutocomplete from "./components/BrandAutocomplete";
import ModelsAutocomplete from "./components/ModelsAutocomplete";
import FormActions from "../FormActions";
import ProjectImageUpload from "./components/ProjectImageUpload";
import ProjectFileUpload from "./components/ProjectFileUpload";
import StageSelect from "./components/StageSelect";
import { getProjectState } from "./utils/projectForm.utils";
import { ProjectItem, ProjectFields } from "../../types";
import { useNotification } from "@/app/admin/context/NotificationContext";

const isFormValid = (formData: ProjectFields): boolean => {
  const requiredFields: (keyof ProjectFields)[] = [
    "car_models",
    "combustion",
    "transmition",
    "engine_capacity",
    "engine_code",
    "initial_power",
    "new_power",
    "initial_torque",
    "new_torque",
    "stage",
    "image_url",
    "dyno_file_url",
    "mods",
  ];

  for (const field of requiredFields) {
    const value = formData[field];

    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return false;
    }
  }

  if (
    isNaN(Number(formData.engine_capacity)) ||
    isNaN(Number(formData.initial_power)) ||
    isNaN(Number(formData.new_power)) ||
    isNaN(Number(formData.initial_torque)) ||
    isNaN(Number(formData.new_torque))
  ) {
    return false;
  }

  // logic checks
  if (
    Number(formData.new_power) < Number(formData.initial_power) ||
    Number(formData.new_torque) < Number(formData.initial_torque)
  ) {
    return false;
  }

  return true;
};

const getValidationErrors = (
  formData: ProjectFields
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const requiredFields: (keyof ProjectFields)[] = [
    "car_models",
    "combustion",
    "transmition",
    "engine_capacity",
    "engine_code",
    "initial_power",
    "new_power",
    "initial_torque",
    "new_torque",
    "stage",
  ];

  for (const field of requiredFields) {
    const value = formData[field];

    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[field] = "Acest câmp este obligatoriu";
    }
  }

  if (formData.engine_capacity && isNaN(Number(formData.engine_capacity))) {
    errors.engine_capacity = "Capacitate motor trebuie să fie număr";
  }

  if (formData.initial_power && isNaN(Number(formData.initial_power))) {
    errors.initial_power = "Putere inițială trebuie să fie număr";
  }

  if (formData.new_power && isNaN(Number(formData.new_power))) {
    errors.new_power = "Putere nouă trebuie să fie număr";
  }

  if (formData.initial_torque && isNaN(Number(formData.initial_torque))) {
    errors.initial_torque = "Cuplu inițial trebuie să fie număr";
  }

  if (formData.new_torque && isNaN(Number(formData.new_torque))) {
    errors.new_torque = "Cuplu nou trebuie să fie număr";
  }

  // logic checks
  if (
    formData.initial_power &&
    formData.new_power &&
    Number(formData.new_power) < Number(formData.initial_power)
  ) {
    errors.new_power =
      "Putere nouă trebuie să fie mai mare sau egală cu puterea inițială";
  }

  if (
    formData.initial_torque &&
    formData.new_torque &&
    Number(formData.new_torque) < Number(formData.initial_torque)
  ) {
    errors.new_torque =
      "Cuplu nou trebuie să fie mai mare sau egal cu cuplul inițial";
  }

  return errors;
};

const ProjectForm = ({
  item,
  onSave,
  onClose,
}: {
  item?: ProjectItem | null;
  onSave: (data: ProjectFields) => Promise<void>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<ProjectFields>(() =>
    getProjectState(item)
  );
  const [modInput, setModInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [brandId, setBrandId] = useState<number | null>(() => {
    if (!item?.car_models) return null;
    return (
      item.car_models?.car_brands?.id ?? item.car_models?.car_brand ?? null
    );
  });
  const [showErrors, setShowErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { show } = useNotification();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addMod = () => {
    const modsToAdd = modInput
      .split(",")
      .map((mod) => mod.trim())
      .filter(Boolean);

    if (modsToAdd.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      mods: [
        ...prev.mods,
        ...modsToAdd.filter((mod) => !prev.mods.includes(mod)),
      ],
    }));
    setModInput("");
  };

  const removeMod = (modToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      mods: prev.mods.filter((mod) => mod !== modToRemove),
    }));
  };

  const getModsForSave = () => {
    const modsToAdd = modInput
      .split(",")
      .map((mod) => mod.trim())
      .filter(Boolean);

    return [
      ...formData.mods,
      ...modsToAdd.filter((mod) => !formData.mods.includes(mod)),
    ];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = getValidationErrors(formData);

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      show("Completează toate câmpurile obligatorii", "error");

      return;
    }

    const mods = getModsForSave();
    setFormData((prev) => ({ ...prev, mods }));
    setModInput("");
    setSaving(true);
    await onSave({ ...formData, mods });
    setSaving(false);
  };

  const isValid = isFormValid(formData);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <BrandAutocomplete
        value={brandId}
        onChange={(id: number) => {
          setBrandId(id);
          setFormData((prev) => ({
            ...prev,
            car_models: null,
          }));
          // Clear error
          if (validationErrors.car_models) {
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.car_models;
              return newErrors;
            });
          }
        }}
      />

      <ModelsAutocomplete
        brandId={brandId}
        value={formData.car_models}
        onChange={(modelId: number) => {
          setFormData((prev) => ({
            ...prev,
            car_models: modelId,
          }));
          // Clear error
          if (validationErrors.car_models) {
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.car_models;
              return newErrors;
            });
          }
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Combustibil <span className="text-red-500">*</span>
          </label>
          <select
            name="combustion"
            value={formData.combustion}
            onChange={handleChange}
            className={`${inputClass} ${
              validationErrors.combustion ? "border-red-500" : ""
            }`}
          >
            <option value="">Selecteaza...</option>
            {COMBUSTION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {validationErrors.combustion && (
            <p className="text-xs text-red-400 mt-1">
              {validationErrors.combustion}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Transmisie <span className="text-red-500">*</span>
          </label>
          <select
            name="transmition"
            value={formData.transmition}
            onChange={handleChange}
            className={`${inputClass} ${
              validationErrors.transmition ? "border-red-500" : ""
            }`}
          >
            <option value="">Selecteaza...</option>
            {TRANSMITION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {validationErrors.transmition && (
            <p className="text-xs text-red-400 mt-1">
              {validationErrors.transmition}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Capacitate Motor (cc)</label>
          <input
            name="engine_capacity"
            value={formData.engine_capacity}
            onChange={handleChange}
            type="number"
            placeholder="ex: 1998"
            className={`${inputClass} ${
              validationErrors.engine_capacity ? "border-red-500" : ""
            }`}
          />
          {validationErrors.engine_capacity && (
            <p className="text-xs text-red-400 mt-1">
              {validationErrors.engine_capacity}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Cod Motor</label>
          <input
            name="engine_code"
            value={formData.engine_code}
            onChange={handleChange}
            type="text"
            placeholder="ex: N47D20"
            className={inputClass}
          />
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg p-3 flex flex-col gap-3">
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
          Putere & Cuplu
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Putere Initiala (CP)</label>
            <input
              name="initial_power"
              value={formData.initial_power}
              onChange={handleChange}
              type="number"
              placeholder="ex: 150"
              className={`${inputClass} ${
                validationErrors.initial_power ? "border-red-500" : ""
              }`}
            />
            {validationErrors.initial_power && (
              <p className="text-xs text-red-400 mt-1">
                {validationErrors.initial_power}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Putere Noua (CP)</label>
            <input
              name="new_power"
              value={formData.new_power}
              onChange={handleChange}
              type="number"
              placeholder="ex: 200"
              className={`${inputClass} ${
                validationErrors.new_power ? "border-red-500" : ""
              }`}
            />
            {validationErrors.new_power && (
              <p className="text-xs text-red-400 mt-1">
                {validationErrors.new_power}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Cuplu Initial (Nm)</label>
            <input
              name="initial_torque"
              value={formData.initial_torque}
              onChange={handleChange}
              type="number"
              placeholder="ex: 320"
              className={`${inputClass} ${
                validationErrors.initial_torque ? "border-red-500" : ""
              }`}
            />
            {validationErrors.initial_torque && (
              <p className="text-xs text-red-400 mt-1">
                {validationErrors.initial_torque}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Cuplu Nou (Nm)</label>
            <input
              name="new_torque"
              value={formData.new_torque}
              onChange={handleChange}
              type="number"
              placeholder="ex: 420"
              className={`${inputClass} ${
                validationErrors.new_torque ? "border-red-500" : ""
              }`}
            />
            {validationErrors.new_torque && (
              <p className="text-xs text-red-400 mt-1">
                {validationErrors.new_torque}
              </p>
            )}
          </div>
        </div>
      </div>

      <StageSelect
        value={formData.stage}
        onChange={(stageId) =>
          setFormData((prev) => ({ ...prev, stage: stageId }))
        }
      />

      <div>
        <label className={labelClass}>Modificari</label>
        {formData.mods.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {formData.mods.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => removeMod(mod)}
                className="bg-primary px-2.5 py-1 rounded-md text-xs font-semibold text-white transition hover:bg-red-600"
                title="Sterge modificarea"
              >
                {mod}
              </button>
            ))}
          </div>
        )}
        <input
          value={modInput}
          onChange={(e) => setModInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addMod();
            }
          }}
          onBlur={addMod}
          type="text"
          placeholder="ex: turbo gtx3170, intercooler x, admisie 90"
          className={inputClass}
        />
      </div>

      <ProjectImageUpload
        value={formData.image_url}
        onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
      />

      <ProjectFileUpload
        value={formData.dyno_file_url}
        onChange={(url) =>
          setFormData((prev) => ({ ...prev, dyno_file_url: url }))
        }
      />

      <div>
        <label className={labelClass}>Video</label>
        <input
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          placeholder="Url video"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Note</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          placeholder="Observatii suplimentare..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {showErrors && Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-md p-3">
          <p className="text-xs font-semibold text-red-400 mb-2">
            Erori in formularul:
          </p>
          <ul className="text-xs text-red-400 space-y-1">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <FormActions
        saving={saving}
        disabled={saving || !isValid}
        onClose={onClose}
      />
    </form>
  );
};

export default ProjectForm;

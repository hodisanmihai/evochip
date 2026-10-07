"use client";

import { validateProject } from "@/lib/data/validation";
import { projectImages } from "@/lib/projects/gallery";

import { useEffect, useRef, useState } from "react";
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

import { cleanupProjectFiles } from "@/lib/supabase/services/projectStorage";

const getValidationErrors = validateProject;
const isFormValid = (data: ProjectFields) => Object.keys(validateProject(data)).length === 0;

const ProjectForm = ({
  item,
  onSave,
  onCommitted,
  onClose,
}: {
  item?: ProjectItem | null;
  onSave: (data: ProjectFields) => Promise<boolean>;
  onCommitted: () => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<ProjectFields>(() =>
    getProjectState(item)
  );
  const [modInput, setModInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePending, setImagePending] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const active = useRef(true);
  const saveInFlight = useRef(false);
  const draftFiles = useRef(new Set<string>());
  const persistedFiles = useRef(new Set([...projectImages(item?.image_url, item?.image_urls), item?.dyno_file_url].filter((url): url is string => Boolean(url))));
  useEffect(() => {
    active.current = true;
    const drafts = draftFiles.current;
    return () => {
      active.current = false;
      if (!saveInFlight.current) void cleanupProjectFiles([...drafts]);
    };
  }, []);
  const trackUpload = (url: string) => {
    if (active.current) draftFiles.current.add(url);
    else void cleanupProjectFiles([url]);
  };
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
    if (saving || imageBusy || imagePending || fileBusy) return;

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
    saveInFlight.current = true;
    try {
      const saved = await onSave({ ...formData, mods });
      if (saved) {
        const kept = new Set([...formData.image_urls, formData.dyno_file_url]);
        const obsolete = [...persistedFiles.current, ...draftFiles.current].filter((url) => !kept.has(url));
        draftFiles.current.clear();
        const cleanupError = await cleanupProjectFiles(obsolete);
        if (cleanupError) show("Proiectul este salvat, dar unele fișiere vechi nu au putut fi curățate.", "error");
        onCommitted();
        onClose();
      }
    } catch {
      show("Salvarea a eșuat. Încearcă din nou.", "error");
    } finally {
      saveInFlight.current = false;
      if (!active.current) void cleanupProjectFiles([...draftFiles.current]);
      setSaving(false);
    }
  };

  const isValid = isFormValid(formData);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <fieldset disabled={saving} className={saving ? "contents pointer-events-none" : "contents"}>
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
            <label className={labelClass}>Putere Noua (CP) — opțional</label>
            <input
              name="new_power"
              value={formData.new_power}
              onChange={handleChange}
              type="number"
              placeholder={formData.initial_power || "Aceeași ca puterea inițială"}
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
            <label className={labelClass}>Cuplu Nou (Nm) — opțional</label>
            <input
              name="new_torque"
              value={formData.new_torque}
              onChange={handleChange}
              type="number"
              placeholder={formData.initial_torque || "Același ca cuplul inițial"}
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

      <p className="text-xs text-zinc-400">
        Dacă lași puterea sau cuplul noi goale, se salvează valorile inițiale.
      </p>

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
        onUploaded={trackUpload}
        onBusyChange={setImageBusy}
        onPendingChange={setImagePending}
        value={formData.image_urls}
        onChange={(urls) => setFormData((prev) => ({ ...prev, image_urls: urls, image_url: urls[0] ?? "" }))}
      />

      <ProjectFileUpload
        onUploaded={trackUpload}
        onBusyChange={setFileBusy}
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
        disabled={saving || imageBusy || imagePending || fileBusy || !isValid}
        closeDisabled={saving || imageBusy || fileBusy}
        onClose={onClose}
      />
      </fieldset>
    </form>
  );
};

export default ProjectForm;

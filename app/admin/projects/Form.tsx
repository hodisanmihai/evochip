"use client";

import React, { useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";
import { useNotification } from "../context/NotificationContext";
import { EntityType, ProjectItem, CarModelItem, RemapItem } from "./types";
import BrandAutocomplete from "./BrandAutocomplete";

interface FormProps {
  type: EntityType;
  isOpen: boolean;
  onClose: () => void;
  item?: ProjectItem | CarModelItem | RemapItem | null;
  onSaved?: () => void;
}

interface CarModelFields {
  car_brand: string;
}

interface RemapFields {
  solution_name: string;
}

interface StageOption {
  id: number;
  solution_name: string;
}
const BUCKET = "car-files";
const PROJECT_IMAGE_FOLDER = "car-photos";
const PROJECT_FILE_FOLDER = "car-dyno";

const inputClass =
  "w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500 placeholder-zinc-600";
const labelClass = "text-xs text-zinc-400 mb-1 block";

const getCarModelState = (item?: CarModelItem | null): CarModelFields => ({
  car_brand: item?.car_brand || "",
});

const getRemapState = (item?: RemapItem | null): RemapFields => ({
  solution_name: item?.solution_name || "",
});

const getSafeStorageName = (fileName: string) => {
  const extension = fileName.split(".").pop() || "file";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${baseName || "upload"}.${extension}`;
};

const uploadPublicFile = async (folder: string, file: File) => {
  const supabase = createClient();
  const path = `${folder}/${getSafeStorageName(file.name)}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });

const getCroppedImageFile = async (
  imageSrc: string,
  croppedAreaPixels: Area,
  fileName: string,
) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Nu s-a putut pregati imaginea pentru crop.");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );

  if (!blob) throw new Error("Nu s-a putut genera imaginea cropuita.");

  const cleanName = fileName.replace(/\.[^/.]+$/, "") || "project-image";
  return new File([blob], `${cleanName}.jpg`, { type: "image/jpeg" });
};

const CarModelForm = ({
  item,
  onSave,
  onClose,
}: {
  item?: CarModelItem | null;
  onSave: (data: CarModelFields) => Promise<void>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<CarModelFields>(() =>
    getCarModelState(item),
  );
  const [saving, setSaving] = useState(false);

  const isUnchanged = item ? formData.car_brand === item.car_brand : false;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ car_brand: formData.car_brand.trim() });
        setSaving(false);
      }}
    >
      <div>
        <label className={labelClass}>
          Nume Brand <span className="text-red-500">*</span>
        </label>
        <input
          name="car_brand"
          value={formData.car_brand}
          onChange={(e) => setFormData({ car_brand: e.target.value })}
          type="text"
          placeholder="ex: BMW, Audi, Mercedes"
          required
          className={inputClass}
        />
      </div>

      <FormActions
        saving={saving}
        disabled={saving || isUnchanged || !formData.car_brand.trim()}
        onClose={onClose}
      />
    </form>
  );
};

const RemapForm = ({
  item,
  onSave,
  onClose,
}: {
  item?: RemapItem | null;
  onSave: (data: RemapFields) => Promise<void>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<RemapFields>(() =>
    getRemapState(item),
  );
  const [saving, setSaving] = useState(false);

  const isUnchanged = item
    ? formData.solution_name === item.solution_name
    : false;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ solution_name: formData.solution_name.trim() });
        setSaving(false);
      }}
    >
      <div>
        <label className={labelClass}>
          Nume solutie <span className="text-red-500">*</span>
        </label>
        <input
          name="solution_name"
          value={formData.solution_name}
          onChange={(e) => setFormData({ solution_name: e.target.value })}
          type="text"
          placeholder="ex: Stage 1, Stage 2, Eco"
          required
          className={inputClass}
        />
      </div>

      <FormActions
        saving={saving}
        disabled={saving || isUnchanged || !formData.solution_name.trim()}
        onClose={onClose}
      />
    </form>
  );
};

interface ProjectFields {
  brand_id: number | null;
  car_model: string;
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
}

const initialProjectState: ProjectFields = {
  brand_id: null,
  car_model: "",
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
};

const getProjectMods = (mods: ProjectItem["mods"]): string[] => {
  if (!mods) return [];

  // Dacă e string, încearcă să-l parseze ca JSON mai întâi
  if (typeof mods === "string") {
    try {
      const parsed = JSON.parse(mods);
      if (Array.isArray(parsed)) {
        // Parsează recursiv dacă elementele sunt tot JSON strings
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
      // Nu e JSON, split după virgulă
      return mods
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    }
  }

  if (Array.isArray(mods)) {
    return mods
      .map((m) => {
        // Fiecare element poate fi un JSON string la rândul lui
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

const getProjectState = (item?: ProjectItem | null): ProjectFields => {
  if (!item) return initialProjectState;

  console.log("dyno_file_url:", item.dyno_file_url);
  console.log("image_url:", item.image_url);

  return {
    brand_id: item.brand_id ?? null,
    car_model: item.car_model || "",
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
  };
};

const COMBUSTION_OPTIONS = ["Benzina", "Diesel", "Hybrid", "Electric", "GPL"];
const TRANSMITION_OPTIONS = ["Manuala", "Automata", "Semi-automata", "CVT"];

const StageSelect = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (stageId: number | null) => void;
}) => {
  const [stages, setStages] = useState<StageOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("stage")
        .select("id, solution_name")
        .order("solution_name", { ascending: true });

      setStages(data || []);
      setLoading(false);
    };

    fetchStages();
  }, []);

  return (
    <div>
      <label className={labelClass}>Stage</label>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={loading}
        className={`${inputClass} disabled:opacity-60`}
      >
        <option value="">
          {loading ? "Se incarca..." : "Selecteaza stage..."}
        </option>
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.solution_name}
          </option>
        ))}
      </select>
    </div>
  );
};

const ProjectImageUpload = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("project-image.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectImage = (file?: File) => {
    setError(null);
    if (!file) return;

    setFileName(file.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
      }
    });
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    setError(null);
    try {
      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        fileName,
      );

      if (value) {
        const supabase = createClient();
        const oldPath = value.split(`/storage/v1/object/public/${BUCKET}/`)[1];
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      const publicUrl = await uploadPublicFile(
        PROJECT_IMAGE_FOLDER,
        croppedFile,
      );
      onChange(publicUrl);
      setImageSrc(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      setError(message || "Eroare necunoscuta.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>Imagine proiect</label>

      {value && !imageSrc && (
        <div className="w-full aspect-16/10 overflow-hidden rounded-t-xl border-2 border-primary bg-[#222222]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Imagine proiect"
            /* Adăugat w-full h-full pentru a umple perfect containerul 16:10 */
            className="w-full h-full object-cover"
            width={340}
            height={210}
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleSelectImage(e.target.files?.[0])}
        className={inputClass}
      />

      {imageSrc && (
        <div className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-[#171717] p-3">
          <div className="relative h-64 overflow-hidden rounded-md bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) =>
                setCroppedAreaPixels(croppedPixels)
              }
            />
          </div>
          <div>
            <label className={labelClass}>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !croppedAreaPixels}
              className="bg-primary py-2 rounded-md text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {uploading ? "Se incarca..." : "Incarca imaginea"}
            </button>
            <button
              type="button"
              onClick={() => setImageSrc(null)}
              className="border border-zinc-700 py-2 rounded-md text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Renunta
            </button>
          </div>
        </div>
      )}

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="self-start text-xs font-semibold text-red-400 hover:text-red-300"
        >
          Sterge imaginea
        </button>
      )}

      {error && <p className="text-xs text-red-400">Eroare upload: {error}</p>}
    </div>
  );
};

const ProjectFileUpload = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(() => value.split("/").pop() || "");

  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async (file?: File) => {
    setError(null);
    if (!file) return;

    setUploading(true);
    setFileName(file.name);
    try {
      // Șterge fișierul vechi dacă există
      if (value) {
        const supabase = createClient();
        const oldPath = value.split(`/storage/v1/object/public/${BUCKET}/`)[1];
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      const publicUrl = await uploadPublicFile(PROJECT_FILE_FOLDER, file);
      onChange(publicUrl);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      setError(message || "Eroare necunoscuta.");
    } finally {
      setUploading(false);
    }
  };
  console.log("value:", value, "uploading:", uploading);

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>Fisier dyno</label>
      <input
        type="file"
        onChange={(e) => handleSelectFile(e.target.files?.[0])}
        className={inputClass}
      />
      {value && !uploading && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <span>📎</span>
          <span className="truncate max-w-65">{value.split("/").pop()}</span>
          <span className="text-zinc-600">— deschide</span>
        </a>
      )}

      {uploading && (
        <p className="text-xs text-zinc-400">
          Se incarca {fileName || "fisierul"}...
        </p>
      )}

      <button
        type="button"
        onClick={async () => {
          const supabase = createClient();
          const oldPath = value.split(
            `/storage/v1/object/public/${BUCKET}/`,
          )[1];
          if (oldPath) {
            await supabase.storage.from(BUCKET).remove([oldPath]);
          }
          onChange("");
        }}
        className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300"
      >
        Sterge
      </button>

      {error && <p className="text-xs text-red-400">Eroare upload: {error}</p>}
    </div>
  );
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
    getProjectState(item),
  );
  const [modInput, setModInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const mods = getModsForSave();
        setFormData((prev) => ({ ...prev, mods }));
        setModInput("");
        setSaving(true);
        await onSave({ ...formData, mods });
        setSaving(false);
      }}
    >
      <BrandAutocomplete
        value={formData.brand_id}
        onChange={(brandId: number) =>
          setFormData((prev) => ({ ...prev, brand_id: brandId }))
        }
      />

      <div>
        <label className={labelClass}>Model Masina</label>
        <input
          name="car_model"
          value={formData.car_model}
          onChange={handleChange}
          type="text"
          placeholder="ex: E46, A4 B8, Golf 7"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Combustibil</label>
          <select
            name="combustion"
            value={formData.combustion}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Selecteaza...</option>
            {COMBUSTION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Transmisie</label>
          <select
            name="transmition"
            value={formData.transmition}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Selecteaza...</option>
            {TRANSMITION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
            className={inputClass}
          />
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
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Putere Noua (CP)</label>
            <input
              name="new_power"
              value={formData.new_power}
              onChange={handleChange}
              type="number"
              placeholder="ex: 200"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cuplu Initial (Nm)</label>
            <input
              name="initial_torque"
              value={formData.initial_torque}
              onChange={handleChange}
              type="number"
              placeholder="ex: 320"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cuplu Nou (Nm)</label>
            <input
              name="new_torque"
              value={formData.new_torque}
              onChange={handleChange}
              type="number"
              placeholder="ex: 420"
              className={inputClass}
            />
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

      <FormActions
        saving={saving}
        disabled={saving || !formData.brand_id}
        onClose={onClose}
      />
    </form>
  );
};

const FormActions = ({
  saving,
  disabled,
  onClose,
}: {
  saving: boolean;
  disabled: boolean;
  onClose: () => void;
}) => (
  <div className="flex flex-col gap-2 mt-2">
    <button
      type="submit"
      disabled={disabled}
      className="bg-green-600 md:bg-transparent md:border md:border-green-600 md:hover:bg-green-600 text-white font-bold py-2 rounded-md transition disabled:opacity-50"
    >
      {saving ? "Se salveaza..." : "Salveaza"}
    </button>
    <button
      type="button"
      onClick={onClose}
      className="bg-red-600 md:bg-transparent md:border md:border-red-600 md:hover:bg-red-600 text-white font-bold py-2 rounded-md transition"
    >
      Renunta
    </button>
  </div>
);

const Form = ({ type, isOpen, onClose, item, onSaved }: FormProps) => {
  const { show } = useNotification();
  const entityLabel =
    type === "projects"
      ? "Proiect"
      : type === "car_models"
        ? "Brand"
        : "Solutie";

  const handleSaveCarModel = async (data: CarModelFields) => {
    const supabase = createClient();
    try {
      if (item?.id) {
        const { error } = await supabase
          .from("car_models")
          .update({ car_brand: data.car_brand })
          .eq("id", item.id);
        if (error) throw error;
        show("Brand actualizat cu succes.", "success");
      } else {
        const { error } = await supabase
          .from("car_models")
          .insert([{ car_brand: data.car_brand }]);
        if (error) throw error;
        show("Brand adaugat cu succes.", "success");
      }
      onSaved?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      show("Eroare la salvare: " + msg, "error");
    }
  };

  const handleSaveRemap = async (data: RemapFields) => {
    const supabase = createClient();
    try {
      if (item?.id) {
        const { error } = await supabase
          .from("stage")
          .update({ solution_name: data.solution_name })
          .eq("id", item.id);
        if (error) throw error;
        show("Solutie actualizata cu succes.", "success");
      } else {
        const { error } = await supabase
          .from("stage")
          .insert([{ solution_name: data.solution_name }]);
        if (error) throw error;
        show("Solutie adaugata cu succes.", "success");
      }
      onSaved?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      show("Eroare la salvare: " + msg, "error");
    }
  };

  const handleSaveProject = async (data: ProjectFields) => {
    const supabase = createClient();
    const payload = {
      brand_id: data.brand_id,
      car_model: data.car_model,
      combustion: data.combustion,
      engine_capacity: data.engine_capacity
        ? Number(data.engine_capacity)
        : null,
      engine_code: data.engine_code,
      transmition: data.transmition,
      initial_power: data.initial_power ? Number(data.initial_power) : null,
      initial_torque: data.initial_torque ? Number(data.initial_torque) : null,
      new_power: data.new_power ? Number(data.new_power) : null,
      new_torque: data.new_torque ? Number(data.new_torque) : null,
      stage: data.stage,
      mods: data.mods,
      note: data.note,
      image_url: data.image_url,
      dyno_file_url: data.dyno_file_url,
    };

    try {
      if (item?.id) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", item.id);
        if (error) throw error;
        show("Proiect actualizat cu succes.", "success");
      } else {
        const { error } = await supabase.from("projects").insert([payload]);
        if (error) throw error;
        show("Proiect adaugat cu succes.", "success");
      }
      onSaved?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      show("Eroare la salvare: " + msg, "error");
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
            case "car_models":
              return (
                <CarModelForm
                  key={item?.id ?? "new-car-model"}
                  item={item as CarModelItem}
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

export type { ProjectFields };
export default Form;

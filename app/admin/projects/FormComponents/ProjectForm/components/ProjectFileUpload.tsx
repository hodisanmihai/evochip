"use client";

import { validateUpload } from "@/lib/data/validation";

import { useState } from "react";
import { uploadProjectFile } from "@/lib/supabase/services/projectUpload";
import {
  inputClass,
  labelClass,
  PROJECT_FILE_FOLDER,
} from "../../constants";

const ProjectFileUpload = ({
  value,
  onChange,
  onUploaded,
  onBusyChange,
}: {
  value: string;
  onChange: (url: string) => void;
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(() => value.split("/").pop() || "");
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async (file?: File) => {
    setError(null);
    if (!file) return;
    const validationError = validateUpload(file, "dyno");
    if (validationError) { setError(validationError); return; }

    setUploading(true);
    onBusyChange(true);
    setFileName(file.name);
    try {
      const publicUrl = await uploadProjectFile(PROJECT_FILE_FOLDER, file);
      onUploaded(publicUrl);
      onChange(publicUrl);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      setError(message || "Eroare necunoscuta.");
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  };

  const handleDeleteFile = () => onChange("");

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>Fisier dyno</label>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => handleSelectFile(e.target.files?.[0])}
        disabled={uploading}
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

      {value && (
        <button
          type="button"
          onClick={handleDeleteFile}
          disabled={uploading}
          className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Elimină din proiect
        </button>
      )}

      {error && <p className="text-xs text-red-400">Eroare: {error}</p>}
    </div>
  );
};

export default ProjectFileUpload;

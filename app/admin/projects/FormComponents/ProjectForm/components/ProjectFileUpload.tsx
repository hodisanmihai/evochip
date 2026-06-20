"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  inputClass,
  labelClass,
  BUCKET,
  PROJECT_FILE_FOLDER,
} from "../../constants";

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

// ✅ FIX: Extract path correctly from public URL
const extractPathFromPublicUrl = (publicUrl: string): string | null => {
  try {
    // URL format: https://...supabase.co/storage/v1/object/public/car-files/car-dyno/1234567890-name.pdf
    const match = publicUrl.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (match) {
      const bucket = match[1];
      const path = match[2];
      if (bucket === BUCKET) {
        return path;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const ProjectFileUpload = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
        const oldPath = extractPathFromPublicUrl(value);
        if (oldPath) {
          try {
            await supabase.storage.from(BUCKET).remove([oldPath]);
          } catch (err) {
            console.warn("Failed to delete old file:", err);
          }
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

  // ✅ FIX: Handle delete with correct path extraction
  const handleDeleteFile = async () => {
    if (!value) return;

    setDeleting(true);
    setError(null);
    try {
      const supabase = createClient();
      const pathToDelete = extractPathFromPublicUrl(value);

      if (!pathToDelete) {
        throw new Error("Nu s-a putut extrage calea fisierului.");
      }

      const { error: deleteError } = await supabase.storage
        .from(BUCKET)
        .remove([pathToDelete]);

      if (deleteError) throw deleteError;

      onChange("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      setError(message || "Eroare la stergere fisierului.");
      console.error("Error deleting file:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>Fisier dyno</label>
      <input
        type="file"
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
          disabled={deleting || uploading}
          className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? "Se sterge..." : "Sterge"}
        </button>
      )}

      {error && <p className="text-xs text-red-400">Eroare: {error}</p>}
    </div>
  );
};

export default ProjectFileUpload;

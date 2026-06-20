"use client";

import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";
import {
  inputClass,
  labelClass,
  BUCKET,
  PROJECT_IMAGE_FOLDER,
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
  fileName: string
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
    croppedAreaPixels.height
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );

  if (!blob) throw new Error("Nu s-a putut genera imaginea cropuita.");

  const cleanName = fileName.replace(/\.[^/.]+$/, "") || "project-image";
  return new File([blob], `${cleanName}.jpg`, { type: "image/jpeg" });
};

// ✅ FIX: Extract path correctly from public URL
const extractPathFromPublicUrl = (publicUrl: string): string | null => {
  try {
    // URL format: https://...supabase.co/storage/v1/object/public/car-files/car-photos/1234567890-name.jpg
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
  const [deleting, setDeleting] = useState(false);
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
        fileName
      );

      if (value) {
        const supabase = createClient();
        const oldPath = extractPathFromPublicUrl(value);
        if (oldPath) {
          try {
            await supabase.storage.from(BUCKET).remove([oldPath]);
          } catch (err) {
            console.warn("Failed to delete old image:", err);
          }
        }
      }

      const publicUrl = await uploadPublicFile(
        PROJECT_IMAGE_FOLDER,
        croppedFile
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

  // ✅ FIX: Handle delete with correct path extraction
  const handleDeleteImage = async () => {
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
      setError(message || "Eroare la stergere imaginii.");
      console.error("Error deleting image:", err);
    } finally {
      setDeleting(false);
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
          onClick={handleDeleteImage}
          disabled={deleting}
          className="self-start text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? "Se sterge..." : "Sterge imaginea"}
        </button>
      )}

      {error && <p className="text-xs text-red-400">Eroare: {error}</p>}
    </div>
  );
};

export default ProjectImageUpload;

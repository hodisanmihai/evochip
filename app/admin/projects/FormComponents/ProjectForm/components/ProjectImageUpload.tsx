"use client";

import { validateUpload } from "@/lib/data/validation";

import { useEffect, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { uploadProjectFile } from "@/lib/supabase/services/projectUpload";
import {
  inputClass,
  labelClass,
  PROJECT_IMAGE_FOLDER,
} from "../../constants";

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

  const scale = Math.min(1, 1920 / croppedAreaPixels.width);
  canvas.width = Math.max(1, Math.round(croppedAreaPixels.width * scale));
  canvas.height = Math.max(1, Math.round(croppedAreaPixels.height * scale));
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );

  if (!blob) throw new Error("Nu s-a putut genera imaginea cropuita.");

  const cleanName = fileName.replace(/\.[^/.]+$/, "") || "project-image";
  return new File([blob], `${cleanName}.jpg`, { type: "image/jpeg" });
};

const ProjectImageUpload = ({
  value,
  onChange,
  onUploaded,
  onBusyChange,
  onPendingChange,
}: {
  value: string;
  onChange: (url: string) => void;
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  onPendingChange: (pending: boolean) => void;
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("project-image.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  useEffect(() => () => { readerRef.current?.abort(); }, []);

  const handleSelectImage = (file?: File) => {
    setError(null);
    if (!file) return;
    const validationError = validateUpload(file, "image");
    if (validationError) { setError(validationError); return; }

    readerRef.current?.abort();
    onPendingChange(true);
    setFileName(file.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    const reader = new FileReader();
    readerRef.current = reader;
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
      }
    });
    reader.addEventListener("error", () => {
      setError("Imaginea nu a putut fi citită.");
      onPendingChange(false);
    });
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    onBusyChange(true);
    setError(null);
    try {
      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        fileName
      );

      const publicUrl = await uploadProjectFile(
        PROJECT_IMAGE_FOLDER,
        croppedFile
      );
      onUploaded(publicUrl);
      onChange(publicUrl);
      setImageSrc(null);
      onPendingChange(false);
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

  const handleDeleteImage = () => onChange("");

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
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
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
              onClick={() => { readerRef.current?.abort(); setImageSrc(null); onPendingChange(false); }}
              disabled={uploading}
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
          disabled={uploading}
          className="self-start text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Elimină imaginea din proiect
        </button>
      )}

      {error && <p className="text-xs text-red-400">Eroare: {error}</p>}
    </div>
  );
};

export default ProjectImageUpload;

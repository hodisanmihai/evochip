"use client";

import { setProjectCover } from "@/lib/projects/gallery";
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

type PendingImage = { id: string; file: File; url: string };

const ProjectImageUpload = ({ value, onChange, onUploaded, onBusyChange, onPendingChange }: {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  onPendingChange: (pending: boolean) => void;
}) => {
  const [queue, setQueue] = useState<PendingImage[]>([]);
  const queueRef = useRef<PendingImage[]>([]);
  const objectUrls = useRef(new Set<string>());
  const valueRef = useRef(value);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const current = queue[0];

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  const updateQueue = (next: PendingImage[]) => {
    const changed = queueRef.current[0]?.id !== next[0]?.id;
    queueRef.current = next;
    setQueue(next);
    onPendingChange(next.length > 0);
    if (changed) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  const discardCurrent = () => {
    const pending = queueRef.current[0];
    if (pending) { URL.revokeObjectURL(pending.url); objectUrls.current.delete(pending.url); }
    updateQueue(queueRef.current.slice(1));
    setError(null);
  };

  const selectFiles = (files: File[]) => {
    if (uploadInFlight.current || !files.length) return;
    const errors: string[] = [];
    const next: PendingImage[] = [];
    for (const file of files) {
      const validationError = validateUpload(file, "image");
      if (validationError) { errors.push(`${file.name}: ${validationError}`); continue; }
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      next.push({ id: crypto.randomUUID(), file, url });
    }
    setError(errors.length ? errors.join(" ") : null);
    if (next.length) updateQueue([...queueRef.current, ...next]);
  };

  const handleUpload = async () => {
    const pending = queueRef.current[0];
    if (!pending || !croppedAreaPixels || uploadInFlight.current) return;
    uploadInFlight.current = true;
    setUploading(true);
    onBusyChange(true);
    setError(null);
    try {
      const file = await getCroppedImageFile(pending.url, croppedAreaPixels, pending.file.name);
      const publicUrl = await uploadProjectFile(PROJECT_IMAGE_FOLDER, file);
      onUploaded(publicUrl);
      const images = [...valueRef.current, publicUrl];
      valueRef.current = images;
      onChange(images);
      discardCurrent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Imaginea nu a putut fi încărcată. Încearcă din nou.");
    } finally {
      uploadInFlight.current = false;
      setUploading(false);
      onBusyChange(false);
    }
  };

  const changeImages = (images: string[]) => {
    valueRef.current = images;
    onChange(images);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className={labelClass}>Imagini proiect</label>
      <p className="text-xs text-zinc-400">Selectează mai multe poze și decupează-le pe rând. Imaginea principală apare prima în galerie și pe cardul proiectului.</p>
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading}
        onChange={(event) => { selectFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} className={inputClass} />

      {current && (
        <div className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-[#171717] p-3">
          <p className="text-xs text-zinc-300 truncate">{current.file.name} · {queue.length} {queue.length === 1 ? "poză de pregătit" : "poze de pregătit"}</p>
          <div className="relative h-64 overflow-hidden rounded-md bg-black">
            <Cropper key={current.id} image={current.url} crop={crop} zoom={zoom} aspect={16 / 9}
              onCropChange={(position) => { setCroppedAreaPixels(null); setCrop(position); }}
              onZoomChange={(nextZoom) => { setCroppedAreaPixels(null); setZoom(nextZoom); }}
              onCropComplete={(_, pixels) => { if (queueRef.current[0]?.id === current.id) setCroppedAreaPixels(pixels); }} />
          </div>
          <label className={labelClass}>Zoom
            <input type="range" min={1} max={3} step={0.1} value={zoom} disabled={uploading}
              onChange={(event) => { setCroppedAreaPixels(null); setZoom(Number(event.target.value)); }} className="w-full accent-red-600" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={handleUpload} disabled={uploading || !croppedAreaPixels}
              className="bg-primary py-2 rounded-md text-sm font-bold text-white disabled:opacity-50">{uploading ? "Se încarcă..." : "Încarcă și continuă"}</button>
            <button type="button" onClick={discardCurrent} disabled={uploading}
              className="border border-zinc-700 py-2 rounded-md text-sm font-bold text-white disabled:opacity-50">Omite poza</button>
          </div>
          <button type="button" disabled={uploading} onClick={() => {
            queueRef.current.forEach(({ url }) => { URL.revokeObjectURL(url); objectUrls.current.delete(url); });
            updateQueue([]); setError(null);
          }} className="text-xs text-zinc-400 underline disabled:opacity-50">Renunță la pozele rămase</button>
        </div>
      )}

      {value.length > 0 && <div className="grid grid-cols-2 gap-3">
        {value.map((url, index) => <div key={url} className={`overflow-hidden rounded-lg border ${index === 0 ? "border-primary" : "border-zinc-700"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Imagine proiect ${index + 1}`} width={240} height={135} className="aspect-video w-full object-cover" />
          <div className="flex flex-col gap-2 p-2">
            <button type="button" disabled={uploading || index === 0} onClick={() => changeImages(setProjectCover(valueRef.current, url))}
              aria-pressed={index === 0} className="text-xs font-semibold text-white disabled:opacity-60">{index === 0 ? "★ Imagine principală" : "Setează ca principală"}</button>
            <button type="button" disabled={uploading} onClick={() => changeImages(valueRef.current.filter((image) => image !== url))}
              className="text-xs text-red-400 disabled:opacity-50">Elimină din proiect</button>
          </div>
        </div>)}
      </div>}
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default ProjectImageUpload;

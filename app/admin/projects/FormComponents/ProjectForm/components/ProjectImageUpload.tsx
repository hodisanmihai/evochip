"use client";

import FreeImageCrop from "./FreeImageCrop";
import { imageLayout } from "@/lib/projects/imageLayout";
import type { ImageMetadata } from "@/lib/types/project";
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
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });

const getCroppedImageFile = async (
  imageSrc: string,
  croppedAreaPixels: Area | null,
  fileName: string,
  whole: boolean
) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Nu s-a putut pregati imaginea pentru crop.");

  const area = whole ? { x: 0, y: 0, width: image.width, height: image.height } : croppedAreaPixels;
  if (!area) throw new Error("Alege zona de decupare.");
  const layout = imageLayout(area.width, area.height);
  canvas.width = layout.width;
  canvas.height = layout.height;
  context.fillStyle = "#171717";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, area.x, area.y, area.width, area.height,
    layout.x, layout.y, layout.drawWidth, layout.drawHeight);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );

  if (!blob) throw new Error("Nu s-a putut genera imaginea cropuita.");

  const cleanName = fileName.replace(/\.[^/.]+$/, "") || "project-image";
  return new File([blob], `${cleanName}.jpg`, { type: "image/jpeg" });
};

type PendingImage = { id: string; file?: File; url: string; replacing?: string; original?: string };

const ProjectImageUpload = ({ value, onChange, onUploaded, onBusyChange, onPendingChange, metadata, onMetadataChange }: {
  metadata: ImageMetadata;
  onMetadataChange: (metadata: ImageMetadata) => void;
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
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [whole, setWhole] = useState(true);
  const [cropRatio, setCropRatio] = useState<"free" | "4:3" | "16:9">("free");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [completed, setCompleted] = useState(0);
  const dragged = useRef<string | null>(null);
  const metadataRef = useRef(metadata);
  useEffect(() => { metadataRef.current = metadata; }, [metadata]);
  useEffect(() => {
    let cancelled = false;
    if (!current) return;
    createImage(current.url).then((image) => {
      const canvas = document.createElement("canvas");
      const swap = rotation % 180 !== 0;
      canvas.width = swap ? image.height : image.width;
      canvas.height = swap ? image.width : image.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Imaginea nu poate fi pregătită.");
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(rotation * Math.PI / 180);
      context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      context.drawImage(image, -image.width / 2, -image.height / 2);
      if (!cancelled) {
        setDimensions({ width: canvas.width, height: canvas.height });
        setPreview(canvas.toDataURL("image/png"));
        setCroppedAreaPixels({ x: 0, y: 0, width: canvas.width, height: canvas.height });
      }
    }).catch(() => { if (!cancelled) setError("Imaginea nu poate fi deschisă. Omite poza sau încearcă alt fișier."); });
    return () => { cancelled = true; };
  }, [current, rotation, flipX, flipY]);

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
      setPreview(null);
      setCropRatio("free");
      setRotation(0); setFlipX(false); setFlipY(false); setWhole(!next[0]?.replacing);
      setDescription(next[0]?.replacing ? metadataRef.current[next[0].replacing]?.description ?? "" : "");
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
    if (!queueRef.current.length) setCompleted(0);
    if (next.length) updateQueue([...queueRef.current, ...next]);
  };

  const handleUpload = async () => {
    const pending = queueRef.current[0];
    if (!pending || !preview || (!whole && !croppedAreaPixels) || uploadInFlight.current) return;
    uploadInFlight.current = true;
    setUploading(true);
    onBusyChange(true);
    setError(null);
    try {
      setProgress(0);
      setPhase("Pregătire");
      const file = await getCroppedImageFile(preview, croppedAreaPixels, pending.file?.name ?? "project-image.jpg", whole);
      let original = pending.original;
      if (!original && pending.file) {
        setPhase("Original");
        original = await uploadProjectFile(PROJECT_IMAGE_FOLDER, pending.file, setProgress);
        onUploaded(original);
        // Keep the original on retry if uploading the processed image fails.
        pending.original = original;
      }
      setPhase("Imagine finală"); setProgress(0);
      const publicUrl = await uploadProjectFile(PROJECT_IMAGE_FOLDER, file, setProgress);
      onUploaded(publicUrl);
      const images = pending.replacing
        ? valueRef.current.map((url) => url === pending.replacing ? publicUrl : url)
        : [...valueRef.current, publicUrl];
      const nextMetadata = { ...metadataRef.current };
      if (pending.replacing) delete nextMetadata[pending.replacing];
      nextMetadata[publicUrl] = { original: original ?? publicUrl, description: description.trim() };
      metadataRef.current = nextMetadata;
      onMetadataChange(nextMetadata);
      valueRef.current = images;
      onChange(images);
      setCompleted((count) => count + 1);
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
      <p className="text-xs text-zinc-400">Poți încărca poze în orice proporție: portret, pătrate sau panoramice. Păstrăm poza întreagă; decuparea este opțională. Imaginea principală apare prima în galerie și pe cardul proiectului.</p>
      <div className="rounded-md border-2 border-dashed border-zinc-700 p-4"
        onDragOver={(event) => { event.preventDefault(); }}
        onDrop={(event) => { event.preventDefault(); selectFiles(Array.from(event.dataTransfer.files)); }}>
      <p className="mb-2 text-sm text-zinc-300">Trage pozele aici sau selectează fișierele.</p>
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading}
        onChange={(event) => { selectFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} className={inputClass} />
      </div>

      {current && (
        <div className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-[#171717] p-3">
          <p className="text-xs text-zinc-300 truncate">{current.file?.name ?? "Reeditare imagine"} · Poza {completed + 1} din {completed + queue.length} · {queue.length} {queue.length === 1 ? "poză de pregătit" : "poze de pregătit"}</p>
          <fieldset disabled={uploading} className="flex flex-wrap gap-3 text-sm text-white disabled:opacity-60">
            <button type="button" onClick={() => { setPreview(null); setCroppedAreaPixels(null); setRotation((r) => (r + 90) % 360); }}>Rotește 90°</button>
            <button type="button" aria-pressed={flipX} onClick={() => { setPreview(null); setCroppedAreaPixels(null); setFlipX(!flipX); }}>Flip orizontal</button>
            <button type="button" aria-pressed={flipY} onClick={() => { setPreview(null); setCroppedAreaPixels(null); setFlipY(!flipY); }}>Flip vertical</button>
            <div className="flex w-full gap-2" role="group" aria-label="Mod imagine">
              <button type="button" aria-pressed={whole} onClick={() => setWhole(true)}
                className={`rounded border px-3 py-2 ${whole ? "border-primary bg-primary" : "border-zinc-600"}`}>Poză întreagă</button>
              <button type="button" aria-pressed={!whole} onClick={() => {
                if (whole) { setCroppedAreaPixels(cropRatio === "free" ? { x: 0, y: 0, ...dimensions } : null); setWhole(false); }
              }} className={`rounded border px-3 py-2 ${!whole ? "border-primary bg-primary" : "border-zinc-600"}`}>Decupează</button>
            </div>
          </fieldset>
          {!whole && <label className={labelClass}>Format crop
            <select className={inputClass} value={cropRatio} disabled={uploading} onChange={(event) => {
              const ratio = event.target.value as typeof cropRatio;
              setCropRatio(ratio); setCrop({ x: 0, y: 0 }); setZoom(1);
              setCroppedAreaPixels(ratio === "free" ? { x: 0, y: 0, ...dimensions } : null);
            }}>
              <option value="free">Liber</option><option value="4:3">4:3</option><option value="16:9">16:9</option>
            </select>
          </label>}
          <div className={`relative ${whole ? "aspect-video" : "h-64"} overflow-hidden rounded-md bg-[#171717]`}>
            {preview && (whole
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={preview} alt="Previzualizare imagine întreagă" className="h-full w-full object-contain" />
              : cropRatio === "free"
              ? <FreeImageCrop src={preview} width={dimensions.width} height={dimensions.height}
                  area={croppedAreaPixels} onChange={setCroppedAreaPixels} disabled={uploading} />
              : <Cropper key={`${current.id}-${rotation}-${flipX}-${flipY}-${cropRatio}`} image={preview} crop={crop} zoom={zoom} aspect={cropRatio === "4:3" ? 4 / 3 : 16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropAreaChange={(_, pixels) => { if (queueRef.current[0]?.id === current.id) setCroppedAreaPixels(pixels); }} />)}
          </div>
          {!whole && <p className="text-xs text-zinc-400">{cropRatio === "free" ? "Trage colțurile pentru a redimensiona selecția sau centrul pentru a o muta. Poți folosi și săgețile de pe tastatură." : "Trage poza pentru a alege încadrarea și folosește zoomul pentru decupare."}</p>}
          {!whole && cropRatio !== "free" && <label className={labelClass}>Zoom
            <input type="range" min={1} max={3} step={0.1} value={zoom} disabled={uploading || whole}
              onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-red-600" />
          </label>}
          {(whole ? dimensions.width : croppedAreaPixels?.width ?? 1920) < 1280 && <p role="status" className="text-sm text-amber-400">Rezoluție mică: imaginea poate apărea neclară pe ecrane mari.</p>}
          <label className={labelClass}>Descriere poză
            <input value={description} maxLength={300} disabled={uploading} onChange={(event) => setDescription(event.target.value)} className={inputClass} placeholder="Ex.: compartiment motor" />
          </label>
          {uploading && <div role="status" className="text-sm text-white">{phase}: {progress}%<progress value={progress} max={100} className="w-full" /></div>}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={handleUpload} disabled={uploading || !preview || (!whole && !croppedAreaPixels)}
              className="bg-primary py-2 rounded-md text-sm font-bold text-white disabled:opacity-50">{uploading ? "Se încarcă..." : current.replacing ? "Salvează modificările pozei" : "Încarcă și continuă"}</button>
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
        {value.map((url, index) => <div key={url} draggable={!uploading && !current}
          onDragStart={() => { dragged.current = url; }} onDragEnd={() => { dragged.current = null; }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); event.stopPropagation(); const source = dragged.current; if (uploading || current || !source || source === url) return; const next = valueRef.current.filter((item) => item !== source); next.splice(next.indexOf(url), 0, source); changeImages(next); dragged.current = null; }} className={`overflow-hidden rounded-lg border ${index === 0 ? "border-primary" : "border-zinc-700"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={metadata[url]?.description || `Imagine proiect ${index + 1}`} width={240} height={135} className="aspect-video w-full object-contain bg-[#171717]" />
          <div className="flex flex-col gap-2 p-2">
            <label className={labelClass}>Descriere poza {index + 1}
              <input className={inputClass} value={metadata[url]?.description ?? ""} maxLength={300} disabled={uploading || Boolean(current)} onChange={(event) => onMetadataChange({ ...metadata, [url]: { original: metadata[url]?.original ?? url, description: event.target.value } })} />
            </label>
            <button type="button" disabled={uploading || Boolean(current)} className="text-xs text-white disabled:opacity-50" onClick={() => { setCompleted(0); updateQueue([{ id: crypto.randomUUID(), url: metadata[url]?.original || url, original: metadata[url]?.original || url, replacing: url }]); }}>Reeditează cropul</button>
            <div className="flex justify-between text-xs text-white">
              <button type="button" aria-label={`Mută poza ${index + 1} înainte`} disabled={uploading || Boolean(current) || index === 0} onClick={() => { const next = [...valueRef.current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; changeImages(next); }}>← Mută</button>
              <button type="button" aria-label={`Mută poza ${index + 1} după`} disabled={uploading || Boolean(current) || index === value.length - 1} onClick={() => { const next = [...valueRef.current]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; changeImages(next); }}>Mută →</button>
            </div>
            <button type="button" disabled={uploading || Boolean(current) || index === 0} onClick={() => changeImages(setProjectCover(valueRef.current, url))}
              aria-pressed={index === 0} className="text-xs font-semibold text-white disabled:opacity-60">{index === 0 ? "★ Imagine principală" : "Setează ca principală"}</button>
            <button type="button" disabled={uploading || Boolean(current)} onClick={() => changeImages(valueRef.current.filter((image) => image !== url))}
              className="text-xs text-red-400 disabled:opacity-50">Elimină din proiect</button>
          </div>
        </div>)}
      </div>}
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default ProjectImageUpload;

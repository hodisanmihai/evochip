import { createClient } from "../client";
import { validateUpload } from "@/lib/data/validation";

export async function uploadProjectFile(folder: "car-photos" | "car-dyno", file: File, onProgress?: (percent: number) => void) {
  const validationError = validateUpload(file, folder === "car-photos" ? "image" : "dyno");
  if (validationError) throw new Error(validationError);

  const extension = file.name.split(".").pop() || "file";
  const baseName = file.name.replace(/\.[^/.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `${folder}/${crypto.randomUUID()}-${baseName || "upload"}.${extension}`;
  const storage = createClient().storage.from("car-files");
  if (onProgress) {
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error) throw error;
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", data.signedUrl);
      request.timeout = 120000;
      request.setRequestHeader("x-upsert", "false");
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
      };
      request.onload = () => request.status >= 200 && request.status < 300
        ? resolve() : reject(new Error("Încărcarea a eșuat. Încearcă din nou."));
      request.onerror = request.ontimeout = () => reject(new Error("Conexiunea a fost întreruptă. Încearcă din nou."));
      const body = new FormData();
      body.append("cacheControl", "3600");
      body.append("", file);
      request.send(body);
    });
    onProgress(100);
  } else {
    const { error } = await storage.upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
  }
  return storage.getPublicUrl(path).data.publicUrl;
}

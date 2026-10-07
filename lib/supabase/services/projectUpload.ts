import { createClient } from "../client";
import { validateUpload } from "@/lib/data/validation";

export async function uploadProjectFile(folder: "car-photos" | "car-dyno", file: File) {
  const validationError = validateUpload(file, folder === "car-photos" ? "image" : "dyno");
  if (validationError) throw new Error(validationError);

  const extension = file.name.split(".").pop() || "file";
  const baseName = file.name.replace(/\.[^/.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `${folder}/${crypto.randomUUID()}-${baseName || "upload"}.${extension}`;
  const storage = createClient().storage.from("car-files");
  const { data, error } = await storage.upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return storage.getPublicUrl(data.path).data.publicUrl;
}

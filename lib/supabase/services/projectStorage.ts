import { readAll } from "./readAll";
import { ImageMetadata } from "@/lib/types/project";
import { createClient } from "../client";
import { cleanupUnreferencedFiles, projectStoragePath } from "@/lib/projects/storage";

const CLEANUP_KEY = "evochip-pending-file-cleanup";

function pendingFiles(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CLEANUP_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((url): url is string => typeof url === "string") : [];
  } catch { return []; }
}

function updatePending(add: string[], remove: string[] = []) {
  try {
    const removed = new Set(remove);
    localStorage.setItem(CLEANUP_KEY, JSON.stringify([...new Set([...pendingFiles(), ...add])].filter((url) => !removed.has(url))));
  } catch { /* Cleanup still runs when browser storage is unavailable. */ }
}

export function retryProjectCleanup() {
  return cleanupProjectFiles(pendingFiles());
}

// Check saved references before removing a file. Failed or interrupted cleanup
// is retried the next time this browser opens the admin area.
export async function cleanupProjectFiles(urls: string[]): Promise<boolean> {
  urls = urls.filter((url) => projectStoragePath(url, process.env.NEXT_PUBLIC_SUPABASE_URL!) !== null);
  if (urls.length === 0) return false;
  updatePending(urls);
  const supabase = createClient();
  return cleanupUnreferencedFiles(urls, async (url) => {
    for (const column of ["image_url", "dyno_file_url"]) {
      const { data, error } = await supabase.from("projects").select("id").eq(column, url).limit(1);
      if (error) throw error;
      if (data?.length) {
        updatePending([], [url]);
        return true;
      }
    }
    // Gallery references must also be checked before deleting shared files.
    // If the migration is missing, fail closed and keep the cleanup queued.
    const { data, error } = await supabase.from("projects").select("id").contains("image_urls", [url]).limit(1);
    if (error) throw error;
    if (data?.length) {
      updatePending([], [url]);
      return true;
    }
    const rows = await readAll<{ image_metadata: ImageMetadata | null }>((from, to) => supabase.from("projects").select("image_metadata").range(from, to));
    if (rows.some((row) => Object.values(row.image_metadata ?? {}).some((photo) => photo.original === url))) {
      updatePending([], [url]);
      return true;
    }
    return false;
  }, async (url) => {
    const path = projectStoragePath(url, process.env.NEXT_PUBLIC_SUPABASE_URL!);
    if (!path) return;
    const { error } = await supabase.storage.from("car-files").remove([path]);
    if (error) throw error;
    updatePending([], [url]);
  });
}

export function projectStoragePath(url: string, supabaseUrl: string): string | null {
  try {
    const parsed = new URL(url);
    const prefix = "/storage/v1/object/public/car-files/";
    if (parsed.origin !== new URL(supabaseUrl).origin || !parsed.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    if (!/^(car-photos|car-dyno)\//.test(path) || path.split("/").some((part) => part === ".." || part === ".")) return null;
    return path;
  } catch {
    return null;
  }
}

export async function cleanupUnreferencedFiles(
  urls: string[],
  isReferenced: (url: string) => Promise<boolean>,
  remove: (url: string) => Promise<void>,
): Promise<boolean> {
  let failed = false;
  for (const url of new Set(urls.filter(Boolean))) {
    try {
      if (!(await isReferenced(url))) await remove(url);
    } catch {
      failed = true;
    }
  }
  return failed;
}

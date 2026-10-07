export function projectImages(cover: string | null | undefined, images?: unknown): string[] {
  const gallery = Array.isArray(images)
    ? images.filter((url): url is string => typeof url === "string" && url.trim() !== "").map((url) => url.trim())
    : [];
  return [...new Set([...(cover?.trim() ? [cover.trim()] : []), ...gallery])];
}

export function setProjectCover(images: string[], cover: string): string[] {
  return images.includes(cover) ? [cover, ...images.filter((url) => url !== cover)] : images;
}

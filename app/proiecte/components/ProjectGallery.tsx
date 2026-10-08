"use client";

import type { ImageMetadata } from "@/lib/types/project";
import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

function GalleryImage({
  src,
  alt,
  thumbnail = false,
}: {
  src: string;
  alt: string;
  thumbnail?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed || !src ? "/resources/LOGO-EVOCHIP.png" : src}
      alt={alt}
      fill
      sizes={thumbnail ? "80px" : "(max-width: 1024px) 100vw, 50vw"}
      className="object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProjectGallery({
  images,
  title,
  metadata = {},
}: {
  images: string[];
  title: string;
  metadata?: ImageMetadata;
}) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photos = images.length ? images : [""];
  const current = Math.min(index, photos.length - 1);
  const go = (offset: number) =>
    setIndex((current + offset + photos.length) % photos.length);

  return (
    <section
      className="w-full"
      aria-label={`Galerie ${title}`}
      aria-roledescription="carusel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <div
        className="relative w-full aspect-video border border-primary rounded-md overflow-hidden "
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch)
            touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          const touch = event.changedTouches[0];
          if (!start || !touch) return;
          const delta = touch.clientX - start.x;
          if (
            Math.abs(delta) > 45 &&
            Math.abs(delta) > Math.abs(touch.clientY - start.y)
          )
            go(delta < 0 ? 1 : -1);
        }}
      >
        <GalleryImage
          key={photos[current]}
          src={photos[current]}
          alt={
            metadata[photos[current]]?.description ||
            `${title} — poza ${current + 1}`
          }
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Poza anterioară"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Poza următoare"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <ChevronRight size={22} />
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white"
            >
              {current + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {metadata[photos[current]]?.description && (
        <p className="mt-2 text-sm text-zinc-300">
          {metadata[photos[current]].description}
        </p>
      )}
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, position) => (
            <button
              key={src}
              type="button"
              aria-label={`Afișează poza ${position + 1}`}
              aria-pressed={position === current}
              onClick={() => setIndex(position)}
              className={`relative h-12 w-20 shrink-0 overflow-hidden rounded border-2 ${position === current ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <GalleryImage src={src} alt="" thumbnail />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import data from "../data/continut.json";

import CarCard from "../proiecte/components/CarCard";
import { ProjectProps } from "@/lib/supabase/services/landingTypes";
type LatestProjectsProp = {
  projects: ProjectProps[];
};
import Link from "next/link";

const CARD_WIDTH = 340;
const CARD_GAP = 24;
const CONTAINER_PADDING_DESKTOP = 64;
const CONTAINER_PADDING_MOBILE = 32;
const AUTOPLAY_DELAY = 10000;

const LatestProjects = ({ projects }: LatestProjectsProp) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const projectsShowcase = projects;

  const updateCardsPerPage = useCallback(() => {
    if (!containerRef.current) return;
    const padding =
      window.innerWidth < 768
        ? CONTAINER_PADDING_MOBILE
        : CONTAINER_PADDING_DESKTOP;
    const containerWidth = containerRef.current.offsetWidth - padding;

    const isMobile = window.innerWidth < 768;
    const count = isMobile
      ? 2
      : Math.max(
          1,
          Math.floor((containerWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP))
        );

    setCardsPerPage((prev) => {
      if (prev !== count) setCurrentPage(0);
      return count;
    });
  }, []);

  useEffect(() => {
    updateCardsPerPage();
    const observer = new ResizeObserver(updateCardsPerPage);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateCardsPerPage]);

  const totalPages = Math.ceil(projectsShowcase.length / cardsPerPage);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, AUTOPLAY_DELAY);
    },
    [totalPages]
  );

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null)
      return;

    const endX = event.changedTouches[0]?.clientX ?? null;
    const endY = event.changedTouches[0]?.clientY ?? null;
    if (endX === null || endY === null) return;

    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const SWIPE_THRESHOLD = 50;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (absDeltaX < SWIPE_THRESHOLD || absDeltaX < absDeltaY) return;

    if (deltaX < 0 && currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else if (deltaX > 0 && currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, AUTOPLAY_DELAY);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalPages]);

  const start = currentPage * cardsPerPage;
  const visibleProjects = projectsShowcase.slice(start, start + cardsPerPage);

  return (
    <div
      className="w-full md:min-h-auto min-h-screen flex flex-col items-center justify-start py-20 px-4 md:px-8 bg-black/50 md:bg-black/0 overflow-hidden z-2 "
      id="latest-projects"
    >
      <div className=" w-full h-full flex flex-col items-center justify-start gap-8 md:gap-12">
        <h1 className="md:px-35 self-start animate-title text-[1.2rem] md:text-[1.5rem] leading-tight text-white whitespace-nowrap">
          {data.latestProjects.titluNormal}
          <span className="text-red-500">
            {data.latestProjects.titluColorat}
          </span>
        </h1>

        <div
          ref={containerRef}
          style={{
            width: "100%",
            maxWidth: "1200px",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="rounded-2xl  md:rounded-3xl h-full border border-red-500/20 bg-linear-to-br from-black via-zinc-950 to-black shadow-2xl overflow-hidden backdrop-blur-xl hover:border-red-400/40 transition-colors group"
        >
          <div className="p-4 md:p-8 flex  flex-col h-full  md:flex-col items-center gap-4 md:gap-6 text-white">
            {/* Grid carduri — 2 coloane pe mobil, flex pe desktop */}
            <div className="w-full overflow-visible h-full flex justify-center md:justify-center-safe">
              <div className="w-[90%] grid md:grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-6 md:justify-center md:items-center">
                {" "}
                {visibleProjects.map((projectItem, i: number) => (
                  <CarCard key={start + i} project={projectItem} />
                ))}
              </div>
            </div>

            <div className="h-0.5 w-1/2 bg-linear-to-r from-transparent via-red-500 to-transparent   hidden md:block self-start" />

            {totalPages > 1 && (
              <div className="relative z-10 w-full flex items-center justify-center gap-3 pt-2 pb-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPage(i);
                    }}
                    aria-label={`Pagina ${i + 1}`}
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-thirdcolor transition-colors duration-200 cursor-pointer pointer-events-auto ${
                      i === currentPage
                        ? "bg-primary scale-125"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            )}
            <Link
              href="/proiecte"
              className=" w-full inline-flex items-center justify-center rounded-full border border-primary bg-thirdcolor py-4  text-center font-semibold text-primary shadow-lg shadow-black/50 transition duration-300 hover:scale-[1.01] md:px-16 md:py-4"
            >
              Vezi toate proiectele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestProjects;

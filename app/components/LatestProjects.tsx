"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import data from "../data/continut.json";
import NextImage from "next/image";
import PlaceHolder from "../../public/resources/maxresdefault.jpg";
import { ArrowRight } from "lucide-react";

const CARD_WIDTH = 340;
const CARD_GAP = 24;
const CONTAINER_PADDING_DESKTOP = 64;
const CONTAINER_PADDING_MOBILE = 32;
const AUTOPLAY_DELAY = 10000;

const projects = Array(13).fill(null);

const LatestProjects = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          Math.floor((containerWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)),
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

  const totalPages = Math.ceil(projects.length / cardsPerPage);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, AUTOPLAY_DELAY);
    },
    [totalPages],
  );

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, AUTOPLAY_DELAY);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalPages]);

  const start = currentPage * cardsPerPage;
  const visibleProjects = projects.slice(start, start + cardsPerPage);

  return (
    <div
      className="w-full md:min-h-auto min-h-screen flex flex-col items-center justify-start  md:py-20 px-4 md:px-8 bg-black/50 md:bg-black/0 overflow-hidden"
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
          className="rounded-2xl  md:rounded-3xl h-full border border-red-500/20 bg-gradient-to-br from-black via-zinc-950 to-black shadow-2xl overflow-hidden backdrop-blur-xl hover:border-red-400/40 transition-colors group"
        >
          <div className="p-4 md:p-8 flex  flex-col h-full  md:flex-col items-center gap-4 md:gap-6 text-white">
            {/* Grid carduri — 2 coloane pe mobil, flex pe desktop */}
            <div className="w-full overflow-visible h-full">
              <div className="grid md:grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-6 md:justify-center">
                {visibleProjects.map((_, i) => (
                  <LatestCard key={start + i} />
                ))}
              </div>
            </div>

            <div className="h-[2px] w-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent   hidden md:block self-start" />

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestProjects;

const LatestCard = () => {
  return (
    <div className="w-full md:w-full md:max-w-[340px] gap-4 flex-shrink-0 flex flex-col rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
      <div className="w-full aspect-[16/10] overflow-hidden rounded-t-xl border-2 border-primary">
        <NextImage
          src={PlaceHolder}
          alt="Project Image"
          width={340}
          height={210}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col text-white font-black tracking-wide bg-primary">
        <div className="flex items-center justify-between text-lg md:text-2xl uppercase p-3 md:p-4 pb-2">
          <h3 className="text-zinc-300 font-extrabold tracking-tighter">
            GOLF IV
          </h3>
          <div className="flex items-center gap-1 font-bold text-base md:text-xl">
            <span className="text-zinc-300">140</span>
            <ArrowRight
              size={18}
              strokeWidth={3}
              color="#05DF72"
              className="md:w-6 md:h-6"
            />
            <span className="text-green-400">180</span>
          </div>
        </div>

        <div className="relative border-t-2 border-zinc-200/90 flex items-center justify-between p-2 px-3 m-2">
          <div
            className="absolute left-0 top-0 bottom-0 bg-thirdcolor"
            style={{
              width: "45%",
              clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
            }}
          />
          <div className="relative z-10 text-primary font-black text-xs md:text-sm tracking-tight pl-1 uppercase text-center">
            STAGE I
          </div>

          <a
            href="#"
            className="relative z-10 bg-zinc-200 text-primary font-bold uppercase text-[11px] md:text-[14px] py-1 px-4 md:py-2 md:px-8 rounded-full shadow-md hover:bg-white transition-colors tracking-wider text-center"
          >
            Detalii
          </a>
        </div>
      </div>
    </div>
  );
};

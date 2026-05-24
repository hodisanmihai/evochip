"use client";

import React, { useRef, useEffect } from "react"; // Folosim useEffect nativ din React
import Background from "./Background";
import Link from "next/link";
import continut from "../data/continut.json";
import gsap from "gsap"; // Doar GSAP simplu, cel pe care îl ai deja

interface HeroPageProps {
  isVisible: boolean;
}

const HeroPage = ({ isVisible }: HeroPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 1.5 },
      });

      tl.fromTo(
        ".animate-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, delay: 3.3 },
      )
        .fromTo(
          ".animate-subtitle",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=0.6",
        )
        .fromTo(
          ".animate-btn",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.2 },
          "-=1",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative isolate flex min-h-screen w-full items-center justify-center md:justify-start overflow-hidden"
    >
      <div className=" bg-black/50 md:bg-black/0 relative z-10 flex w-full min-h-screen md:min-h-auto flex-col items-start md:items-start justify-evenly md:justify-center gap-6 px-5 pb-16 md:pt-20 sm:px-8 md:px-10 lg:w-1/2 lg:pl-20 lg:pr-10">
        <div className="flex text-left px-10 md:text-center items-start md:items-center justify-center max-w-xl flex-col gap-4 text-shadow-2xl sm:gap-6">
          {/* Adăugat clasa 'animate-title' și 'opacity-0' ca să nu apară brusc înainte de animație */}
          <h1 className="animate-title opacity-0 text-white text-[1.2rem] leading-tight">
            {continut.hero.titluNormal}{" "}
            <span className="text-primary text-shadow-2xl">
              {continut.hero.titluColorat}
            </span>
          </h1>

          {/* Adăugat clasa 'animate-subtitle' și 'opacity-0' */}
          <h2 className="animate-subtitle opacity-0 text-white leading-relaxed text-shadow-2xl">
            {continut.hero.subtitlu}
          </h2>
        </div>

        <div className="mt-2 flex w-full flex-col gap-4 uppercase sm:flex-row lg:w-auto">
          {/* Adăugat clasa 'animate-btn' și 'opacity-0' */}
          <a
            href="tel:+40740344530"
            className="animate-btn opacity-0 inline-flex items-center font-semibold justify-center rounded-full border border-secondary bg-primary py-4 md:px-6 md:py-4 text-center text-white shadow-lg shadow-black/50 transition duration-300 hover:scale-[1.01]"
          >
            Suna pentru o programare
          </a>

          {/* Adăugat clasa 'animate-btn' și 'opacity-0' */}
          <Link
            href="#"
            className="animate-btn opacity-0 inline-flex items-center font-semibold justify-center rounded-full border border-primary bg-secondary py-4 md:px-6 md:py-4 text-center text-primary shadow-lg shadow-black/50 transition duration-300 hover:scale-[1.01]"
          >
            Exploreaza serviciile noastre
          </Link>
        </div>
      </div>

      <Background isVisible={isVisible} />
    </section>
  );
};

export default HeroPage;

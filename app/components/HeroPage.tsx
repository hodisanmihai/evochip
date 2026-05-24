"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import continut from "../data/continut.json";
import gsap from "gsap";

const HeroPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 1.5 },
      });

      tl.fromTo(
        ".animate-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, delay: 2 },
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
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden md:justify-start"
    >
      <div className="relative z-10 flex w-full min-h-screen flex-col items-start justify-evenly gap-6 bg-black/50 px-5 pb-16 sm:px-8 md:min-h-auto md:items-start md:justify-center md:bg-black/0 md:px-10 md:pt-20 lg:w-1/2 lg:pl-20 lg:pr-10">
        <div className="flex max-w-xl flex-col items-start justify-center gap-4 px-10 text-left text-shadow-2xl sm:gap-6 md:items-center md:text-center">
          <h1 className="animate-title opacity-0 text-[1.2rem] leading-tight text-white">
            {continut.hero.titluNormal}{" "}
            <span className="text-primary text-shadow-2xl">
              {continut.hero.titluColorat}
            </span>
          </h1>

          <h2 className="animate-subtitle opacity-0 leading-relaxed text-white text-shadow-2xl">
            {continut.hero.subtitlu}
          </h2>
        </div>

        <div className="mt-2 flex w-full flex-col gap-4 uppercase sm:flex-row lg:w-auto">
          <a
            href="tel:+40740344530"
            className="animate-btn opacity-0 inline-flex items-center justify-center rounded-full border border-secondary bg-primary py-4 text-center font-semibold text-white shadow-lg shadow-black/50 transition duration-300 hover:scale-[1.01] md:px-6 md:py-4"
          >
            Suna pentru o programare
          </a>

          <Link
            href="#"
            className="animate-btn opacity-0 inline-flex items-center justify-center rounded-full border border-primary bg-secondary py-4 text-center font-semibold text-primary shadow-lg shadow-black/50 transition duration-300 hover:scale-[1.01] md:px-6 md:py-4"
          >
            Exploreaza serviciile noastre
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroPage;

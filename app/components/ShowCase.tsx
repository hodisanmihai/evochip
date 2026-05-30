"use client";

import React, { useEffect, useRef } from "react";
import continut from "../data/continut.json";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ShowCase = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: "#showcase1",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power2.out", duration: 1.5 },
      });

      tl1
        .fromTo(
          "#showcase1 .animate-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
        )
        .fromTo(
          "#showcase1 .animate-subtitle",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=1",
        );

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: "#showcase2",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power2.out", duration: 1.2 },
      });

      tl2
        .fromTo(
          "#showcase2 .animate-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
        )
        .fromTo(
          "#showcase2 .animate-subtitle",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=0.8",
        );

      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: "#showcase3",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power2.out", duration: 1.2 },
      });

      tl3
        .fromTo(
          "#showcase3 .animate-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
        )
        .fromTo(
          "#showcase3 .animate-subtitle",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=0.8",
        );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      id="showcase-wrapper"
      ref={containerRef}
      className="bg-black/50 md:bg-black/0"
    >
      <FirstShowCase />
      <SecondShowCase />
      <ThirdShowCase />
    </div>
  );
};

const FirstShowCase = () => {
  return (
    <div
      className="w-full h-auto md:h-screen py-12 flex items-center justify-start p-8 md:p-20 "
      id="showcase1"
    >
      <div className="h-full w-full md:w-1/2 flex flex-col md:items-center justify-center gap-10 md:px-10 text-left text-shadow-2xl sm:gap-6 md:items-start md:text-left">
        <h1 className=" animate-title text-[1.2rem] leading-tight text-white">
          {continut.showcase1.titluNormal}
          <span className="text-primary text-shadow-2xl">
            {continut.showcase1.titluColorat}
          </span>
        </h1>
        <h2 className="animate-subtitle  text-[1rem] leading-tight text-white">
          {continut.showcase1.subtitlu}
        </h2>
      </div>
    </div>
  );
};

const SecondShowCase = () => {
  return (
    <div
      className="w-full h-auto md:h-screen py-12 flex items-center justify-end p-8 md:p-20"
      id="showcase2"
    >
      <div className="h-full w-full md:w-1/2 flex flex-col md:items-center  justify-center gap-4 md:px-10 text-left text-shadow-2xl sm:gap-6 md:items-start md:text-left">
        <h1 className="animate-title text-[1.2rem] leading-tight text-white">
          {continut.showcase2.titluNormal}
          <span className="text-primary text-shadow-2xl">
            {continut.showcase2.titluColorat}
          </span>
        </h1>
        <h2 className="animate-subtitle  text-[1rem] leading-tight text-white">
          {continut.showcase2.subtitlu}
        </h2>
      </div>
    </div>
  );
};
const ThirdShowCase = () => {
  return (
    <div
      className="w-full h-auto md:h-screen py-12 flex md:items-center  justify-start p-8 md:p-20"
      id="showcase3"
    >
      <div className="h-full w-full md:w-1/2 flex flex-col md:items-center justify-center gap-4 md:px-10 text-left text-shadow-2xl sm:gap-6 md:items-start md:text-left">
        <h1 className="animate-title text-[1.2rem] leading-tight text-white">
          {continut.showcase3.titluNormal}
          <span className="text-primary text-shadow-2xl">
            {continut.showcase3.titluColorat}
          </span>
        </h1>
        <h2 className="animate-subtitle  text-[1rem] leading-tight text-white">
          {continut.showcase3.subtitlu}
        </h2>
      </div>
    </div>
  );
};

export default ShowCase;

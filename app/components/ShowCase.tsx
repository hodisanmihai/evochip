"use client";

import React from "react";
import continut from "../data/continut.json";
import gsap from "gsap";

const ShowCase = () => {
  return (
    <div>
      <FirstShowCase />
      <SecondShowCase />
      <ThirdShowCase />
    </div>
  );
};

const FirstShowCase = () => {
  return (
    <div
      className="w-full h-screen  flex items-center justify-start p-20"
      id="showcase1"
    >
      <div className="h-full w-1/2 flex flex-col items-center justify-center gap-4 px-10 text-left text-shadow-2xl sm:gap-6 md:items-start md:text-left">
        <h1 className="animate-title text-[1.2rem] leading-tight text-white">
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
      className="w-full h-screen  flex items-center justify-end p-20"
      id="showcase2"
    >
      <div className="h-full w-1/2 flex flex-col items-center justify-center gap-4 px-10 text-left text-shadow-2xl sm:gap-6 md:items-start md:text-left">
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
      className="w-full h-screen  flex items-center justify-start p-20"
      id="showcase3"
    >
      <div className="h-full w-1/2 flex flex-col items-center justify-center gap-4 px-10 text-left text-shadow-2xl sm:gap-6 md:items-start md:text-left">
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

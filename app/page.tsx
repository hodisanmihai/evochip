"use client";

import Intro from "./components/Intro";
import HeroPage from "./components/HeroPage";
import ShowCase from "./components/ShowCase";
import { useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [showHero, setShowHero] = useState(false);

  const revealHero = useCallback(() => {
    setShowHero(true);
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }, []);
  const finishIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      {showIntro && (
        <Intro onRevealHero={revealHero} onComplete={finishIntro} />
      )}
      {showHero && <HeroPage />}
      {showHero && <ShowCase />}
    </main>
  );
}
1;

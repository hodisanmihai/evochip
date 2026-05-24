"use client";

import Intro from "./components/Intro";
import HeroPage from "./components/HeroPage";
import { useCallback, useState } from "react";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [showHero, setShowHero] = useState(false);

  const revealHero = useCallback(() => {
    setShowHero(true);
  }, []);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <main className="relative flex w-screen min-h-screen flex-1 flex-col items-center justify-center overflow-hidden">
      {showIntro && (
        <Intro onRevealHero={revealHero} onComplete={finishIntro} />
      )}
      <HeroPage isVisible={showHero} />
    </main>
  );
}

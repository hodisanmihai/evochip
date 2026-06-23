"use client";

import Intro from "./Intro";
import HeroPage from "./HeroPage";
import ShowCase from "./ShowCase";
import { useCallback, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ServicesShowCase from "./ServicesShowCase";
import LatestProjects from "./LatestProjects";
import Background from "./Background";
import Prices from "./Prices";
import Contact from "./Contact";
import Footer from "./Footer";
import NavBar from "./NavBar";
import type {
  PriceProp,
  ProjectProp,
  ContactProp,
} from "@/lib/supabase/services/landingTypes";

type HomeClientProps = {
  projects: ProjectProp[];
  prices: PriceProp[];
  contact: ContactProp;
};

export default function HomeClient({
  projects,

  prices,

  contact,
}: HomeClientProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [showHero, setShowHero] = useState(false);

  const revealHero = useCallback(() => {
    setShowHero(true);
    setTimeout(() => ScrollTrigger.refresh(), 800);
  }, []);
  const finishIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center ">
      {showIntro && (
        <Intro onRevealHero={revealHero} onComplete={finishIntro} />
      )}

      {showHero && <HeroPage />}
      {showHero && <ShowCase />}
      {showHero && <ServicesShowCase />}

      {showHero && <LatestProjects />}
      {showHero && <NavBar contact={contact} />}
      {showHero && <Prices prices={prices} contact={contact} />}
      {showHero && <Contact contact={contact} />}
      {showHero && <Footer contact={contact} />}

      <Background isVisible={showHero} />
    </main>
  );
}

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
import type { PriceProp, ContactProp } from "@/lib/supabase/services/landingTypes";

import type { Project } from "@/lib/types/project";

import { useRouter } from "next/navigation";
import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";

type HomeClientProps = {
  projects: Project[];
  prices: PriceProp[];
  contact: ContactProp | null;
  projectsError: boolean;
  pricesError: boolean;
};

export default function HomeClient({
  projects,
  projectsError,
  pricesError,

  prices,

  contact,
}: HomeClientProps) {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  useProjectRefresh(refresh);
  const availableContact = contact ?? { telefon: "", email: "" };
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
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center ">
      <noscript><style>{".intro-wrapper { display: none !important; }"}</style></noscript>
      {showIntro && (
        <Intro onRevealHero={revealHero} onComplete={finishIntro} />
      )}

      <HeroPage active={showHero} />
      <ShowCase active={showHero} />
      <ServicesShowCase active={showHero} />

      <LatestProjects projects={projects} error={projectsError} onRetry={refresh} />
      <NavBar contact={availableContact} />
      <Prices prices={prices} contact={availableContact} error={pricesError} onRetry={refresh} />
      {contact ? <Contact contact={contact} /> : (
        <section id="contact" className="relative z-10 p-8 text-center text-zinc-300">
          <p>Datele de contact nu sunt disponibile momentan.</p>
          <button type="button" onClick={refresh} className="mt-3 underline">Reîncearcă</button>
        </section>
      )}
      {contact && <Footer contact={contact} />}

      <Background isVisible={showHero} />
    </div>
  );
}

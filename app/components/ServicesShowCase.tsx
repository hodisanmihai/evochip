"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import fuel from "../../public/resources/fuelv1-icon.png";
import premium from "../../public/resources/premium-icon.png";
import safe from "../../public/resources/safe-icon.png";
import eficient from "../../public/resources/eficient-icon.png";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    id: "1",
    icon: safe,
    title: "Siguranță și Fiabilitate",
    description:
      "Fiecare reprogramare este realizată cu atenție și verificată riguros pentru a păstra funcționarea optimă a motorului. Evochip păstrează întotdeauna fișierul original al ECU-ului.",
  },
  {
    id: "2",
    icon: eficient,
    title: "Performanță Garantată",
    description:
      "Creșteri reale de putere și cuplu, optimizate pentru configurația și caracteristicile specifice ale motorului tău.",
  },
  {
    id: "02",
    icon: fuel,
    title: "Economie de Carburant",
    description:
      "Optimizarea parametrilor ECU poate reduce consumul de combustibil cu până la 15%, menținând performanța și fiabilitatea motorului.",
  },
  {
    id: "03",
    icon: premium,
    title: "Soluții Profesionale & Diagnoză",
    description:
      "Diagnoză avansată, monitorizare Live Data și soluții software pentru DPF, EGR și AdBlue, adaptate nevoilor fiecărui vehicul.",
  },
];

const CARD_HEIGHT = 380;

const ServicesShowCase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(cardsRef.current, {
        y: window.innerHeight,
        opacity: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${cards.length * 400}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
        },
      });

      cardsRef.current.forEach((card, i) => {
        tl.to(
          card,
          {
            y: 0,
            duration: 0.4,
            ease: "power3.out",
          },
          i * 0.4,
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="showcase4"
      ref={sectionRef}
      className="w-full h-screen flex flex-col items-start justify-start py-20 p-4 md:p-8 md:px-0 gap-8 overflow-hidden bg-black/50 md:bg-black/0"
    >
      <h1 className="animate-title text-[1.2rem] leading-tight px-6 md:mx-35 text-white whitespace-nowrap">
        Ce <span className="text-red-500">oferim</span>
      </h1>

      <div
        className="relative w-full max-w-2xl mt-4 mt-30 px-2 md:mx-35"
        style={{ height: CARD_HEIGHT }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => {
              if (el) cardsRef.current[index] = el;
            }}
            className="absolute inset-0"
            style={{ zIndex: index + 1 }}
          >
            <div className="w-full h-full rounded-3xl border border-red-500/20 bg-gradient-to-br from-black via-zinc-950 to-black shadow-2xl overflow-hidden backdrop-blur-xl hover:border-red-400/40 transition-colors group cursor-pointer">
              <div className="p-6 md:p-8 flex flex-col gap-4 md:gap-6 text-white h-full justify-center">
                {/* Icon + titlu */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-red-500/60 flex items-center justify-center bg-transparent shrink-0">
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-red-200 via-white to-red-200 bg-clip-text text-transparent leading-tight">
                    {card.title}
                  </h3>
                </div>

                {/* Descriere */}
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-sm">
                  {card.description}
                </p>

                {/* Linie decorativă */}
                <div className="h-[2px] w-1/4 bg-gradient-to-r from-transparent via-red-500 to-transparent group-hover:w-1/2 transition-all duration-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesShowCase;

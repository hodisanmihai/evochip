"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Prices = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    if (!section || !title) return;

    gsap.set(title, {
      opacity: 0,
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      y: 20,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(title, {
            opacity: 1,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          });
          observer.unobserve(section);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      setIsDragging(true);
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      setIsDragging(false);
    };

    const handleMouseUp = () => {
      isDown = false;
      setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const pricingData = [
    {
      id: "stage-1",
      title: "STAGE I",
      price: "1000 RON",
      description: "Performanță pentru condusul zilnic",
      benefits: [
        "<strong>+20% până la +30%</strong> Cai Putere & Cuplu",
        "Scăderea consumului cu până la <strong>10%</strong> la mers constant",
        "Răspuns instantaneu al pedalei de accelerație",
        "Componentele mecanice rămân <strong>100% originale</strong>",
        "Diagnoză completă inclusă (înainte și după soft)",
      ],
    },
    {
      id: "stage-2",
      title: "STAGE II",
      price: "1500 RON",
      description: "Optimizare avansată cu modificări hardware",
      benefits: [
        "<strong>+35% până la +45%</strong> Cai Putere & Cuplu",
        "Necesită modificări mecanice (evacuare / admisie)",
        "Livrări de putere agresive pe toată plaja de turații",
        "Dezactivare limitări electronice de fabrică",
        "Diagnoză dedicată și monitorizare parametri în timp real",
      ],
    },
    {
      id: "stage-3",
      title: "STAGE III",
      price: "2500 RON",
      description: "Performanță extremă pentru entuziaști",
      benefits: [
        "<strong>Peste +50%</strong> putere față de stoc",
        "Configurație custom pentru turbo mărit și intercooler",
        "Hărți calibrate individual pe standul dyno",
        "Ranforsare electronică a protecțiilor motorului",
        "Asistență tehnică completă pentru componente upgrade",
      ],
    },
    {
      id: "stage-x",
      title: "STAGE X",
      price: "3500 RON",
      description: "Proiecte speciale și calibrări motorsport",
      benefits: [
        "Soluții software unice <strong>100% Custom Custom</strong>",
        "Opțiuni incluse: Pop & Bangs, Hard Limiter, Launch Control",
        "Calibrare combustibili alternativi sau hibrizi",
        "Dezvoltare hărți specifice pentru competiții sau circuit",
        "Suport tehnic dedicat pe toată durata proiectului",
      ],
    },
    {
      id: "diagnoza",
      title: "DIAGNOZĂ",
      price: "200 RON",
      description: "Identificare erori și verificare parametri",
      benefits: [
        "Scanare completă a tuturor modulelor electronice",
        "Citire parametri în timp real (presiune turbo, injectoare)",
        "Interpretare profesională a codurilor de eroare active",
        "Ștergere martori bord și resetare intervale service",
        "Raport detaliat generat direct pe mail sau WhatsApp",
      ],
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-screen py-12 flex items-center justify-start p-4 sm:p-8 md:p-20 bg-primary"
    >
      <div className="w-full h-full flex flex-col items-center justify-start gap-8 md:gap-12">
        <h1
          ref={titleRef}
          className="md:px-22 self-start text-[1.2rem] md:text-[1.5rem] leading-tight text-white whitespace-nowrap overflow-hidden"
        >
          Lista <span className="text-black"> Preturi</span>
        </h1>

        <div
          ref={scrollContainerRef}
          className={`w-full flex overflow-x-auto overscroll-x-contain gap-6 md:gap-8 pb-6 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {pricingData.map((stage) => (
            <div
              key={stage.id}
              className="shrink-0 w-[290px] xs:w-[350px] sm:w-[400px] md:p-4"
            >
              <CardPrices
                title={stage.title}
                price={stage.price}
                benefits={stage.benefits}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prices;

const CardPrices = ({
  title,
  price,
  benefits,
}: {
  title: string;
  price: string;
  benefits: string[];
}) => {
  const rows = Array.from({ length: 38 });

  return (
    <div className="bg-thirdcolor border border-zinc-800 w-full xs:aspect-[10/16] rounded-tl-3xl relative overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[550px] md:min-h-[700px] xs:min-h-0">
      {/* CARD BACKGROUND */}
      <div className="absolute inset-[-50%] flex flex-col justify-center items-center rotate-[45deg] opacity-10 pointer-events-none transition-opacity">
        {rows.map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="text-black text-[1.2rem] font-black whitespace-nowrap tracking-none uppercase leading-none my-0"
          >
            {`${title} `.repeat(9)}
          </div>
        ))}
      </div>

      {/* CARD CONTENT */}
      <div className="relative z-10 p-4 sm:p-6 text-black flex flex-col justify-between h-full flex-1">
        <div>
          {/* STAGE INDICATOR */}
          <div className="relative border-t-2 border-black flex items-center justify-between p-2 px-3 m-2">
            <div
              className="absolute left-0 top-[-2px] bottom-0 bg-black"
              style={{
                width: "70%",
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
              }}
            />
            <div className="relative z-10 text-primary font-black text-sm sm:text-base md:text-lg tracking-tight pl-1 uppercase text-center">
              {title}
            </div>
          </div>

          {/* Descriere Scurta */}
          <p className="text-center text-base sm:text-lg md:text-xl font-semibold my-4 px-2">
            Performanță pentru condusul zilnic
          </p>

          {/* PREȚURI */}
          <div className="relative border-b-2 border-black flex items-center justify-between pt-2 px-3 pb-0 m-2">
            <div
              className="absolute right-0 top-0 bottom-[-2px] bg-black"
              style={{
                width: "70%",
                clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
            <div className="relative z-10 text-primary font-black text-lg sm:text-xl md:text-2xl tracking-tight pr-1 text-center w-full text-right flex items-baseline justify-end gap-2">
              <span className="text-[10px] sm:text-xs font-normal lowercase">
                de la{" "}
              </span>
              {price}
            </div>
          </div>

          {/* BENEFICII */}
          <ul className="space-y-2 p-2 sm:p-4 text-sm sm:text-base md:text-lg font-medium text-black my-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <span dangerouslySetInnerHTML={{ __html: benefit }} />
              </li>
            ))}
          </ul>
        </div>

        {/* CTA CENTRAT */}
        <a
          href="tel:+40740344530"
          className="block w-full sm:w-fit mx-auto mt-4 bg-primary text-thirdcolor font-black px-6 py-3 rounded-full text-center hover:scale-105 transition-transform text-sm sm:text-base whitespace-nowrap"
        >
          Sună pentru o programare
        </a>
      </div>
    </div>
  );
};

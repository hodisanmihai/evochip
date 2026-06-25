"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PriceProp, ContactProp } from "@/lib/supabase/services/landingTypes";

type PricesProps = {
  prices: PriceProp[];
  contact: ContactProp;
};

const Prices = ({ prices, contact }: PricesProps) => {
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
      { threshold: 0.3 }
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

  return (
    <div
      id="prices"
      ref={sectionRef}
      className="w-full min-h-screen py-12 flex items-center justify-start p-4 sm:p-8 md:p-20 bg-primary z-2"
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
          {prices.map((stage) => {
            const benefits = [
              stage.text_1,
              stage.text_2,
              stage.text_3,
              stage.text_4,
              stage.text_5,
            ].filter((b): b is string => Boolean(b));

            return (
              <div
                key={stage.id}
                className="shrink-0 72.5 xs:w-[350px] sm:w-100 md:p-4 mx-4 md:mx-0"
              >
                <CardPrices
                  title={stage.title}
                  price={stage.price}
                  benefits={benefits}
                  contact={contact}
                />
              </div>
            );
          })}
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
  contact,
}: {
  title: string;
  price: string;
  benefits: string[];
  contact: ContactProp;
}) => {
  const rows = Array.from({ length: 38 });

  return (
    <div className=" bg-thirdcolor border border-zinc-800 w-80 md:w-full xs:aspect-[10/16] rounded-tl-3xl relative overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-137.5 md:min-h-175 xs:min-h-0 ">
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
              className="absolute left-0 -top-0.5 bottom-0 bg-black"
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
              className="absolute right-0 top-0 -bottom-0.5 bg-black"
              style={{
                width: "70%",
                clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
            <div className="relative z-10 text-primary font-black text-lg sm:text-xl md:text-2xl tracking-tight pr-1  w-full text-right flex items-baseline justify-end gap-2">
              <span className="text-[10px] sm:text-xs font-normal lowercase">
                de la
              </span>
              {price} RON
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
          href={`tel:+${contact.telefon}`}
          className="block w-full sm:w-fit mx-auto mt-4 bg-primary text-thirdcolor font-black px-6 py-3 rounded-full text-center hover:scale-105 transition-transform text-sm sm:text-base whitespace-nowrap"
        >
          Sună pentru o programare
        </a>
      </div>
    </div>
  );
};

"use client";

import { ArrowRight } from "lucide-react";
import NextImage from "next/image";
import PlaceHolder from "../../../public/resources/LOGO-EVOCHIP.png";
import { ProjectProps } from "@/lib/supabase/services/landingTypes";
import { useState } from "react";
import Link from "next/link";

const CarCard = ({ project }: { project: ProjectProps }) => {
  const [imgError, setImgError] = useState(false);

  const carModel = project.car_models;
  if (!carModel) return null;

  const brandData = Array.isArray(carModel.car_brands)
    ? carModel.car_brands[0]
    : carModel.car_brands;
  const brandName = brandData?.car_brand || "Unknown";
  const modelName = carModel.car_model || "Unknown";
  const engine_code = project.engine_code || "Unknown"; // Adaugat

  const stageLabel = project.stage?.[0]?.solution_name ?? "STAGE 1";
  const oldPower = project.initial_power || 0;
  const newPower = project.new_power || 0;

  const imageSrc =
    !imgError && project.image_url ? project.image_url : PlaceHolder;

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const slug = `${slugify(brandName)}-${slugify(modelName)}-${slugify(
    String(engine_code)
  )}-${slugify(String(newPower))}-hp-${slugify(stageLabel)}-${
    project.id
  }-evochip`;

  return (
    <Link href={`/proiecte/${slug}`}>
      <div className="w-full md:max-w-75 gap-4 shrink-0 flex flex-col  rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
        <div
          className="w-full overflow-hidden rounded-t-xl border-2 border-primary"
          style={{ aspectRatio: "16/10" }}
        >
          <NextImage
            src={imageSrc}
            alt={`${brandName} ${modelName}`}
            width={310}
            height={190}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        <div className="flex flex-col text-white font-black tracking-wide bg-primary">
          <div className="flex items-center justify-between text-lg md:text-2xl uppercase p-3 pb-2">
            <h3 className="text-zinc-300 font-extrabold tracking-tighter">
              {brandName}
              <span className="font-normal text-sm pl-1">{modelName}</span>
            </h3>

            <div className="flex items-center gap-1 font-bold text-base md:text-xl">
              <span className="text-zinc-300">{oldPower}</span>
              <ArrowRight
                size={18}
                strokeWidth={3}
                color="#05DF72"
                className="md:w-6 md:h-6"
              />
              <span className="text-green-400">{newPower}</span>
            </div>
          </div>

          <div className="relative border-t-2 border-zinc-200/90 flex items-center justify-between p-2 px-3 m-2">
            <div
              className="absolute left-0 top-0 bottom-0 bg-thirdcolor"
              style={{
                width: "45%",
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
              }}
            />
            <div className="relative z-1 text-primary font-black text-xs md:text-sm tracking-tight pl-1 uppercase text-center">
              {stageLabel}
            </div>

            <Link
              href={`/proiecte/${slug}`}
              className="relative z-1 bg-zinc-200 text-primary font-bold uppercase text-[11px] md:text-[14px] py-1 px-4 md:py-2 md:px-8 rounded-full shadow-md hover:bg-white transition-colors tracking-wider text-center"
            >
              Detalii
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
{
}

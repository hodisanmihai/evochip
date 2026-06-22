"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Play, FileText } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProjectItem } from "../types";

const Page = () => {
  const params = useParams();
  const slug = params.slug as string;
  const projectId = slug.split("-").slice(-2)[0];

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          stage (id, solution_name),
          car_models (
            id,
            car_model,
            car_brand,
            car_brands (id, car_brand)
          )
        `
        )
        .eq("id", projectId)
        .single();

      if (error || !data) {
        console.error("Error:", error);
        setLoading(false);
        return;
      }

      setProject(data as ProjectItem);
      setLoading(false);
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <div className="text-zinc-400 p-8">Se încarcă...</div>;
  if (!project)
    return <div className="text-zinc-400 p-8">Proiectul nu a fost găsit</div>;

  const carModel = project.car_models;
  const brandData = Array.isArray(carModel?.car_brands)
    ? carModel?.car_brands[0]
    : carModel?.car_brands;
  const brandName = brandData?.car_brand || "Unknown";
  const modelName = carModel?.car_model || "Unknown";
  const stageLabel = project.stage?.solution_name ?? "STAGE 1";
  const combustion = project.combustion;
  const engineCode = project.engine_code;
  const engineCapacity = project.engine_capacity;
  const initialPower = project.initial_power;
  const newPower = project.new_power;
  const initialTorque = project.initial_torque;
  const newTorque = project.new_torque;
  const transmision = project.transmition;
  const modList = project.mods;
  const note = project.note;
  const dynoFile = project.dyno_file_url;
  const videoLink = project.video_url;

  const modArray = (() => {
    if (!modList) return [];
    if (Array.isArray(modList)) return modList;
    try {
      const parsed = JSON.parse(modList as string);
      return Array.isArray(parsed) ? parsed : [modList];
    } catch {
      return [modList];
    }
  })();
  return (
    <div className="min-h-full px-4 md:px-8 py-4">
      <Link href="/proiecte">
        <ArrowLeft />
      </Link>
      <div className="w-full flex flex-col lg:flex-row gap-6 py-4">
        <div className="w-full lg:w-1/2 flex flex-col justify-start items-start uppercase">
          <div className="relative w-full aspect-16/10 border border-primary rounded-md overflow-hidden">
            <NextImage
              src={project.image_url || "/resources/LOGO-EVOCHIP.png"}
              alt={`${brandName} ${modelName}`}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="relative w-full border-t-2 border-zinc-200/90 flex items-center justify-between p-2 px-3 mt-2">
            <div
              className="absolute left-0 top-0 bottom-0 bg-thirdcolor"
              style={{
                width: "45%",
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
              }}
            />
            <div className="relative z-1 text-primary font-black text-xl md:text-2xl tracking-tight pl-1 uppercase">
              {stageLabel}
            </div>

            <span className="flex items-center gap-3 text-xl md:text-3xl  font-black">
              <span className="text-secondary">{initialPower}</span>
              <ArrowRight className="text-green-500" size={24} />
              <span className="text-green-500">{newPower}</span>
            </span>
          </div>
          <div className="w-full flex flex-col font-semibold gap-2 pt-4 text-sm md:text-base">
            <span className="w-full flex justify-between">
              <span>motorizare</span> <span>{combustion}</span>
            </span>
            <span className="w-full flex justify-between">
              <span>Capacitate CC</span> <span>{engineCapacity}</span>
            </span>

            <span className="w-full flex justify-between">
              <span>cod motor</span> <span>{engineCode}</span>
            </span>
            <span className="w-full flex flex-row justify-between">
              Putere
              <span className="w-1/2">
                <span className="flex flex-row justify-between">
                  <span className="text-secondary">{initialPower}hp</span>
                  <ArrowRight className="text-green-500" />
                  <span className=" text-green-500 ">{newPower}hp</span>
                </span>
              </span>
            </span>
            <span className="w-full flex flex-row justify-between">
              Cuplu
              <span className="w-1/2">
                <span className="flex flex-row justify-between">
                  <span className="text-secondary">{initialTorque}nm</span>
                  <ArrowRight className="text-green-500" />
                  <span className=" text-green-500 ">{newTorque}nm</span>
                </span>
              </span>
            </span>
            <span className="w-full flex flex-row justify-between">
              <span>Transmisie</span> <span>{transmision}</span>
            </span>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5">
          <span className="flex flex-wrap gap-2 items-center">
            <h2 className="text-2xl md:text-3xl font-black">{brandName}</h2>
            <h2 className="text-2xl md:text-3xl font-black">{modelName}</h2>
          </span>
          <div className="text-xl uppercase text-secondary">
            Modificari
            <ul className="flex flex-wrap gap-2 text-xs py-4">
              {modArray.map((mod, index) => (
                <li
                  className="bg-primary text-white rounded-2xl py-2 px-4"
                  key={index}
                >
                  {mod}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-100/5 rounded-md p-4 border border-zinc-200/10">
            <p className="text-xl uppercase text-secondary">Observatii</p>
            <p className="mt-2 text-sm md:text-base">{note}</p>
          </div>
          <div className="flex gap-3 mt-auto">
            {dynoFile && (
              <a
                href={dynoFile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-200 hover:bg-white text-primary text-sm font-bold uppercase tracking-wider py-3 px-4 rounded-full transition"
              >
                <FileText size={16} />
                Fișă Dyno
              </a>
            )}
            {videoLink && (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-200 hover:bg-white text-primary text-sm font-bold uppercase tracking-wider py-3 px-4 rounded-full transition"
              >
                <Play size={16} />
                Video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

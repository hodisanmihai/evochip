import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { normalizeMods, safeWebUrl } from "@/lib/data/validation";
import { ArrowLeft, ArrowRight, Play, FileText } from "lucide-react";
import Link from "next/link";
import ProjectGallery from "../components/ProjectGallery";
import ProjectRefresh from "../components/ProjectRefresh";
import { projectImages } from "@/lib/projects/gallery";
import { getPublicProject } from "@/lib/projects/public";
import { projectSlug } from "@/lib/projects/slug";
import { projectName, projectDescription, projectUrl, projectStructuredData, serializeJsonLd } from "@/lib/projects/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublicProject((await params).slug);
  if (!project) notFound();
  const title = `${projectName(project)} | Chiptuning Oradea | EvoChip`;
  const description = projectDescription(project);
  const url = projectUrl(project);
  const images = project.image_url ? [{ url: project.image_url, alt: projectName(project) }] : [{ url: "/resources/LOGO-EVOCHIP.png", alt: "EvoChip" }];
  return {
    title: { absolute: title }, description, alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "EvoChip", locale: "ro_RO", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((image) => image.url) },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();
  if (slug !== projectSlug(project)) permanentRedirect(`/proiecte/${projectSlug(project)}`);

  const carModel = project.car_models;
  const brandData = carModel?.car_brands;
  const brandName = brandData?.car_brand || "";
  const modelName = carModel?.car_model || "";
  const stageLabel = project.stage?.solution_name ?? "Stage nespecificat";
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
  const dynoFile = safeWebUrl(project.dyno_file_url);
  const videoLink = safeWebUrl(project.video_url);

  const modArray = normalizeMods(modList);
  return (
    <div className="min-h-full px-4 md:px-8 py-4">
      <ProjectRefresh />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(projectStructuredData(project)) }} />
      <Link href="/proiecte" aria-label="Înapoi la proiecte">
        <ArrowLeft />
      </Link>
      <div className="w-full flex flex-col lg:flex-row gap-6 py-4">
        <div className="w-full lg:w-1/2 flex flex-col justify-start items-start uppercase">
          <ProjectGallery metadata={project.image_metadata} images={projectImages(project.image_url, project.image_urls)} title={`${brandName} ${modelName}`} />
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
              <span className="text-secondary">{initialPower ?? "—"}</span>
              <ArrowRight className="text-green-500" size={24} />
              <span className="text-green-500">{newPower ?? "—"}</span>
            </span>
          </div>
          <div className="w-full flex flex-col font-semibold gap-2 pt-4 text-sm md:text-base">
            <span className="w-full flex justify-between">
              <span>motorizare</span> <span>{combustion || "—"}</span>
            </span>
            <span className="w-full flex justify-between">
              <span>Capacitate CC</span> <span>{engineCapacity ?? "—"}</span>
            </span>

            <span className="w-full flex justify-between">
              <span>cod motor</span> <span>{engineCode || "—"}</span>
            </span>
            <span className="w-full flex flex-row justify-between">
              Putere
              <span className="w-1/2">
                <span className="flex flex-row justify-between">
                  <span className="text-secondary">{initialPower != null ? `${initialPower} CP` : "—"}</span>
                  <ArrowRight className="text-green-500" />
                  <span className=" text-green-500 ">{newPower != null ? `${newPower} CP` : "—"}</span>
                </span>
              </span>
            </span>
            <span className="w-full flex flex-row justify-between">
              Cuplu
              <span className="w-1/2">
                <span className="flex flex-row justify-between">
                  <span className="text-secondary">{initialTorque != null ? `${initialTorque} Nm` : "—"}</span>
                  <ArrowRight className="text-green-500" />
                  <span className=" text-green-500 ">{newTorque != null ? `${newTorque} Nm` : "—"}</span>
                </span>
              </span>
            </span>
            <span className="w-full flex flex-row justify-between">
              <span>Transmisie</span> <span>{transmision || "—"}</span>
            </span>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-5">
          <h1 className="project-heading flex flex-wrap gap-2 items-center text-2xl md:text-3xl font-black">
            <span>{brandName}</span><span>{modelName}</span>
            {project.stage && <span className="sr-only">{stageLabel}</span>}
          </h1>
          <p className="text-sm text-zinc-300">{projectDescription(project)}</p>
          <div className="text-xl uppercase text-secondary">
            <h2 className="text-xl">Modificări</h2>
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
            <h2 className="text-xl uppercase text-secondary">Observații</h2>
            <p className="mt-2 text-sm md:text-base">{note}</p>
          </div>
          <div className="flex gap-3 mt-auto ">
            {dynoFile && (
              <a
                href={dynoFile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 bg-zinc-200 hover:bg-white text-primary text-sm font-bold uppercase tracking-wider py-3 px-4 rounded-full transition"
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

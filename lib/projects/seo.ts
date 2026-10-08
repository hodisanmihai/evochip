import type { Project } from "../types/project";
import { projectSlug } from "./slug.ts";

export const SITE_URL = "https://evochip.ro";
export const PROJECTS_PER_PAGE = 6;
export const PROJECTS_TITLE = "Proiecte Chiptuning & Resoftări Auto Oradea | EvoChip";
export const PROJECTS_DESCRIPTION = "Descoperă proiectele EvoChip de chiptuning și resoftare ECU. Stage 1, Stage 2 și optimizări realizate în Oradea pentru Volkswagen, BMW, Audi, Mercedes și alte mărci.";

export function projectName(project: Project) {
  return [project.car_models?.car_brands?.car_brand, project.car_models?.car_model, project.stage?.solution_name].filter(Boolean).join(" ") || "Proiect EvoChip";
}

export function projectDescription(project: Project) {
  const details = [
    project.combustion?.trim(),
    project.engine_capacity != null && project.engine_capacity > 0 ? `${project.engine_capacity} cm³` : "",
    project.engine_code?.trim() ? `motor ${project.engine_code.trim()}` : "",
  ].filter(Boolean).join(", ");
  const parts = [`${projectName(project)} — proiect de chiptuning EvoChip Oradea${details ? ` (${details})` : ""}.`];
  if (project.initial_power != null && project.new_power != null) parts.push(`Putere: ${project.initial_power} → ${project.new_power} CP.`);
  if (project.initial_torque != null && project.new_torque != null) parts.push(`Cuplu: ${project.initial_torque} → ${project.new_torque} Nm.`);
  return parts.join(" ");
}

export function projectUrl(project: Project) {
  return `${SITE_URL}/proiecte/${projectSlug(project)}`;
}

export function listingPath(page: number) {
  return page > 1 ? `/proiecte?page=${page}` : "/proiecte";
}

export function parseListingPage(value: string | string[] | undefined) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : 1;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function projectStructuredData(project: Project) {
  const url = projectUrl(project);
  const name = projectName(project);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#page`, url, name, description: projectDescription(project),
        inLanguage: "ro", ...(project.image_url ? { primaryImageOfPage: { "@type": "ImageObject", contentUrl: project.image_url } } : {}) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "EvoChip", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Proiecte", item: `${SITE_URL}/proiecte` },
        { "@type": "ListItem", position: 3, name, item: url },
      ] },
    ],
  };
}

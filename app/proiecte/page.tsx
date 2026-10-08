import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient";
import { getPublicProjects } from "@/lib/projects/public";
import { listingPath, parseListingPage, PROJECTS_TITLE, PROJECTS_DESCRIPTION, PROJECTS_PER_PAGE, projectName, projectUrl, serializeJsonLd, SITE_URL } from "@/lib/projects/seo";

type Props = { searchParams: Promise<{ page?: string | string[] }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parseListingPage((await searchParams).page);
  const url = `${SITE_URL}${listingPath(page)}`;
  const title = page > 1 ? `Proiecte Chiptuning — Pagina ${page} | EvoChip` : PROJECTS_TITLE;
  return {
    title: { absolute: title }, description: PROJECTS_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: { title, description: PROJECTS_DESCRIPTION, url, siteName: "EvoChip", locale: "ro_RO", type: "website",
      images: [{ url: "/resources/LOGO-EVOCHIP.png", alt: "EvoChip — proiecte chiptuning" }] },
    twitter: { card: "summary_large_image", title, description: PROJECTS_DESCRIPTION, images: ["/resources/LOGO-EVOCHIP.png"] },
  };
}

export default async function Page({ searchParams }: Props) {
  const query = (await searchParams).page;
  const page = parseListingPage(query);
  const projects = await getPublicProjects();
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  if (query !== undefined && (query !== String(page) || page === 1 || page > totalPages)) redirect(listingPath(Math.min(page, totalPages)));
  const visible = projects.slice((page - 1) * PROJECTS_PER_PAGE, page * PROJECTS_PER_PAGE);
  return <>
    <h1 className="project-list-heading mb-6 text-xl md:text-2xl font-bold">Proiecte Chiptuning &amp; Resoftări Auto</h1>
    <ProjectsClient projects={projects} initialPage={page} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
      "@context": "https://schema.org", "@type": "CollectionPage", name: PROJECTS_TITLE,
      url: `${SITE_URL}${listingPath(page)}`, description: PROJECTS_DESCRIPTION,
      mainEntity: { "@type": "ItemList", itemListElement: visible.map((project, index) => ({
        "@type": "ListItem", position: (page - 1) * PROJECTS_PER_PAGE + index + 1, name: projectName(project), url: projectUrl(project),
      })) },
    }) }} />
  </>;
}

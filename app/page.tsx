export const dynamic = "force-dynamic";

import { getLandingData } from "@/lib/supabase/services/landing";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const { projects, prices, contact, projectsError, pricesError } = await getLandingData();

  return (
    <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center ">
      <HomeClient projects={projects} projectsError={projectsError} prices={prices} pricesError={pricesError} contact={contact} />
    </main>
  );
}

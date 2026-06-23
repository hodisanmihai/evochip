"use client";

import CarCard from "./CarCard";
import { ProjectProps } from "@/lib/supabase/services/landingTypes";

interface CardGridsProps {
  paginatedProjects: ProjectProps[];
}

const CardGrids = ({ paginatedProjects }: CardGridsProps) => {
  return (
    <div className="w-[90%]">
      <div className=" grid justify-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProjects.length > 0 ? (
          paginatedProjects.map((project) => (
            <CarCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-zinc-400">
            <p>Nu s-au gasit masini cu filtrele selectate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardGrids;

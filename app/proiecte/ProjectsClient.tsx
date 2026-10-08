"use client";

import { useRouter } from "next/navigation";
import { PROJECTS_PER_PAGE } from "@/lib/projects/seo";

import React, { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import StageSelector from "./components/StageSelector";
import ActiveFilters from "./components/ActiveFilters";
import CardGrids from "./components/CardGrids";
import Pagination from "./components/Pagination";
import type { Project } from "@/lib/types/project";
import { useCarFilter } from "./context/CarFilterContext";

import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";

const ITEMS_PER_PAGE = PROJECTS_PER_PAGE;

const ProjectsClient = ({ projects, initialPage }: { projects: Project[]; initialPage: number }) => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  useProjectRefresh(refresh);

  const {
    selectedBrandId,
    selectedModelId,
    selectedStage,
    searchQuery,
    setSearchQuery,
  } = useCarFilter();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const carModel = project.car_models;
      if (!carModel) return false;

      const brandData = carModel.car_brands;
      const brandName = brandData?.car_brand || "";

      const matchesBrand =
        !selectedBrandId || carModel.car_brand === selectedBrandId;

      const matchesModel = !selectedModelId || carModel.id === selectedModelId;

      const matchesStage =
        !selectedStage || String(project.stage?.id) === selectedStage;

      const matchesSearch =
        !searchQuery ||
        carModel.car_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.engine_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesBrand && matchesModel && matchesStage && matchesSearch;
    });
  }, [projects, selectedBrandId, selectedModelId, selectedStage, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const hasFilters = Boolean(selectedBrandId || selectedModelId || selectedStage || searchQuery);
  const visiblePage = Math.min(hasFilters ? page : initialPage, Math.max(1, totalPages));
  const start = (visiblePage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    start,
    start + ITEMS_PER_PAGE
  );
  const previousFiltersRef = React.useRef({
    selectedBrandId,
    selectedModelId,
    selectedStage,
    searchQuery,
  });

  React.useEffect(() => {
    const filtersChanged =
      previousFiltersRef.current.selectedBrandId !== selectedBrandId ||
      previousFiltersRef.current.selectedModelId !== selectedModelId ||
      previousFiltersRef.current.selectedStage !== selectedStage ||
      previousFiltersRef.current.searchQuery !== searchQuery;

    if (filtersChanged) {
      setPage(1);
      previousFiltersRef.current = {
        selectedBrandId,
        selectedModelId,
        selectedStage,
        searchQuery,
      };
    }
  }, [selectedBrandId, selectedModelId, selectedStage, searchQuery]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-start w-full md:px-4">
        <div className="mb-8 space-y-4">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              aria-label="Caută o mașină sau un motor"
              placeholder="Cauta masini, motor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-zinc-900 text-white rounded-lg border border-zinc-800 focus:border-primary focus:outline-none transition"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
            />
          </div>

          <StageSelector />

          <ActiveFilters />
        </div>
      </div>

      <CardGrids paginatedProjects={paginatedProjects} />
      <Pagination totalPages={totalPages} page={visiblePage} setPage={setPage} local={hasFilters} />

    </div>
  );
};

export default ProjectsClient;

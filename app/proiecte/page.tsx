"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";
import StageSelector from "./components/StageSelector";
import ActiveFilters from "./components/ActiveFilters";
import CardGrids from "./components/CardGrids";
import Pagination from "./components/Pagination";
import { ProjectItem, CarModelData } from "./types";
import { useCarFilter } from "./context/CarFilterContext";

const ITEMS_PER_PAGE = 6;

const Page = () => {
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    selectedBrandId,
    selectedModelId,
    selectedStage,
    searchQuery,
    setSearchQuery,
  } = useCarFilter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase.from("projects").select(
        `
          id,
          combustion,
          engine_capacity,
          engine_code,
          transmition,
          initial_power,
          initial_torque,
          new_power,
          new_torque,
          note,
          image_url,
          dyno_file_url,
          video_url,
          mods,
          stage (
            id,
            solution_name
          ) ,
          car_models (
            id,
            car_model,
            car_brand,
            car_brands (
              id,
              car_brand
            )
          )
        `
      );

      if (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        return;
      }

      interface ProjectData {
        id: number;
        combustion: string;
        engine_capacity: number | null;
        engine_code: string;
        transmition: string;
        initial_power: number | null;
        initial_torque: number | null;
        new_power: number | null;
        new_torque: number | null;
        note: string;
        image_url: string;
        dyno_file_url: string;
        video_url: string;
        mods: string[] | string | null;
        stage: number | null;
        car_models: CarModelData | CarModelData[];
      }

      const normalizedData = ((data || []) as unknown as ProjectData[]).map(
        (project) => ({
          ...project,
          car_models: Array.isArray(project.car_models)
            ? project.car_models[0]
            : project.car_models,
        })
      );

      setProjects(normalizedData as ProjectItem[]);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const carModel = project.car_models;
      if (!carModel) return false;

      const brandData = Array.isArray(carModel.car_brands)
        ? carModel.car_brands[0]
        : carModel.car_brands;
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

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    start,
    start + ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

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

      {loading ? (
        <div className="text-center py-12 text-zinc-400">
          <p>Se încarcă mașinile...</p>
        </div>
      ) : (
        <CardGrids paginatedProjects={paginatedProjects} />
      )}

      {!loading && (
        <Pagination totalPages={totalPages} page={page} setPage={setPage} />
      )}
    </div>
  );
};

export default Page;

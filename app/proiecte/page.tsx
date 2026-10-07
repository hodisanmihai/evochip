"use client";

import { allRows } from "@/lib/supabase/services/readAll";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";
import StageSelector from "./components/StageSelector";
import ActiveFilters from "./components/ActiveFilters";
import CardGrids from "./components/CardGrids";
import Pagination from "./components/Pagination";
import { normalizeProject, PROJECT_SELECT } from "@/lib/types/project";
import type { Project, ProjectResponse } from "@/lib/types/project";
import { useCarFilter } from "./context/CarFilterContext";

import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";

const ITEMS_PER_PAGE = 6;

const Page = () => {
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useProjectRefresh(refresh);

  const {
    selectedBrandId,
    selectedModelId,
    selectedStage,
    searchQuery,
    setSearchQuery,
  } = useCarFilter();

  useEffect(() => {
    const controller = new AbortController();
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
      const supabase = createClient();

      const { data, error } = await allRows((from, to) => supabase
        .from("projects")
        .select(PROJECT_SELECT)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .abortSignal(controller.signal)
        .returns<ProjectResponse[]>().range(from, to));

      if (controller.signal.aborted) return;
      if (error) throw error;
      setProjects((data ?? []).map(normalizeProject));
      } catch {
        if (!controller.signal.aborted) setError("Nu am putut încărca proiectele. Încearcă din nou.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchProjects();
    return () => controller.abort();
  }, [revision]);

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
  const visiblePage = Math.min(page, Math.max(1, totalPages));
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
      ) : error ? (
        <div role="alert" className="py-12 text-center text-zinc-300">
          <p>{error}</p>
          <button type="button" onClick={refresh} className="mt-4 rounded bg-primary px-4 py-2 text-white">Reîncearcă</button>
        </div>
      ) : (
        <CardGrids paginatedProjects={paginatedProjects} />
      )}

      {!loading && !error && (
        <Pagination totalPages={totalPages} page={visiblePage} setPage={setPage} />
      )}
    </div>
  );
};

export default Page;

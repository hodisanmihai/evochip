"use client";

import { useCallback, useEffect, useState } from "react";
import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";
import { createClient } from "@/lib/supabase/client";
import { useCarFilter } from "../context/CarFilterContext";

const ActiveFilters = () => {
  const { selectedBrandId, selectedModelId, selectedStage, searchQuery } =
    useCarFilter();

  const [brandName, setBrandName] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [stageName, setStageName] = useState<string | null>(null);

  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useProjectRefresh(refresh);

  useEffect(() => {
    if (!selectedBrandId) return;
    let cancelled = false;
    createClient()
      .from("car_brands")
      .select("car_brand")
      .eq("id", selectedBrandId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setBrandName(data?.car_brand ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId, revision]);

  useEffect(() => {
    if (!selectedModelId) return;
    let cancelled = false;
    createClient()
      .from("car_models")
      .select("car_model")
      .eq("id", selectedModelId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setModelName(data?.car_model ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedModelId, revision]);

  useEffect(() => {
    if (!selectedStage) return;
    let cancelled = false;
    createClient()
      .from("stage")
      .select("solution_name")
      .eq("id", selectedStage)
      .single()
      .then(({ data }) => {
        if (!cancelled) setStageName(data?.solution_name ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStage, revision]);

  if (!selectedBrandId && !selectedModelId && !selectedStage && !searchQuery) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
      {searchQuery && (
        <span className="bg-zinc-900 px-3 py-1 rounded-full">
          🔍 &quot;{searchQuery}&quot;
        </span>
      )}

      {selectedBrandId && brandName && (
        <span className="bg-zinc-900 px-3 py-1 rounded-full">
          Brand: {brandName}
        </span>
      )}

      {selectedModelId && modelName && (
        <span className="bg-zinc-900 px-3 py-1 rounded-full">
          Model: {modelName}
        </span>
      )}

      {selectedStage && stageName && (
        <span className="bg-zinc-900 px-3 py-1 rounded-full">{stageName}</span>
      )}
    </div>
  );
};

export default ActiveFilters;

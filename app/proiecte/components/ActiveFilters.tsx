"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCarFilter } from "../context/CarFilterContext";

const ActiveFilters = () => {
  const { selectedBrandId, selectedModelId, selectedStage, searchQuery } =
    useCarFilter();

  const [brandName, setBrandName] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [stageName, setStageName] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBrandId) return;
    let cancelled = false;
    createClient()
      .from("car_brands")
      .select("car_brand")
      .eq("id", selectedBrandId)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setBrandName(data.car_brand);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId]);

  useEffect(() => {
    if (!selectedModelId) return;
    let cancelled = false;
    createClient()
      .from("car_models")
      .select("car_model")
      .eq("id", selectedModelId)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setModelName(data.car_model);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedModelId]);

  useEffect(() => {
    if (!selectedStage) return;
    let cancelled = false;
    createClient()
      .from("stage")
      .select("solution_name")
      .eq("id", selectedStage)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setStageName(data.solution_name);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStage]);

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

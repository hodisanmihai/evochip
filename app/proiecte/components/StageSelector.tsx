"use client";

import { allRows } from "@/lib/supabase/services/readAll";

import { useCallback, useEffect, useState } from "react";
import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";

import { createClient } from "@/lib/supabase/client";
import { useCarFilter } from "../context/CarFilterContext";

import type { Stage } from "@/lib/types/project";

const StageSelector = () => {
  const { selectedStage, setSelectedStage } = useCarFilter();
  const [stages, setStages] = useState<Stage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useProjectRefresh(refresh);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStages = async () => {
      setError(null);
      const supabase = createClient();

      const { data, error: readError } = await allRows((from, to) => supabase
        .from("stage")
        .select("id, solution_name")
        .order("id", { ascending: true }).abortSignal(controller.signal).range(from, to));
      if (controller.signal.aborted) return;
      if (readError) { setError("Nu am putut încărca opțiunile."); return; }

      if (!data) return;

      setStages(data);
    };

    fetchStages();
    return () => controller.abort();
  }, [revision]);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setSelectedStage(null)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
          selectedStage === null
            ? "bg-primary text-black"
            : "bg-zinc-900 text-zinc-300 hover:text-primary"
        }`}
      >
        Toate
      </button>

      {stages.map((stage) => (
        <button
          key={stage.id}
          onClick={() => setSelectedStage(String(stage.id))}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            selectedStage === String(stage.id)
              ? "bg-primary text-black"
              : "bg-zinc-900 text-zinc-300 hover:text-primary"
          }`}
        >
          {stage.solution_name}
        </button>
      ))}
      {error && <p role="alert" className="text-xs text-red-400">{error} <button type="button" onClick={refresh} className="underline">Reîncearcă</button></p>}
    </div>
  );
};

export default StageSelector;

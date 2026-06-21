"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCarFilter } from "../context/CarFilterContext";

interface Stage {
  id: number;
  solution_name: string;
}

const StageSelector = () => {
  const { selectedStage, setSelectedStage } = useCarFilter();
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const fetchStages = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("stage")
        .select("id, solution_name")
        .order("id", { ascending: true });

      if (error || !data) return;

      setStages(data);
    };

    fetchStages();
  }, []);

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
    </div>
  );
};

export default StageSelector;

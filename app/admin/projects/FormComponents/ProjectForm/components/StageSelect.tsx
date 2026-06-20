"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "../../constants";

interface StageOption {
  id: number;
  solution_name: string;
}

const StageSelect = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (stageId: number | null) => void;
}) => {
  const [stages, setStages] = useState<StageOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("stage")
        .select("id, solution_name")
        .order("solution_name", { ascending: true });

      setStages(data || []);
      setLoading(false);
    };

    fetchStages();
  }, []);

  return (
    <div>
      <label className={labelClass}>Stage</label>
      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={loading}
        className={`${inputClass} disabled:opacity-60`}
      >
        <option value="">
          {loading ? "Se incarca..." : "Selecteaza stage..."}
        </option>
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.solution_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StageSelect;

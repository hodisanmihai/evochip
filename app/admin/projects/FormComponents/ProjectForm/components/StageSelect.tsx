"use client";

import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";
import { allRows } from "@/lib/supabase/services/readAll";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass, labelClass } from "../../constants";

import type { Stage } from "@/lib/types/project";

const StageSelect = ({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (stageId: number | null) => void;
}) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useProjectRefresh(refresh);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStages = async () => {
      setError(null);
      setLoading(true);
      const supabase = createClient();
      const { data, error: readError } = await allRows((from, to) => supabase
        .from("stage")
        .select("id, solution_name")
        .order("solution_name", { ascending: true })
        .order("id", { ascending: true }).abortSignal(controller.signal).range(from, to));
      if (controller.signal.aborted) return;
      if (readError) { setError("Nu am putut încărca opțiunile."); setLoading(false); return; }

      setStages(data || []);
      setLoading(false);
    };

    fetchStages();
    return () => controller.abort();
  }, [revision]);

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
      {error && <p role="alert" className="text-xs text-red-400">{error} <button type="button" onClick={refresh} className="underline">Reîncearcă</button></p>}
    </div>
  );
};

export default StageSelect;

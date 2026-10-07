import { createClient } from "@/lib/supabase/client";

import type { RemapItem } from "../types";

type RemapData = {
  solution_name: string;
};

export const remapsService = {
  save: async (item: RemapItem | null, data: RemapData) => {
    const name = data.solution_name.trim();
    if (!name) throw new Error("Numele este obligatoriu.");
    const supabase = createClient();

    if (item?.id) {
      const { error } = await supabase
        .from("stage")
        .update({ solution_name: name })
        .eq("id", item.id).select("id").single();

      if (error) throw error;

      return "updated";
    }

    const { error } = await supabase
      .from("stage")
      .insert([{ solution_name: name }]).select("id").single();

    if (error) throw error;

    return "inserted";
  },
};

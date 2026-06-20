import { createClient } from "@/lib/supabase/client";

type RemapItem = {
  id?: string | number;
};

type RemapData = {
  solution_name: string;
};

export const remapsService = {
  save: async (item: RemapItem | null, data: RemapData) => {
    const supabase = createClient();

    if (item?.id) {
      const { error } = await supabase
        .from("stage")
        .update({ solution_name: data.solution_name })
        .eq("id", item.id);

      if (error) throw error;

      return "updated";
    }

    const { error } = await supabase
      .from("stage")
      .insert([{ solution_name: data.solution_name }]);

    if (error) throw error;

    return "inserted";
  },
};

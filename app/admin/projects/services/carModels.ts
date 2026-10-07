import { createClient } from "@/lib/supabase/client";
import type { CarBrandItem } from "../types";

export const carModelsService = {
  save: async (item: CarBrandItem | null, data: { car_brand: string }) => {
    const name = data.car_brand.trim();
    if (!name) throw new Error("Numele este obligatoriu.");
    const supabase = createClient();

    if (item?.id) {
      const { error } = await supabase
        .from("car_brands")
        .update({ car_brand: name })
        .eq("id", item.id).select("id").single();

      if (error) throw error;
      return "updated";
    }

    const { error } = await supabase
      .from("car_brands")
      .insert([{ car_brand: name }]).select("id").single();

    if (error) throw error;
    return "inserted";
  },
};

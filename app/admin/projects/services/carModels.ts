import { createClient } from "@/lib/supabase/client";
import type { CarModelItem } from "../types";

export const carModelsService = {
  save: async (item: CarModelItem | null, data: { car_brand: string }) => {
    const supabase = createClient();

    if (item?.id) {
      const { error } = await supabase
        .from("car_brands")
        .update({ car_brand: data.car_brand })
        .eq("id", item.id);

      if (error) throw error;
      return "updated";
    }

    const { error } = await supabase
      .from("car_brands")
      .insert([{ car_brand: data.car_brand }]);

    if (error) throw error;
    return "inserted";
  },
};

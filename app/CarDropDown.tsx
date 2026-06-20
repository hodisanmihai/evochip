"use cleint";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Brand {
  id: number;
  car_brand: string;
  models: string[];
}

const CarDropDown = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch branduri
      const { data: carModels } = await supabase
        .from("car_brands")
        .select("id, car_brand")
        .order("car_brand", { ascending: true });

      // Fetch proiecte (doar brand_id si car_model)
      const { data: projects } = await supabase
        .from("projects")
        .select("brand_id, car_model");

      if (!carModels) return;

      // Grupează modelele pe brand
      const brandsWithModels: Brand[] = carModels.map((brand) => {
        const models = [
          ...new Set(
            (projects || [])
              .filter((p) => p.brand_id === brand.id && p.car_model)
              .map((p) => p.car_model)
          ),
        ];
        return { ...brand, models };
      });

      setBrands(brandsWithModels);
    };

    fetchData();
  }, []);

  return (
    <div className="mt-25">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
        Branduri
      </p>

      {brands.map((brand) => (
        <div key={brand.id}>
          <button
            onClick={() => setOpenId(openId === brand.id ? null : brand.id)}
            className="w-full flex items-center justify-between py-1.5 px-2 rounded-md text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
          >
            <span>{brand.car_brand}</span>
            <span className="text-zinc-600 text-xs">
              {openId === brand.id ? "▲" : "▼"}
            </span>
          </button>

          {openId === brand.id && (
            <ul className="ml-3 mt-1 mb-1 space-y-0.5 border-l border-zinc-800 pl-3">
              {brand.models.length > 0 ? (
                brand.models.map((model) => (
                  <li key={model}>
                    <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition block py-0.5">
                      {model}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-zinc-700 py-0.5">Niciun model</li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default CarDropDown;

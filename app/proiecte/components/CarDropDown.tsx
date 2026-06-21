"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCarFilter } from "../context/CarFilterContext";
import { useRouter, usePathname } from "next/navigation";

interface Brand {
  id: number;
  car_brand: string;
  models: Array<{ id: number; car_model: string }>;
}

const CarDropDown = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [brands, setBrands] = useState<Brand[]>([]);
  const {
    selectedBrandId,
    setSelectedBrandId,
    selectedModelId,
    setSelectedModelId,
    openBrandId,
    setOpenBrandId,
  } = useCarFilter();

  const handleBrandSelect = (brandId: number) => {
    setSelectedBrandId(brandId);
    setSelectedModelId(null);
    if (pathname !== "/proiecte") {
      router.push("/proiecte");
    }
  };

  const handleModelSelect = (brandId: number, modelId: number) => {
    setSelectedBrandId(brandId);
    setSelectedModelId(modelId);
    if (pathname !== "/proiecte") {
      router.push("/proiecte");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: carModels } = await supabase
        .from("car_models")
        .select(
          `
          id,
          car_model,
          car_brands (
            id,
            car_brand
          )
        `
        )
        .order("car_model", { ascending: true });

      if (!carModels) return;

      const groupedBrands = carModels.reduce<Brand[]>((acc, item) => {
        const brand = Array.isArray(item.car_brands)
          ? item.car_brands[0]
          : item.car_brands;

        if (!brand) return acc;

        const existingBrand = acc.find((b) => b.id === brand.id);

        if (existingBrand) {
          existingBrand.models.push({
            id: item.id,
            car_model: item.car_model,
          });
        } else {
          acc.push({
            id: brand.id,
            car_brand: brand.car_brand,
            models: [
              {
                id: item.id,
                car_model: item.car_model,
              },
            ],
          });
        }

        return acc;
      }, []);

      setBrands(groupedBrands);
    };

    fetchData();
  }, []);

  return (
    <div className="mt-20 md:mt-25">
      {/* Reset button */}
      <button
        onClick={() => {
          setSelectedBrandId(null);
          setSelectedModelId(null);
          setOpenBrandId(null);
        }}
        className={`w-[90%] text-left py-2 text-sm cursor-pointer transition ${
          selectedBrandId === null && selectedModelId === null
            ? "text-primary font-bold"
            : "text-zinc-300 hover:text-primary"
        }`}
      >
        Vezi toate mașinile
      </button>

      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">
        Branduri
      </p>

      {brands.map((brand) => (
        <div key={brand.id}>
          <button
            onClick={() =>
              setOpenBrandId(openBrandId === brand.id ? null : brand.id)
            }
            className="w-[90%] flex items-center justify-between py-1.5 px-2 rounded-md text-sm text-zinc-300 hover:text-primary hover:bg-zinc-900 transition"
          >
            <span
              className={`text-sm ${
                selectedBrandId === brand.id
                  ? "text-primary font-bold"
                  : "text-zinc-300"
              }`}
            >
              {brand.car_brand}
            </span>
            <span className="text-zinc-600 text-xs">
              {openBrandId === brand.id ? "▲" : "▼"}
            </span>
          </button>

          {/* Dropdown content - shows all models for this brand */}
          {openBrandId === brand.id && (
            <ul className="ml-2 border-l border-zinc-700">
              {/* "All models" option */}
              <li
                onClick={() => handleBrandSelect(brand.id)}
                className={`text-sm cursor-pointer py-1.5 px-2 rounded transition ${
                  selectedBrandId === brand.id && selectedModelId === null
                    ? "text-primary font-bold bg-zinc-900"
                    : "text-zinc-300 hover:text-primary hover:bg-zinc-900"
                }`}
              >
                Toate modelele {brand.car_brand}
              </li>

              {/* Individual models */}
              {brand.models.map((model) => (
                <li
                  key={model.id}
                  onClick={() => handleModelSelect(brand.id, model.id)}
                  className={`text-xs cursor-pointer py-1.5 px-2 rounded transition ${
                    selectedModelId === model.id && selectedBrandId === brand.id
                      ? "text-primary font-bold bg-zinc-900"
                      : "text-zinc-500 hover:text-primary hover:bg-zinc-900"
                  }`}
                >
                  {model.car_model}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default CarDropDown;

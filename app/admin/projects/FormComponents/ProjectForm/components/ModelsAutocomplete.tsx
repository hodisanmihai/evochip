"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface CarModel {
  id: number;
  car_model: string;
  car_brand: number;
}

interface ModelsAutocompleteProps {
  brandId: number | null;
  value: number | null;
  onChange: (modelId: number, modelName: string) => void;
}

const ModelsAutocomplete = ({
  brandId,
  value,
  onChange,
}: ModelsAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<CarModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("car_models")
        .select("id, car_model, car_brand")
        .order("car_model", { ascending: true });

      setModels(data || []);
    };

    fetchModels();
  }, []);

  // filter by brand + search
  const filtered = useMemo(() => {
    if (!brandId) return [];

    return models.filter((m) => {
      const matchesBrand = m.car_brand === brandId;
      const matchesQuery = m.car_model
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesBrand && matchesQuery;
    });
  }, [models, brandId, query]);

  const selectedLabel = useMemo(() => {
    return models.find((m) => m.id === value)?.car_model || "";
  }, [models, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (model: CarModel) => {
    onChange(model.id, model.car_model);
    setIsOpen(false);
    setQuery("");
  };

  const createModel = async (name: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("car_models")
      .insert({
        car_model: name,
        car_brand: brandId,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-xs text-zinc-400 mb-1 block">Model Mașină</label>

      {!isOpen && selectedLabel ? (
        <div
          className="w-full p-2.5 rounded-md bg-[#222] border border-zinc-700 text-white cursor-pointer flex justify-between items-center"
          onClick={() => {
            setQuery("");

            setIsOpen(true);
          }}
        >
          <span>{selectedLabel}</span>

          <span className="text-zinc-500 text-xs">schimbă</span>
        </div>
      ) : (
        <input
          disabled={!brandId}
          autoFocus={isOpen}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);

            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={!brandId ? "Selectează brand întâi" : "Caută model..."}
          className="w-full p-2.5 rounded-md bg-[#222] border border-zinc-700 text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
        />
      )}

      {isOpen && brandId && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a1a] border border-zinc-700 rounded-md shadow-xl max-h-52 overflow-y-auto">
          {" "}
          {filtered.map((model) => (
            <div
              key={model.id}
              onMouseDown={() => handleSelect(model)}
              className="px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer"
            >
              {model.car_model}
            </div>
          ))}
          {/* CREATE NEW */}
          {query.length > 0 && (
            <div
              onMouseDown={async () => {
                const newModel = await createModel(query);
                if (newModel) {
                  onChange(newModel.id, newModel.car_model);
                }
                setQuery(newModel.car_model);
                setIsOpen(false);
              }}
              className="px-3 py-2 text-sm text-green-400 hover:bg-zinc-700 cursor-pointer transition-colors flex items-center gap-2 border-t border-zinc-700"
            >
              <span className="text-lg font-bold leading-none">+</span>
              <span>Adaugă {query}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelsAutocomplete;

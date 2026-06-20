"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { CarBrand } from "../../../types";

interface BrandAutocompleteProps {
  value: number | null;
  onChange: (brandId: number, brandName: string) => void;
  onCreated?: (brand: CarBrand) => void;
}

const BrandAutocomplete = ({
  value,
  onChange,
  onCreated,
}: BrandAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("car_brands")
          .select("id, car_brand")
          .order("car_brand", { ascending: true });
        setBrands(data || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const selectedLabel = useMemo(() => {
    if (!value) return "";

    const found = brands.find((b) => b.id === value);

    return found?.car_brand || "";
  }, [value, brands]);

  const filtered = useMemo(() => {
    if (query.trim() === "") {
      return brands;
    }
    return brands.filter((b) =>
      b.car_brand.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, brands]);

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

  const handleSelect = (brand: CarBrand) => {
    onChange(brand.id, brand.car_brand);
    setQuery("");
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!query.trim()) return;
    setCreating(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("car_brands")
        .insert([{ car_brand: query.trim() }])
        .select()
        .single();

      if (!error && data) {
        setBrands((prev) =>
          [...prev, data].sort((a, b) => a.car_brand.localeCompare(b.car_brand))
        );
        handleSelect(data);
        onCreated?.(data);
      }
    } catch (error) {
      console.error("Error creating brand:", error);
    } finally {
      setCreating(false);
    }
  };

  const exactMatch = brands.some(
    (b) => b.car_brand.toLowerCase() === query.toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-xs text-zinc-400 mb-1 block">Brand Mașină</label>

      {/* Display selected value */}
      {selectedLabel && !isOpen && (
        <div
          className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-700 text-white cursor-pointer flex justify-between items-center hover:border-zinc-600 transition-colors"
          onClick={() => {
            setQuery("");
            setIsOpen(true);
          }}
        >
          <span>{selectedLabel}</span>
          <span className="text-zinc-500 text-xs">schimbă</span>
        </div>
      )}

      {/* Search input */}
      {(!selectedLabel || isOpen) && (
        <input
          autoFocus={isOpen}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Caută brand... (ex: BMW, Audi)"
          className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a1a] border border-zinc-700 rounded-md shadow-xl max-h-52 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-zinc-500 text-sm">
              Se încarcă branduri...
            </div>
          )}

          {!loading && filtered.length === 0 && !query && (
            <div className="px-3 py-2 text-zinc-500 text-sm">
              Niciun brand găsit.
            </div>
          )}

          {!loading && filtered.length === 0 && query && (
            <div className="px-3 py-2 text-zinc-500 text-sm">
              Niciun brand nu se potrivește cu {query}
            </div>
          )}

          {!loading &&
            filtered.map((brand) => (
              <div
                key={brand.id}
                onMouseDown={() => handleSelect(brand)}
                className="px-3 py-2 text-sm text-white hover:bg-zinc-700 cursor-pointer transition-colors"
              >
                {brand.car_brand}
              </div>
            ))}

          {/* Create new option */}
          {!loading && query.trim() && !exactMatch && (
            <div
              onMouseDown={handleCreate}
              className="px-3 py-2 text-sm text-green-400 hover:bg-zinc-700 cursor-pointer transition-colors flex items-center gap-2 border-t border-zinc-700"
            >
              <span className="text-lg font-bold leading-none">+</span>
              <span>
                {creating ? "Se creează..." : `Creează "${query.trim()}"`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandAutocomplete;

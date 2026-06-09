"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  EntityType,
  ProjectItem,
  CarModelItem,
  RemapItem,
  AnyItem,
} from "./types";

interface ListProps {
  type: EntityType;
  selectedItem: AnyItem | null;
  onSelectItem: (item: AnyItem | null) => void;
  refreshKey?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ITEMS_PER_PAGE: Record<EntityType, number> = {
  projects: 6,
  car_models: 12,
  remaps: Infinity,
};

const List = ({
  type,
  selectedItem,
  onSelectItem,
  refreshKey,
  searchQuery = "",
  onSearchChange,
  currentPage,
  onPageChange,
}: ListProps) => {
  const [items, setItems] = useState<AnyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        if (type === "car_models") {
          const { data, error: supabaseError } = await supabase
            .from("car_models")
            .select("*")
            .order("car_brand", { ascending: true });

          if (supabaseError) throw supabaseError;
          setItems(data || []);
        } else if (type === "remaps") {
          const { data, error: supabaseError } = await supabase
            .from("stage")
            .select("*")
            .order("solution_name", { ascending: true });

          if (supabaseError) throw supabaseError;
          setItems(data || []);
        } else {
          const { data, error: supabaseError } = await supabase
            .from("projects")
            .select("*, car_models(id, car_brand)")
            .order("id", { ascending: false });

          if (supabaseError) throw supabaseError;
          setItems(data || []);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("A apărut o eroare necunoscută.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey, type]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query || type === "remaps") return items;

    if (type === "car_models") {
      return (items as CarModelItem[]).filter((item) =>
        item.car_brand.toLowerCase().includes(query),
      );
    }

    return (items as ProjectItem[]).filter((item) => {
      const mods = Array.isArray(item.mods)
        ? item.mods.join(" ")
        : item.mods || "";
      const searchableText = [
        item.car_models?.car_brand,
        item.car_model,
        item.combustion,
        item.engine_capacity,
        item.engine_code,
        item.transmition,
        item.initial_power,
        item.initial_torque,
        item.new_power,
        item.new_torque,
        item.note,
        mods,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, searchQuery, type]);

  const pageSize = ITEMS_PER_PAGE[type];
  const totalPages =
    pageSize === Infinity ? 1 : Math.ceil(filteredItems.length / pageSize);

  const paginatedItems = useMemo(() => {
    if (pageSize === Infinity) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const showSearch = type === "projects" || type === "car_models";
  const searchPlaceholder =
    type === "projects"
      ? "Cauta proiect dupa brand, model, motor..."
      : "Cauta brand...";
  const emptySearchMessage =
    type === "projects"
      ? "Nu exista proiecte pentru cautarea asta."
      : "Nu exista branduri pentru cautarea asta.";

  const SearchBar = showSearch ? (
    <div className="w-full px-4 pt-4">
      <input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        type="search"
        placeholder={searchPlaceholder}
        className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500 placeholder-zinc-600"
      />
    </div>
  ) : null;

  const Pagination =
    totalPages > 1 ? (
      <div className="flex items-center justify-center gap-1 px-4 pb-4 pt-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isVisible =
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1;
          const isEllipsisBefore =
            page === currentPage - 2 && currentPage - 2 > 1;
          const isEllipsisAfter =
            page === currentPage + 2 && currentPage + 2 < totalPages;

          if (isEllipsisBefore || isEllipsisAfter) {
            return (
              <span key={page} className="text-zinc-600 px-1 text-sm">
                …
              </span>
            );
          }

          if (!isVisible) return null;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-8 px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                page === currentPage
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          →
        </button>
      </div>
    ) : null;

  if (loading)
    return <div className="text-white p-4">Se încarcă datele...</div>;
  if (error) return <div className="text-red-500 p-4">Eroare: {error}</div>;
  if (items.length === 0)
    return (
      <div className="text-zinc-400 p-4">
        {type === "car_models"
          ? "Nu există branduri salvate."
          : type === "remaps"
            ? "Nu exista solutii salvate."
            : "Nu există proiecte salvate."}
      </div>
    );

  // --- Car Models List ---
  if (type === "car_models") {
    return (
      <div className="w-full flex flex-col">
        {SearchBar}
        {filteredItems.length === 0 ? (
          <div className="text-zinc-400 p-4">{emptySearchMessage}</div>
        ) : (
          <>
            <div className="w-full p-4 flex flex-col gap-2">
              {(paginatedItems as CarModelItem[]).map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(isSelected ? null : item)}
                    className={`bg-[#111111] px-4 py-3 rounded-lg flex items-center justify-between shadow cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? "border-red-500 shadow-red-500/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-white font-medium">
                      {item.car_brand}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-red-400 font-semibold">
                        Selectat
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {Pagination}
          </>
        )}
      </div>
    );
  }

  // --- Remaps List ---
  if (type === "remaps") {
    return (
      <div className="w-full p-4 flex flex-col gap-2">
        {(items as RemapItem[]).map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(isSelected ? null : item)}
              className={`bg-[#111111] px-4 py-3 rounded-lg flex items-center justify-between shadow cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? "border-red-500 shadow-red-500/10"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <span className="text-white font-medium">
                {item.solution_name}
              </span>
              {isSelected && (
                <span className="text-xs text-red-400 font-semibold">
                  Selectat
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // --- Projects List ---
  return (
    <div className="w-full flex flex-col">
      {SearchBar}
      {filteredItems.length === 0 ? (
        <div className="text-zinc-400 p-4">{emptySearchMessage}</div>
      ) : (
        <>
          <div className="w-full p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(paginatedItems as ProjectItem[]).map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const brandName =
                  item.car_models?.car_brand ?? "Brand necunoscut";

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(isSelected ? null : item)}
                    className={`bg-[#111111] p-5 rounded-xl flex flex-col gap-3 shadow-md cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? "border-red-500 scale-[1.01] shadow-red-500/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {brandName} {item.car_model || ""}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {item.combustion || "—"} ·{" "}
                          {item.engine_capacity
                            ? `${item.engine_capacity}cc`
                            : "—"}{" "}
                          · {item.engine_code || "—"}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-xs text-red-400 font-semibold">
                          Selectat
                        </span>
                      )}
                    </div>

                    {/* Transmisie */}
                    {item.transmition && (
                      <div className="text-xs text-zinc-400">
                        <span className="text-zinc-600 font-semibold uppercase tracking-wider">
                          Transmisie:{" "}
                        </span>
                        {item.transmition}
                      </div>
                    )}

                    {/* Power / Torque */}
                    <div className="mt-1 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-900 rounded-md p-2 text-center">
                        <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                          Putere Inițială
                        </p>
                        <p className="text-white font-bold text-sm">
                          {item.initial_power
                            ? `${item.initial_power} CP`
                            : "—"}
                        </p>
                      </div>
                      <div className="bg-zinc-900 rounded-md p-2 text-center">
                        <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                          Putere Nouă
                        </p>
                        <p className="text-green-400 font-bold text-sm">
                          {item.new_power ? `${item.new_power} CP` : "—"}
                        </p>
                      </div>
                      <div className="bg-zinc-900 rounded-md p-2 text-center">
                        <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                          Cuplu Inițial
                        </p>
                        <p className="text-white font-bold text-sm">
                          {item.initial_torque
                            ? `${item.initial_torque} Nm`
                            : "—"}
                        </p>
                      </div>
                      <div className="bg-zinc-900 rounded-md p-2 text-center">
                        <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                          Cuplu Nou
                        </p>
                        <p className="text-green-400 font-bold text-sm">
                          {item.new_torque ? `${item.new_torque} Nm` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {Pagination}
        </>
      )}
    </div>
  );
};

export default List;

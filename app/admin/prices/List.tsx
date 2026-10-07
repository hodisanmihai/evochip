"use client";

import { allRows } from "@/lib/supabase/services/readAll";

import SafeRichText from "@/app/components/SafeRichText";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PriceItem } from "./page";

interface ListProps {
  selectedItem: PriceItem | null;
  onSelectItem: (item: PriceItem | null) => void;
  refreshKey?: number;
}

const List = ({ selectedItem, onSelectItem, refreshKey }: ListProps) => {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await allRows((from, to) => supabase
          .from("prices")
          .select("*")
          .order("id", { ascending: true }).abortSignal(controller.signal).range(from, to));

        if (controller.signal.aborted) return;
        if (supabaseError) {
          setError(supabaseError.message ?? "Nu am putut încărca datele.");
        } else {
          if (controller.signal.aborted) return;
          setItems(data || []);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("A apărut o eroare necunoscută.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchPrices();
    return () => controller.abort();
  }, [refreshKey]);

  if (loading)
    return <div className="text-white p-4">Se încarcă datele...</div>;
  if (error) return <div className="text-red-500 p-4">Eroare: {error}</div>;
  if (items.length === 0)
    return <div className="text-zinc-400 p-4">Nu există prețuri salvate.</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(isSelected ? null : item)}
              className={`bg-[#111111] p-5 rounded-xl flex flex-col gap-2 shadow-md relative cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? "border-primary scale-[1.02] shadow-primary/10"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <span className="text-primary font-semibold bg-red-500/5 px-2.5 py-1 rounded-md text-sm">
                  {item.price} RON
                </span>
              </div>

              <p className="text-zinc-400 text-sm mt-1">{item.description}</p>

              <div className="mt-3 pt-3 border-t border-zinc-900 flex flex-col gap-1 text-xs text-zinc-500">
                {(
                  ["text_1", "text_2", "text_3", "text_4", "text_5"] as const
                ).map((key) => {
                  const textValue = item[key];

                  if (!textValue) return null;

                  return (
                    <div key={key} className="flex gap-1">
                      <span>•</span>
                      <SafeRichText text={textValue} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;

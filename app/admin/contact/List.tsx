"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Interfața actualizată pentru obiectul de Contact
export interface ContactItem {
  id: string | number;
  telefon: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  created_at?: string;
}

interface ListProps {
  selectedItem: ContactItem | null;
  onSelectItem: (item: ContactItem | null) => void;
  refreshKey?: number;
}

const List = ({ selectedItem, onSelectItem, refreshKey }: ListProps) => {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("contact")
          .select("*")
          .order("id", { ascending: true });

        if (supabaseError) {
          setError(supabaseError.message);
        } else {
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

    fetchContactData();
  }, [refreshKey]);

  // Funcție ajutătoare pentru generarea link-ului de Messenger din cel de Facebook
  const getMessengerLink = (facebookUrl: string) => {
    if (!facebookUrl) return "";
    return facebookUrl
      .replace("://facebook.com", "m.me")
      .replace("facebook.com", "m.me")
      .replace("://facebook.com", "m.me");
  };

  if (loading)
    return <div className="text-white p-4">Se încarcă datele...</div>;
  if (error) return <div className="text-red-500 p-4">Eroare: {error}</div>;
  if (items.length === 0)
    return (
      <div className="text-zinc-400 p-4">
        Nu există date de contact salvate.
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const messengerLink = getMessengerLink(item.facebook_url);

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(isSelected ? null : item)}
              className={`bg-[#111111] p-5 rounded-xl flex flex-col gap-3 shadow-md relative cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? "border-red-500 scale-[1.02] shadow-red-500/10"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-white">
                  Configurație Contact
                </h3>
              </div>

              {/* Informații principale de Contact */}
              <div className="flex flex-col gap-1.5 text-sm mt-1">
                <div className="text-zinc-300">
                  <span className="text-zinc-500 font-medium">Telefon:</span>{" "}
                  {item.telefon || "-"}
                </div>
                <div className="text-zinc-300">
                  <span className="text-zinc-500 font-medium">Email:</span>{" "}
                  {item.email || "-"}
                </div>
              </div>

              {/* URL-urile Rețelelor Sociale */}
              <div className="mt-2 pt-3 border-t border-zinc-900 flex flex-col gap-2 text-xs">
                <div className="text-zinc-400 truncate">
                  <span className="text-zinc-600 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Facebook:
                  </span>
                  <span className="text-blue-400">
                    {item.facebook_url || "Nesetat"}
                  </span>
                </div>

                {messengerLink && (
                  <div className="text-zinc-400 truncate">
                    <span className="text-zinc-600 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                      Messenger (Generat):
                    </span>
                    <span className="text-cyan-400">{messengerLink}</span>
                  </div>
                )}

                <div className="text-zinc-400 truncate">
                  <span className="text-zinc-600 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Instagram:
                  </span>
                  <span className="text-pink-400">
                    {item.instagram_url || "Nesetat"}
                  </span>
                </div>

                <div className="text-zinc-400 truncate">
                  <span className="text-zinc-600 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    TikTok:
                  </span>
                  <span className="text-purple-400">
                    {item.tiktok_url || "Nesetat"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;

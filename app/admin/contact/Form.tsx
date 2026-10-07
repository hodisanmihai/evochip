"use client";

import { phoneDigits, safeWebUrl } from "@/lib/data/validation";

import { notifyProjectsChanged } from "@/lib/projects/useProjectRefresh";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotification } from "../context/NotificationContext";

type FormItem = Partial<FormFields> & {
  id?: string | number;
};

interface FormProps {
  onClose: () => void;
  item?: FormItem | null;
  onSaved?: () => void;
}

interface FormFields {
  telefon: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
}

const getInitialState = (item?: FormItem | null): FormFields => ({
    telefon: item?.telefon ?? "",
    email: item?.email ?? "",
    facebook_url: item?.facebook_url ?? "",
    instagram_url: item?.instagram_url ?? "",
    tiktok_url: item?.tiktok_url ?? "",
});

const Form = ({ onClose, item, onSaved }: FormProps) => {
  const [formData, setFormData] = useState<FormFields>(() => getInitialState(item));

  const { show } = useNotification();
  const [saving, setSaving] = useState(false);

  // Verifică dacă datele din inputuri sunt identice cu cele din baza de date
  const initialItemState = getInitialState(item);
  const isUnchanged =
    formData.telefon === initialItemState.telefon &&
    formData.email === initialItemState.email &&
    formData.facebook_url === initialItemState.facebook_url &&
    formData.instagram_url === initialItemState.instagram_url &&
    formData.tiktok_url === initialItemState.tiktok_url;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveContact = async (formData: FormFields) => {
    if (saving) return;
    formData = { ...formData, telefon: phoneDigits(formData.telefon), email: formData.email.trim() };
    if (!/^[0-9]{8,15}$/.test(formData.telefon) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { show("Introdu un telefon și un email valide.", "error"); return; }
    for (const key of ["facebook_url", "instagram_url", "tiktok_url"] as const) {
      if (formData[key] && !safeWebUrl(formData[key])) { show("Linkurile trebuie să folosească http sau https.", "error"); return; }
    }
    setSaving(true);
    const supabase = createClient();
    try {
      if (item?.id) {
        // Actualizare (UPDATE)
        const { error } = await supabase
          .from("contact")
          .update({
            telefon: formData.telefon,
            email: formData.email,
            facebook_url: formData.facebook_url,
            instagram_url: formData.instagram_url,
            tiktok_url: formData.tiktok_url,
          })
          .eq("id", item.id).select("id").single();

        if (error) throw error;
        show("Link-urile de contact au fost actualizate", "success");
      } else {
        // Adăugare (INSERT)
        const { error } = await supabase.from("contact").insert([
          {
            telefon: formData.telefon,
            email: formData.email,
            facebook_url: formData.facebook_url,
            instagram_url: formData.instagram_url,
            tiktok_url: formData.tiktok_url,
          },
        ]).select("id").single();

        if (error) throw error;
        show("Link-urile de contact au fost salvate", "success");
      }

      notifyProjectsChanged();
      onSaved?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      show("Eroare la salvare: " + msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ">
      <div className="w-full max-w-md bg-[#111111] border border-zinc-800 p-6 rounded-xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">
          {item?.id ? "Editează Link-uri Sociale" : "Adaugă Link-uri Sociale"}
        </h2>

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveContact(formData);
          }}
        >
          <fieldset disabled={saving} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Număr Telefon
              </label>
              <input
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                type="text"
                placeholder="ex: +40740344530"
                className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Adresă Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="ex: contact@evochip.ro"
                className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Link Facebook
              </label>
              <input
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                type="url"
                placeholder="https://facebook.com..."
                className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Link Instagram
              </label>
              <input
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                type="url"
                placeholder="https://instagram.com..."
                className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Link TikTok
              </label>
              <input
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                type="url"
                placeholder="https://tiktok.com@..."
                className="w-full p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={saving || isUnchanged}
            className="bg-green-600 md:bg-transparent md:hover:bg-green-600 text-white font-bold py-2 rounded-md transition disabled:opacity-50 mt-2"
          >
            {saving ? "Se salvează..." : "Salvează"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="bg-red-600 md:bg-transparent md:hover:bg-red-600 text-white font-bold py-2 rounded-md transition"
          >
            Renunță
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;

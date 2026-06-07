"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotification } from "../context/NotificationContext";

type FormItem = Omit<Partial<FormFields>, "price"> & {
  price?: string | number;
  id?: string | number;
};

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<FormFields>;
  item?: FormItem | null;
  onSaved?: () => void;
}

interface FormFields {
  title: string;
  price: string;
  description: string;
  text_1: string;
  text_2: string;
  text_3: string;
  text_4: string;
  text_5: string;
}

const initialFormState: FormFields = {
  title: "",
  price: "",
  description: "",
  text_1: "",
  text_2: "",
  text_3: "",
  text_4: "",
  text_5: "",
};

const Form = ({ isOpen, onClose, initialData, item, onSaved }: FormProps) => {
  const [formData, setFormData] = useState<FormFields>(initialFormState);

  const { show } = useNotification();
  const [saving, setSaving] = useState(false);

  const initialItemState = {
    title: item?.title ?? "",
    price: item?.price?.toString() ?? "",
    description: item?.description ?? "",
    text_1: item?.text_1 ?? "",
    text_2: item?.text_2 ?? "",
    text_3: item?.text_3 ?? "",
    text_4: item?.text_4 ?? "",
    text_5: item?.text_5 ?? "",
  };

  const isUnchanged =
    formData.title === initialItemState.title &&
    formData.price === initialItemState.price &&
    formData.description === initialItemState.description &&
    formData.text_1 === initialItemState.text_1 &&
    formData.text_2 === initialItemState.text_2 &&
    formData.text_3 === initialItemState.text_3 &&
    formData.text_4 === initialItemState.text_4 &&
    formData.text_5 === initialItemState.text_5;

  useEffect(() => {
    const data = initialData ?? item;
    if (data) {
      setTimeout(() => {
        setFormData({
          title: data.title || "",
          price: data.price?.toString() || "",
          description: data.description || "",
          text_1: data.text_1 || "",
          text_2: data.text_2 || "",
          text_3: data.text_3 || "",
          text_4: data.text_4 || "",
          text_5: data.text_5 || "",
        });
      }, 0);
    } else {
      setTimeout(() => setFormData(initialFormState), 0);
    }
  }, [initialData, isOpen, item]);

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

  const textKeys: (keyof FormFields)[] = [
    "text_1",
    "text_2",
    "text_3",
    "text_4",
    "text_5",
  ];

  const handleSaveProduct = async (formData: FormFields) => {
    setSaving(true);
    const supabase = createClient();
    try {
      if (item?.id) {
        const { error } = await supabase
          .from("prices")
          .update({
            title: formData.title,
            price: formData.price,
            description: formData.description,
            text_1: formData.text_1,
            text_2: formData.text_2,
            text_3: formData.text_3,
            text_4: formData.text_4,
            text_5: formData.text_5,
          })
          .eq("id", item.id);

        if (error) throw error;
        show("Prețul a fost actualizat cu succes", "success");
      } else {
        const { error } = await supabase.from("prices").insert([
          {
            title: formData.title,
            price: formData.price,
            description: formData.description,
            text_1: formData.text_1,
            text_2: formData.text_2,
            text_3: formData.text_3,
            text_4: formData.text_4,
            text_5: formData.text_5,
          },
        ]);

        if (error) throw error;
        show("Preț salvat cu succes", "success");
      }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center  bg-black/60 backdrop-blur-sm p-4 ">
      <div className="w-full max-w-md bg-[#111111] border border-zinc-800 p-6 rounded-xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">
          {item?.id ? "Editează Preț" : "Adaugă Preț"}
        </h2>

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveProduct(formData);
          }}
        >
          <div className="w-full flex flex-col gap-4">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text"
              placeholder="Titlu (ex:STAGE 1)"
              className="p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
            />
            <input
              name="price"
              value={formData.price}
              onChange={handleChange}
              type="text"
              placeholder="Pret "
              className="p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descriere"
              className="p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
            />
            {textKeys.map((key, idx) => (
              <input
                key={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                type="text"
                placeholder={`Text ${idx + 1} `}
                className="p-2.5 rounded-md bg-[#222222] border border-zinc-800 text-white focus:outline-none focus:border-red-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={saving || isUnchanged}
            className="bg-green-600 md:bg-transparent md:hover:bg-green-600 text-white font-bold py-2 rounded-md transition disabled:opacity-50"
          >
            {saving ? "Se salvează..." : "Salvează"}
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 md:bg-transparent md:hover:bg-red-600 text-white font-bold py-2 rounded-md transition"
          >
            Renunta
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;

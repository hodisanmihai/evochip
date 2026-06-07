"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Form from "./Form";
import { PriceItem } from "./page";
import { useNotification } from "../context/NotificationContext";

interface CrudProps {
  selectedItem: PriceItem | null;
  setSelectedItem: (item: PriceItem | null) => void;
  onRefresh: () => void;
}

const Crud = ({ selectedItem, setSelectedItem, onRefresh }: CrudProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { show } = useNotification();

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedItem) {
      setIsFormOpen(true);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    const confirmed = window.confirm(
      "Sigur vrei să ștergi acest preț? Acțiunea nu poate fi anulată.",
    );
    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("prices")
        .delete()
        .eq("id", selectedItem.id);

      if (error) throw error;

      setSelectedItem(null);
      onRefresh();
      show("Prețul a fost șters cu succes.", "success");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : String(err);
      show("Eroare la ștergere: " + message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-4 mb-4 bg-[#111111] w-full items-center justify-center p-4 rounded-md">
      <button
        className="bg-primary px-4 py-2 hover:bg-black duration-75 transition-all rounded-md text-white font-medium"
        onClick={handleOpenCreate}
      >
        Creeaza
      </button>

      <button
        disabled={!selectedItem}
        className={`px-4 py-2 duration-75 transition-all rounded-md font-medium text-white ${
          selectedItem
            ? "bg-primary hover:bg-black cursor-pointer"
            : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
        }`}
        onClick={handleOpenEdit}
      >
        Editeaza
      </button>

      <button
        disabled={!selectedItem || deleting}
        className={`px-4 py-2 duration-75 transition-all rounded-md font-medium text-white ${
          selectedItem
            ? "bg-primary hover:bg-black cursor-pointer"
            : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
        }`}
        onClick={handleDeleteItem}
      >
        {deleting ? "Se șterge..." : "Sterge"}
      </button>

      <Form
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        item={selectedItem}
        onSaved={() => {
          onRefresh();
          setIsFormOpen(false);
        }}
      />
    </div>
  );
};

export default Crud;

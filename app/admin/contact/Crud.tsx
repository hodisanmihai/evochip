"use client";

import { useState } from "react";
import Form from "./Form";
import { ContactItem } from "./List";

interface CrudProps {
  selectedItem: ContactItem | null;
  onRefresh: () => void;
  canCreate: boolean;
}

const Crud = ({ selectedItem, onRefresh, canCreate }: CrudProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenEdit = () => {
    if (selectedItem) {
      setIsFormOpen(true);
    }
  };

  return (
    <div className="flex gap-4 mb-4 bg-[#111111] w-full items-center justify-center p-4 rounded-md">
      {canCreate && <button type="button" onClick={() => setIsFormOpen(true)} className="bg-primary px-4 py-2 rounded-md">Adaugă contact</button>}
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

      {isFormOpen && (
        <Form
        key={selectedItem?.id ?? "new"}
        onClose={() => setIsFormOpen(false)}
        item={selectedItem}
        onSaved={() => {
          onRefresh();
          setIsFormOpen(false);
        }}
        />
      )}
    </div>
  );
};

export default Crud;

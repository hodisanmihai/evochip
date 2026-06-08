"use client";

import React, { useState } from "react";
import Form from "./Form";
import { ContactItem } from "./List";

interface CrudProps {
  selectedItem: ContactItem | null;
  onRefresh: () => void;
}

const Crud = ({ selectedItem, onRefresh }: CrudProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenEdit = () => {
    if (selectedItem) {
      setIsFormOpen(true);
    }
  };

  return (
    <div className="flex gap-4 mb-4 bg-[#111111] w-full items-center justify-center p-4 rounded-md">
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

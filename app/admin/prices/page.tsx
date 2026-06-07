"use client";

import React, { useState } from "react";
import Crud from "./Crud";
import List from "./List";

export interface PriceItem {
  id: string | number;
  title: string;
  price: string | number;
  description: string;
  text_1?: string;
  text_2?: string;
  text_3?: string;
  text_4?: string;
  text_5?: string;
}

const Page = () => {
  const [selectedItem, setSelectedItem] = useState<PriceItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshList = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Prețuri</h1>

      <div className=" p-4 rounded-md flex items-center justify-center flex-col">
        {/* CRUD */}
        <Crud
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          onRefresh={refreshList}
        />
        {/* Item List */}
        <div className="bg-[#111111] p-4 rounded-md md:w-[80%] max-h-160 overflow-y-auto ">
          <List
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;

"use client";

import React, { useState } from "react";
import Crud from "./Crud";
import List, { ContactItem } from "./List";

const Page = () => {
  const [selectedItem, setSelectedItem] = useState<ContactItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshList = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>

      <div className=" p-4 rounded-md flex items-center justify-center flex-col">
        {/* CRUD */}
        <Crud
          selectedItem={selectedItem}
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

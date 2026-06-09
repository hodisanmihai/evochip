"use client";

import React, { useState } from "react";
import Crud from "./Crud";
import List from "./List";
import { EntityType, AnyItem } from "./types";

const Page = () => {
  const [activeTab, setActiveTab] = useState<EntityType>("projects");
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (tab: EntityType) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setRefreshKey((prev) => prev + 1);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const refreshList = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="w-full p-6">
      <div className="flex gap-4 mb-6 border-b border-gray-700 pb-3">
        <button
          onClick={() => handleTabChange("projects")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "projects"
              ? "bg-primary text-white"
              : "bg-zinc-800 text-gray-400"
          }`}
        >
          Proiecte
        </button>
        <button
          onClick={() => handleTabChange("car_models")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "car_models"
              ? "bg-primary text-white"
              : "bg-zinc-800 text-gray-400"
          }`}
        >
          Branduri
        </button>
        <button
          onClick={() => handleTabChange("remaps")}
          className={`px-4 py-2 rounded-md transition ${
            activeTab === "remaps"
              ? "bg-primary text-white"
              : "bg-zinc-800 text-gray-400"
          }`}
        >
          Solutii
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4 capitalize">
        {activeTab === "projects"
          ? "Gestionare Proiecte"
          : activeTab === "car_models"
            ? "Gestionare Branduri"
            : "Gestionare Solutii"}
      </h1>

      <div className="p-4 rounded-md flex items-center justify-center flex-col gap-6">
        <Crud
          type={activeTab}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          onRefresh={refreshList}
        />

        <div className="bg-[#111111] p-4 rounded-md md:w-[80%] max-h-160 overflow-y-auto w-full">
          <List
            type={activeTab}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            refreshKey={refreshKey}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CarFilterContextType {
  // Brand filtering
  selectedBrandId: number | null;
  setSelectedBrandId: (id: number | null) => void;

  // Model filtering
  selectedModelId: number | null;
  setSelectedModelId: (id: number | null) => void;

  // Stage filtering
  selectedStage: string | null;
  setSelectedStage: (stage: string | null) => void;

  // UI state for dropdown
  openBrandId: number | null;
  setOpenBrandId: (id: number | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CarFilterContext = createContext<CarFilterContextType | undefined>(
  undefined
);

export const CarFilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [openBrandId, setOpenBrandId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <CarFilterContext.Provider
      value={{
        selectedBrandId,
        setSelectedBrandId,
        selectedModelId,
        setSelectedModelId,
        selectedStage,
        setSelectedStage,
        openBrandId,
        setOpenBrandId,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </CarFilterContext.Provider>
  );
};

export const useCarFilter = () => {
  const context = useContext(CarFilterContext);
  if (!context) {
    throw new Error("useCarFilter must be used within CarFilterProvider");
  }
  return context;
};

"use client";

import React from "react";

interface PaginationProps {
  totalPages: number;

  page: number;

  setPage: (page: number) => void;
}

const Pagination = ({ totalPages, page, setPage }: PaginationProps) => {
  return (
    <div>
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded transition ${
                page === i + 1
                  ? "bg-primary text-black font-semibold"
                  : "bg-zinc-900 text-zinc-300 hover:text-primary"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pagination;

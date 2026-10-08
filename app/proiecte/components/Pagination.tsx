"use client";

import Link from "next/link";
import { listingPath } from "@/lib/projects/seo";

interface PaginationProps {
  local?: boolean;
  totalPages: number;

  page: number;

  setPage: (page: number) => void;
}

const Pagination = ({ totalPages, page, setPage, local = false }: PaginationProps) => {
  return (
    <div>
      {totalPages > 1 && (
        <nav aria-label="Paginare proiecte" className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={listingPath(i + 1)}
              aria-current={page === i + 1 ? "page" : undefined}
              onClick={(event) => { if (local) { event.preventDefault(); setPage(i + 1); } }}
              className={`px-3 py-1 rounded transition ${
                page === i + 1
                  ? "bg-primary text-black font-semibold"
                  : "bg-zinc-900 text-zinc-300 hover:text-primary"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Pagination;

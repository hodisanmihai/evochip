"use client";

import { ReactNode } from "react";
import Link from "next/link";
import NavBar from "../components/NavBar";
import CarDropDown from "../CarDropDown";

export default function ProiecteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-black text-white flex flex-col md:flex-row overflow-hidden">
      <NavBar />
      <aside
        className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-primary/10 p-6 space-y-4 transform 
            transition-transform duration-300 ease-in-out overflow-y-auto
            md:relative md:transform-none md:flex md:flex-col md:h-full md:shrink-0
          
          `}
      >
        <CarDropDown />
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto ">{children}</main>
    </div>
  );
}

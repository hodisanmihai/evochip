"use client";

import { ReactNode, useState } from "react";
import NavBar from "../components/NavBar";
import CarDropDown from "./components/CarDropDown";
import Footer from "../components/Footer";
import { CarFilterProvider } from "./context/CarFilterContext";

export default function ProiecteLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <CarFilterProvider>
      <div className="min-h-full overscroll-x-none overflow-x-hidden">
        <div className="min-block-h-screen  text-white flex flex-col md:flex-row  ">
          <NavBar />

          <aside
            className={`
           bg-[#0a0a0a] md:bg-black md:border-r md:border-primary/10
            fixed top-0 left-0 z-10 min-h-screen w-64  
            p-6 space-y-4 overflow-y-auto
            overflow-x-hidden
            atransform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "translate-x-[-85%]"}
            md:relative md:translate-x-0 md:flex md:flex-col md:h-full
            clip-mobile 
          `}
          >
            <CarDropDown />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden fixed w-auto h-auto top-1/2 -right-9 z-20   flex items-center justify-center transition-colors"
            >
              <span className="text-primary font-bold text-xl whitespace-nowrap transform -rotate-90 origin-center">
                CATEGORII
              </span>
            </button>
          </aside>

          <main className="flex flex-col flex-1 mt-25  p-4 md:p-8  overflow-y-auto">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </CarFilterProvider>
  );
}

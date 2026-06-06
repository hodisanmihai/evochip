"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/admin/", label: "Dashboard" },
  { href: "/admin/prices", label: "Prețuri" },
  { href: "/admin/projects", label: "Proiecte" },
  { href: "/admin/contact", label: "Contact" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-black text-white flex flex-col md:flex-row overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 md:hidden bg-black z-50 shrink-0">
        <h1 className="text-xl font-bold text-red-500">Admin</h1>
        <button
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-zinc-800 p-6 space-y-4 transform 
          transition-transform duration-300 ease-in-out overflow-y-auto
          md:relative md:transform-none md:flex md:flex-col md:h-full md:shrink-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h1 className="text-xl font-bold text-red-500 hidden md:block">
          Admin
        </h1>

        <nav className="flex flex-col gap-3 text-sm pt-12 md:pt-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-red-400 p-2 md:p-0 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto ">{children}</main>
    </div>
  );
}

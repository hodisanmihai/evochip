import { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-black text-white">
      <aside className="w-64 border-r border-zinc-800 p-6 space-y-4">
        <h1 className="text-xl font-bold text-red-500">Admin</h1>

        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/admin" className="hover:text-red-400">
            Dashboard
          </Link>
          <Link href="/admin/projects" className="hover:text-red-400">
            Projects
          </Link>
          <Link href="/admin/services" className="hover:text-red-400">
            Services
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

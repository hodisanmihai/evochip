import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/projects"
          className="p-6 border border-zinc-800 rounded-xl hover:border-red-500 transition"
        >
          Manage Projects
        </Link>

        <Link
          href="/admin/services"
          className="p-6 border border-zinc-800 rounded-xl hover:border-red-500 transition"
        >
          Manage Services
        </Link>
      </div>
    </div>
  );
}

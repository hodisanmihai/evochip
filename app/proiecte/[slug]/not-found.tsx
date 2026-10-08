import Link from "next/link";
export default function NotFound() {
  return <div className="p-8 text-zinc-300">
    <h1 className="text-2xl font-bold">Proiectul nu a fost găsit</h1>
    <Link href="/proiecte" className="mt-4 inline-block text-white underline">Vezi proiectele disponibile</Link>
  </div>;
}

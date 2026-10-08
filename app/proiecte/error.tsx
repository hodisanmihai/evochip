"use client";
export default function Error({ reset }: { reset: () => void }) {
  return <div role="alert" className="p-8 text-zinc-300">
    <p>Nu am putut încărca proiectele. Încearcă din nou.</p>
    <button type="button" onClick={reset} className="mt-4 rounded bg-primary px-4 py-2 text-white">Reîncearcă</button>
  </div>;
}

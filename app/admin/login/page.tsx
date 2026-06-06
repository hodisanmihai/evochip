"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-md p-6">
        {error ? (
          <div className="w-full flex flex-col justify-center items-center mb-6 rounded bg-red-500 p-6 text-white">
            <div>{error}</div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(false);
              }}
              className=" text-xl leading-none text-white hover:text-gray-200 focus:outline-none bg-[#111111] px-4 py-2 rounded-md mt-4 transition hover:bg-[#222222]"
              aria-label="Close error"
            >
              Inchide
            </button>
          </div>
        ) : (
          <div className="rounded-md bg-[#111111] p-6 shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-white">Admin Login</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="User sau Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-md border border-zinc-800 bg-[#222222] p-3 text-white outline-none focus:border-red-500"
              />
              <input
                type="password"
                placeholder="Parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-zinc-800 bg-[#222222] p-3 text-white outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Se încarcă..." : "Login"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

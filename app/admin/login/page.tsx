"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useNotification } from "@/app/admin/context/NotificationContext";

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { show } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    let loginEmail = username.trim();

    if (!loginEmail.includes("@")) {
      const { data: fetchedEmail, error: rpcError } = await supabase.rpc(
        "get_email_by_display_name",
        { input_display_name: loginEmail },
      );

      if (rpcError || !fetchedEmail) {
        show("Utilizatorul sau emailul nu a fost găsit.", "error");
        setLoading(false);
        return;
      }

      loginEmail = fetchedEmail;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      show(error.message, "error");
      setLoading(false);
    } else {
      show("Te-ai logat cu succes!", "success");
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-md p-6">
        {/* errors are shown via global notification */}

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
      </div>
    </div>
  );
};

export default Page;

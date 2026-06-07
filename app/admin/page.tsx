"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotification } from "@/app/admin/context/NotificationContext";

const supabase = createClient();

export default function AdminHome() {
  const navLinks = [
    { href: "/admin/prices", label: "Prețuri" },
    { href: "/admin/projects", label: "Proiecte" },
    { href: "/admin/contact", label: "Contact" },
  ];

  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // LOGICA 1: Câștigăm numele salvat anterior în Supabase când se încarcă pagina
  useEffect(() => {
    const fetchAdminData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.display_name) {
        setUsername(user.user_metadata.display_name);
      }
      setLoading(false);
    };

    fetchAdminData();
  }, []);

  // LOGICA 2: Salvăm numele permanent în Supabase user_metadata
  const handleSetUsername = async (newUsername: string) => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { display_name: newUsername }, // Supabase pune asta direct în user_metadata
    });

    if (!error) {
      setUsername(newUsername);
    } else {
      alert("Eroare la salvarea numelui: " + error.message);
    }

    setLoading(false);
  };

  // Nu afișăm interfața până nu știm dacă utilizatorul are deja un nume salvat
  if (loading && !username) {
    return (
      <div className="flex items-center justify-center min-h-64 text-zinc-400 text-sm">
        Se încarcă datele adminului...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-4rem)]">
      {/* Formularul apare DOAR dacă utilizatorul nu are un display_name în Supabase */}
      {!username && (
        <SetUsernameForm
          onSetUsername={handleSetUsername}
          isSubmitting={loading}
        />
      )}

      <h1 className="text-2xl font-bold">Salut, {username || "Admin"}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="p-6 border border-zinc-800 rounded-xl hover:border-red-500 transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// COMPONENTA FORMULARULUI
const SetUsernameForm = ({
  onSetUsername,
  isSubmitting,
}: {
  onSetUsername: (username: string) => void;
  isSubmitting: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");
  const { show } = useNotification();

  return (
    // fixed inset-0 garantează că overlay-ul acoperă tot ecranul perfect
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <form
        className="w-full max-w-md p-6 bg-[#111111] border border-zinc-800 flex flex-col items-center justify-center rounded-xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (inputValue.trim() && !isSubmitting) {
            onSetUsername(inputValue.trim());
            show(`Binevenit, ${inputValue.trim()}!`, "success");
          }
        }}
      >
        <div className="w-full text-center space-y-1">
          <label
            htmlFor="username"
            className="block text-lg font-medium text-gray-200"
          >
            Nume de utilizator
          </label>
          <p className="text-xs text-zinc-500">
            Nu ai un nume setat pentru panoul de control.
          </p>
        </div>

        <input
          type="text"
          id="username"
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="block w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-md text-white shadow-sm focus:outline-none focus:border-red-500 text-center"
          placeholder="Introdu numele tău"
        />

        <button
          type="submit"
          disabled={isSubmitting || !inputValue.trim()}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none transition disabled:opacity-50"
        >
          {isSubmitting ? "Se salvează..." : "Setează Numele de Utilizator"}
        </button>
      </form>
    </div>
  );
};

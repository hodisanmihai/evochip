import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContactProp } from "./landingTypes";
import { phoneDigits, safeWebUrl } from "@/lib/data/validation";

export async function getContact(client: SupabaseClient, signal?: AbortSignal) {
  let query = client.from("contact").select("*").order("id", { ascending: true }).limit(1);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.maybeSingle();
  const contact: ContactProp | null = data ? {
    ...data,
    telefon: phoneDigits(data.telefon),
    email: data.email?.trim() ?? "",
    facebook_url: safeWebUrl(data.facebook_url),
    instagram_url: safeWebUrl(data.instagram_url),
    tiktok_url: safeWebUrl(data.tiktok_url),
  } : null;
  return { contact, error };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getContact } from "@/lib/supabase/services/contact";
import type { ContactProp } from "@/lib/supabase/services/landingTypes";
import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";

export function useContact() {
  const [contact, setContact] = useState<ContactProp | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useProjectRefresh(refresh);
  useEffect(() => {
    const controller = new AbortController();
    void getContact(createClient(), controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setContact(result.contact);
      setError(Boolean(result.error));
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [revision]);
  return { contact, error, refresh };
}

"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectRefresh } from "@/lib/projects/useProjectRefresh";

export default function ProjectRefresh() {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  useProjectRefresh(refresh);
  return null;
}

"use client";

import { useEffect } from "react";

export function notifyProjectsChanged() {
  window.dispatchEvent(new Event("evochip-data-changed"));
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel("evochip-projects");
  channel.postMessage("changed");
  channel.close();
}

export function useProjectRefresh(refresh: () => void) {
  useEffect(() => {
    window.addEventListener("focus", refresh);
    window.addEventListener("evochip-data-changed", refresh);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("evochip-projects") : null;
    if (channel) channel.onmessage = refresh;
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("evochip-data-changed", refresh);
      channel?.close();
    };
  }, [refresh]);
}

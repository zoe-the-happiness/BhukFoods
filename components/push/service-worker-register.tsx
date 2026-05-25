"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js exactly once on mount. Cheap, idempotent.
 * Mounted from the root layout so every signed-in surface has it.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("sw.js register failed:", err);
    });
  }, []);
  return null;
}

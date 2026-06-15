"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isSecure = window.location.protocol === "https:";

    if (!("serviceWorker" in navigator) || (!isSecure && !isLocalhost)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Registration can fail in private browsing or restricted enterprise browsers.
    });
  }, []);

  return null;
}

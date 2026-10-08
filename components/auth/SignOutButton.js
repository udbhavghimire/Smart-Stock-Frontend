"use client";

import { useState } from "react";
import { apiPaths, pagePaths } from "@/config/paths";

export function SignOutButton({ className = "" }) {
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    await fetch(apiPaths.signOut, { method: "POST" }).catch(() => null);
    // Full page load so no signed-in data stays in memory.
    window.location.assign(pagePaths.login);
  };

  return (
    <button type="button" onClick={signOut} disabled={pending} className={className}>
      {pending ? "Logging out…" : "Logout"}
    </button>
  );
}

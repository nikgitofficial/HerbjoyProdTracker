"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-800"
    >
      <LogOut size={14} />
      Sign out
    </button>
  );
}

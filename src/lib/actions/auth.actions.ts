// src/lib/actions/auth.actions.ts
"use server";

import { signOut } from "@/lib/auth";
import { cookies } from "next/headers";

export async function handleSignOut() {
  const cookieStore = await cookies();

  const cookiesToClear = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
  ];

  cookiesToClear.forEach((name) => cookieStore.delete(name));

  await signOut({ redirectTo: "/login" });
}
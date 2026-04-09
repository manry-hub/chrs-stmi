"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50 cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      <span>Keluar</span>
    </button>
  );
}

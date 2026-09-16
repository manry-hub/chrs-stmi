"use client";

import { Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpamVisibilityToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    count: number;
}

/**
 * Laporan spam disembunyikan secara default agar daftar kerja petugas tetap
 * bersih, tapi tetap bisa ditinjau ulang lewat tombol ini.
 */
export function SpamVisibilityToggle({ value, onChange, count }: SpamVisibilityToggleProps) {
    if (count === 0 && !value) return null;

    return (
        <button
            onClick={() => onChange(!value)}
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-medium transition-colors whitespace-nowrap border",
                value
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-white text-slate-500 border-slate-200 hover:text-slate-700"
            )}
        >
            <Ban className="w-3.5 h-3.5" />
            {value ? "Sembunyikan spam" : `Tampilkan spam (${count})`}
        </button>
    );
}

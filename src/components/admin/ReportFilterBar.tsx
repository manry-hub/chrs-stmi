"use client";

import type { ReportStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ReportFilterBarProps {
  value: ReportStatus | "all";
  onChange: (value: ReportStatus | "all") => void;
}

const FILTERS: { value: ReportStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Belum Dikonfirmasi" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "done", label: "Selesai" },
];

export function ReportFilterBar({ value, onChange }: ReportFilterBarProps) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap",
            value === f.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

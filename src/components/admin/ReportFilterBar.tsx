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
    <div className="flex items-center gap-2 mb-6">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            value === f.value
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

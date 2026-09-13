"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DateFilterRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

const FILTERS: { value: DateFilterRange; label: string }[] = [
  { value: "hari", label: "Hari Ini" },
  { value: "bulan", label: "Bulan Ini" },
  { value: "tahun", label: "Tahun Ini" },
  { value: "semua", label: "Semua Waktu" },
];

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentValue = (searchParams.get("date") as DateFilterRange) || "hari";

  const handleChange = (value: DateFilterRange) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => handleChange(f.value)}
          className={cn(
            "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap",
            currentValue === f.value
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

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DateFilterRange } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown } from "lucide-react";

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
    <div className="relative group w-fit">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 group-hover:text-slate-700 transition-colors z-10">
        <Calendar className="h-4.5 w-4.5" />
      </div>
      <select
        value={currentValue}
        onChange={(e) => handleChange(e.target.value as DateFilterRange)}
        className="flex h-[42px] appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
      >
        {FILTERS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors z-10">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}

import { DateFilterRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DateFilterBarProps {
  value: DateFilterRange;
  onChange: (value: DateFilterRange) => void;
}

const FILTERS: { value: DateFilterRange; label: string }[] = [
  { value: "hari", label: "Hari Ini" },
  { value: "bulan", label: "Bulan Ini" },
  { value: "tahun", label: "Tahun Ini" },
  { value: "semua", label: "Semua Waktu" },
];

export function DateFilterBar({ value, onChange }: DateFilterBarProps) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto mb-6">
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

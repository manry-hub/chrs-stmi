import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  color?: "default" | "yellow" | "green" | "blue" | "purple";
}

const COLOR_MAP = {
  default: {
    bg: "bg-white",
    iconBg: "bg-slate-100",
    text: "text-slate-900",
    label: "text-slate-500",
    border: "border-slate-200",
  },
  yellow: {
    bg: "bg-white",
    iconBg: "bg-amber-100",
    text: "text-amber-700",
    label: "text-amber-600",
    border: "border-amber-200",
  },
  green: {
    bg: "bg-white",
    iconBg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "text-emerald-600",
    border: "border-emerald-200",
  },
  blue: {
    bg: "bg-white",
    iconBg: "bg-blue-100",
    text: "text-blue-700",
    label: "text-blue-600",
    border: "border-blue-200",
  },
  purple: {
    bg: "bg-white",
    iconBg: "bg-purple-100",
    text: "text-purple-700",
    label: "text-purple-600",
    border: "border-purple-200",
  },
};

export function StatsCard({ label, value, color = "default" }: StatsCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md",
        colors.bg,
        colors.border
      )}
    >
      <p className={cn("text-xs font-semibold uppercase tracking-wide mb-2", colors.label)}>
        {label}
      </p>
      <p className={cn("text-3xl font-bold", colors.text)}>
        {value}
      </p>
    </div>
  );
}

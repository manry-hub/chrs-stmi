import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, error, options, ...props }, ref) => {
    return (
        <div className="w-full relative group">
            <select
                className={cn(
                    "flex h-11 w-full appearance-none rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
                    error ? "border-red-500" : "border-slate-200 group-hover:border-slate-300",
                    className
                )}
                ref={ref}
                {...props}
            >
                <option value="" disabled hidden>
                    Pilih opsi...
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-slate-500 transition-colors">
                <ChevronDown className="h-4 w-4" />
            </div>
            {error && <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
});
Select.displayName = "Select";

export { Select };

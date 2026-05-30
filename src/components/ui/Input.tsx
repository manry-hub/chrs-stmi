import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border bg-transparent px-3.5 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error ? "border-red-500" : "border-slate-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[11px] text-red-500 mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

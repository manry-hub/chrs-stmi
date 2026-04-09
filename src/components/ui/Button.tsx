import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]",
          {
            "bg-blue-600 text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20": variant === "default",
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300": variant === "outline",
            "text-slate-600 hover:bg-slate-100": variant === "ghost",
            "bg-red-500 text-white shadow-md shadow-red-500/10 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20": variant === "destructive",
            "h-10 px-4 py-2": size === "default",
            "h-9 px-3": size === "sm",
            "h-12 rounded-xl px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

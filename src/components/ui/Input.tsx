import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, endAdornment, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-foreground placeholder:text-muted outline-none transition-all",
            "focus:border-accent/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-accent/10",
            icon && "pl-10",
            endAdornment && "pr-11",
            className
          )}
          {...props}
        />
        {endAdornment && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
            {endAdornment}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium text-muted", className)}
      {...props}
    />
  );
}

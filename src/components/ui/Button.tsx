"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled ?? loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "select-none",
          // Variants
          variant === "primary" && [
            "bg-brand-600 text-white",
            "hover:bg-brand-500 active:bg-brand-700",
            "shadow-brand hover:shadow-brand-lg",
          ],
          variant === "secondary" && [
            "bg-surface-800 text-surface-200 border border-surface-700",
            "hover:bg-surface-700 hover:border-surface-600 active:bg-surface-800",
          ],
          variant === "ghost" && [
            "bg-transparent text-surface-400",
            "hover:bg-surface-800 hover:text-surface-200",
          ],
          variant === "danger" && [
            "bg-red-600 text-white",
            "hover:bg-red-500 active:bg-red-700",
          ],
          // Sizes
          size === "sm" && "text-xs px-3 py-2 h-8",
          size === "md" && "text-sm px-4 py-2.5 h-10",
          size === "lg" && "text-sm px-5 py-3 h-12",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin flex-shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0 text-current">{leftIcon}</span>
            )}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0 text-current">{rightIcon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

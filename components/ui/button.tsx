import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition duration-base ease-[var(--kr-ease-standard)] focus:outline-none focus:ring-2 focus:ring-keyring-ai/40 disabled:cursor-not-allowed disabled:opacity-60";
  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-keyring-core text-white hover:brightness-110",
    secondary: "border border-[var(--kr-border-primary)] bg-white/5 text-white hover:bg-white/10",
    ghost: "text-keyring-gray hover:bg-white/5 hover:text-white",
    danger: "bg-keyring-error/90 text-white hover:bg-keyring-error",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} disabled={disabled || loading} {...props}>
      {loading ? "Loading..." : children}
    </button>
  );
}

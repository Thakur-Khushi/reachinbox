import type { ButtonHTMLAttributes } from "react";
import { IconSpinner } from "../icons";

type Variant = "primary" | "outline" | "ghost" | "danger-ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:hover:bg-brand-600",
  outline:
    "border border-brand-500 text-brand-600 bg-white hover:bg-brand-50 disabled:hover:bg-white",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
  "danger-ghost": "text-rose-500 hover:bg-rose-50 hover:text-rose-600",
};

export default function Button({
  variant = "primary",
  loading,
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && <IconSpinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

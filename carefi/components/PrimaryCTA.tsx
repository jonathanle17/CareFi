import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryCTAProps {
  label: string;
  href: string;
  className?: string;
  showArrow?: boolean;
  variant?: "primary" | "secondary";
}

export function PrimaryCTA({
  label,
  href,
  className,
  showArrow = true,
  variant = "primary",
}: PrimaryCTAProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden group";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-900/25 focus:ring-stone-900 before:absolute before:inset-0 before:bg-gradient-to-r before:from-stone-600 before:to-stone-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
    secondary:
      "border-2 border-stone-200 bg-white text-stone-900 hover:bg-stone-50 hover:-translate-y-1 hover:shadow-xl hover:border-stone-300 focus:ring-stone-900",
  };

  return (
    <Link
      href={href}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      <span className="relative z-10 flex items-center gap-2">
        {label}
        {showArrow && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
      </span>
    </Link>
  );
}

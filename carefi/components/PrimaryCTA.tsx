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
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-800 hover:-translate-y-0.5 hover:shadow-lg focus:ring-stone-900",
    secondary:
      "border border-stone-200 bg-white text-stone-900 hover:bg-stone-50 hover:-translate-y-0.5 hover:shadow-md focus:ring-stone-900",
  };

  return (
    <Link
      href={href}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {label}
      {showArrow && <ArrowRight className="w-4 h-4" />}
    </Link>
  );
}

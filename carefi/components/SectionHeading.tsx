import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-medium tracking-wide uppercase text-stone-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-display tracking-tight text-stone-900">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

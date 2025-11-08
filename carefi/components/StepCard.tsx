import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepCardProps {
  index: number;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}

export function StepCard({
  index,
  title,
  children,
  aside,
  className,
}: StepCardProps) {
  return (
    <Card
      className={cn(
        "p-6 md:p-8 hover:-translate-y-0.5 transition-transform duration-200",
        className
      )}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-medium">
              {index}
            </div>
            <h3 className="text-xl font-display font-medium text-stone-900">
              {title}
            </h3>
          </div>
          <div className="text-stone-600">{children}</div>
        </div>
        {aside && (
          <div className="md:w-48 flex-shrink-0 border-t md:border-t-0 md:border-l border-stone-200 pt-6 md:pt-0 md:pl-6">
            {aside}
          </div>
        )}
      </div>
    </Card>
  );
}

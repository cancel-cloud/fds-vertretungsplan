"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  size?: "default" | "sm";
}

export function PageHeader({ title, description, size = "default" }: PageHeaderProps) {
  return (
    <div className="bg-card border-b border-border">
      <div className={cn(
        "mx-auto px-4",
        size === "default" ? "max-w-[1620px] py-8" : "max-w-[850px] py-6"
      )}>
        <h1 className={cn(
          "font-bold text-foreground",
          size === "default" ? "text-3xl" : "text-2xl"
        )}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils"; 
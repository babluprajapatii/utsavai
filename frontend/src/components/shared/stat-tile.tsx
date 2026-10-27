"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  accent?: string; // oklch color
  children?: ReactNode;
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  children,
}: StatTileProps) {
  return (
    <Card className="p-5 gap-0">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold text-foreground font-display tracking-tight">
            {value}
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
            style={{
              backgroundColor: accent ? `${accent}15` : "var(--secondary)",
              color: accent ?? "var(--muted-foreground)",
            }}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

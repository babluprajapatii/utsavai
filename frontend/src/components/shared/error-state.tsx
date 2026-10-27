"use client";

import { LucideIcon, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  backLabel?: string;
  onBack?: () => void;
  children?: ReactNode;
  variant?: "default" | "destructive";
}

export function ErrorState({
  icon: Icon = AlertTriangle,
  title,
  description,
  retryLabel,
  onRetry,
  backLabel,
  onBack,
  children,
  variant = "default",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-12 px-6 border border-border rounded-lg bg-card"
    >
      <div
        className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
          variant === "destructive"
            ? "bg-destructive/10"
            : "bg-warning/10"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            variant === "destructive"
              ? "text-destructive"
              : "text-warning-foreground"
          }`}
          style={{ color: variant === "destructive" ? "oklch(0.55 0.18 25)" : "oklch(0.55 0.10 70)" }}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold text-foreground font-display">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
      {(retryLabel || backLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {backLabel && onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {backLabel}
            </Button>
          )}
          {retryLabel && onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              {retryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

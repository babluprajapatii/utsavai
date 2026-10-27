"use client";

import { ReactNode } from "react";

interface StatusPillProps {
  label: string;
  color?: string; // oklch color string
  dot?: string; // tailwind bg class
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md";
}

export function StatusPill({
  label,
  color,
  dot,
  variant = "soft",
  size = "sm",
}: StatusPillProps) {
  const sizeCls =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : "text-sm px-2.5 py-1";

  const style: React.CSSProperties = {};
  if (variant === "soft" && color) {
    style.backgroundColor = `${color}18`;
    style.color = color;
  } else if (variant === "solid" && color) {
    style.backgroundColor = color;
    style.color = "white";
  } else if (variant === "outline" && color) {
    style.borderColor = `${color}40`;
    style.color = color;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border border-transparent ${sizeCls}`}
      style={style}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />}
      {!dot && color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}

interface BadgeLikeProps {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export function ToneBadge({
  children,
  tone = "neutral",
  size = "sm",
}: BadgeLikeProps) {
  const toneMap: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground",
    primary: "bg-primary/10 text-primary",
    success: "text-success",
    warning: "text-warning-foreground",
    danger: "text-destructive",
    info: "text-info",
  };
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ${toneMap[tone]} ${sizeCls}`}
      style={
        tone === "success"
          ? { backgroundColor: "oklch(0.55 0.12 150 / 0.15)", color: "oklch(0.45 0.10 150)" }
          : tone === "warning"
          ? { backgroundColor: "oklch(0.72 0.13 70 / 0.18)", color: "oklch(0.45 0.10 60)" }
          : tone === "danger"
          ? { backgroundColor: "oklch(0.55 0.18 25 / 0.12)", color: "oklch(0.50 0.18 25)" }
          : tone === "info"
          ? { backgroundColor: "oklch(0.55 0.08 220 / 0.12)", color: "oklch(0.45 0.08 220)" }
          : undefined
      }
    >
      {children}
    </span>
  );
}

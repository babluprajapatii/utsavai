"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface LogoProps {
  size?: number;
  withText?: boolean;
  variant?: "default" | "light";
  /** Stack the wordmark below the icon (vertical lockup) instead of beside it */
  stacked?: boolean;
  className?: string;
}

// The logo mark image is 1162 wide x 1112 tall (near square, slightly wider)
const MARK_ASPECT = 1162 / 1112;

function getOptimizedLogoSrc(size: number, isLight: boolean): string {
  if (isLight) {
    if (size <= 32) return "/brand/logo-mark-light-32.png";
    if (size <= 48) return "/brand/logo-mark-light-48.png";
    if (size <= 64) return "/brand/logo-mark-light-64.png";
    if (size <= 128) return "/brand/logo-mark-light-128.png";
    if (size <= 256) return "/brand/logo-mark-light-256.png";
    return "/brand/logo-mark-light.png";
  }
  if (size <= 32) return "/brand/logo-mark-32.png";
  if (size <= 48) return "/brand/logo-mark-48.png";
  if (size <= 64) return "/brand/logo-mark-64.png";
  if (size <= 128) return "/brand/logo-mark-128.png";
  if (size <= 256) return "/brand/logo-mark-256.png";
  return "/brand/logo-mark.png";
}

export function Logo({
  size = 32,
  withText = true,
  variant = "default",
  stacked = false,
  className = "",
}: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLightVariant = variant === "light";

  const textColor = variant === "light" ? "text-white" : "text-foreground";

  // Brand accent for "AI" matches the orange-red from the mark
  const accentColor = isLightVariant
    ? "text-white/90"
    : "text-[#c5482b] dark:text-[#e87044]";

  // For the icon: mark is roughly square (slightly wider)
  const iconHeight = size;
  const iconWidth = size * MARK_ASPECT;
  const pixelWidth = Math.round(iconWidth);
  const pixelHeight = Math.round(iconHeight);
  const iconSrc = getOptimizedLogoSrc(pixelHeight, isLightVariant);

  const wordmark = withText && (
    <span
      className={`font-semibold tracking-tight font-display ${textColor} ${
        stacked ? "text-xl" : "text-lg"
      }`}
    >
      Utsav
      <span className={accentColor}>AI</span>
    </span>
  );

  const renderIcon = (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: `${iconWidth}px`, height: `${iconHeight}px` }}
    >
      <Image
        src={iconSrc}
        alt=""
        width={pixelWidth}
        height={pixelHeight}
        priority={size <= 36}
        className="object-contain"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden="true"
      />
    </span>
  );

  if (stacked) {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        {renderIcon}
        {wordmark}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {renderIcon}
      {wordmark}
    </span>
  );
}

"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
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

  const isDark =
    mounted &&
    (theme === "dark" || (theme === "system" && systemTheme === "dark"));
  const isLightVariant = variant === "light";

  // The full-color flower mark works on both light and dark backgrounds.
  // Use the white silhouette only when explicitly requested via variant="light"
  // (typically on dark CTA sections where the brand needs to read as white).
  const iconSrc = isLightVariant
    ? "/brand/logo-mark-light.png"
    : "/brand/logo-mark.png";

  const textColor = variant === "light" ? "text-white" : "text-foreground";

  // Brand accent for "AI" matches the orange-red from the mark
  const accentColor = isLightVariant
    ? "text-white/90"
    : "text-[#c5482b] dark:text-[#e87044]";

  // For the icon: mark is roughly square (slightly wider)
  const iconHeight = size;
  const iconWidth = size * MARK_ASPECT;

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

  if (stacked) {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <span
          className="inline-flex items-center justify-center shrink-0"
          style={{ width: `${iconWidth}px`, height: `${iconHeight}px` }}
        >
          <img
            src={iconSrc}
            alt=""
            width={Math.round(iconWidth)}
            height={Math.round(iconHeight)}
            className="object-contain"
            style={{ width: "100%", height: "100%", display: "block" }}
            aria-hidden="true"
          />
        </span>
        {wordmark}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: `${iconWidth}px`, height: `${iconHeight}px` }}
      >
        <img
          src={iconSrc}
          alt=""
          width={Math.round(iconWidth)}
          height={Math.round(iconHeight)}
          className="object-contain"
          style={{ width: "100%", height: "100%", display: "block" }}
          aria-hidden="true"
        />
      </span>
      {wordmark}
    </span>
  );
}

"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore, PublicView } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems: { label: string; view: PublicView }[] = [
  { label: "Features", view: "features" },
  { label: "How It Works", view: "home" },
  { label: "FAQ", view: "faq" },
  { label: "About", view: "about" },
];

export function PublicNav() {
  const navigate = useAppStore((s) => s.navigate);
  const currentView = useAppStore((s) =>
    s.route.kind === "public" ? s.route.view : null
  );
  const [open, setOpen] = useState(false);

  const go = (view: PublicView) => {
    navigate({ kind: "public", view });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go("home")}
            className="flex items-center"
            aria-label="UtsavAI home"
          >
            <Logo />
          </button>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.view)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  currentView === item.view
                    ? "text-primary bg-primary/5"
                    : "text-foreground/80 hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => go("login")}
                className="text-foreground/80 hover:text-foreground"
              >
                Login
              </Button>
              <Button size="sm" onClick={() => go("register")}>
                Start Planning
              </Button>
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-secondary"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.view)}
                className={cn(
                  "block w-full text-left px-3 py-2.5 text-sm font-medium rounded-md",
                  currentView === item.view
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => go("login")}
                className="w-full"
              >
                Login
              </Button>
              <Button onClick={() => go("register")} className="w-full">
                Start Planning
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

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
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
            className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="UtsavAI home"
          >
            <Logo priority />
          </a>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={`#${item.view}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.view);
                }}
                aria-current={currentView === item.view ? "page" : undefined}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex items-center",
                  currentView === item.view
                    ? "text-primary bg-primary/5"
                    : "text-foreground/80 hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                <a
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault();
                    go("login");
                  }}
                >
                  Login
                </a>
              </Button>
              <Button asChild size="sm">
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    go("register");
                  }}
                >
                  Start Planning
                </a>
              </Button>
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-border py-4 space-y-1"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={`#${item.view}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.view);
                }}
                aria-current={currentView === item.view ? "page" : undefined}
                className={cn(
                  "block w-full text-left px-3 py-3 text-sm font-medium rounded-md min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  currentView === item.view
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                className="w-full min-h-[44px]"
              >
                <a
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault();
                    go("login");
                  }}
                >
                  Login
                </a>
              </Button>
              <Button asChild className="w-full min-h-[44px]">
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    go("register");
                  }}
                >
                  Start Planning
                </a>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

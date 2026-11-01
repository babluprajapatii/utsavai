"use client";

import { Logo } from "@/components/shared/logo";
import { useAppStore, PublicView } from "@/lib/store";

const footerSections: { title: string; links: { label: string; view: PublicView }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", view: "features" },
      { label: "How It Works", view: "home" },
      { label: "FAQ", view: "faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", view: "about" },
      { label: "Login", view: "login" },
      { label: "Start Planning", view: "register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", view: "privacy" },
      { label: "Terms and Conditions", view: "terms" },
    ],
  },
];

export function PublicFooter() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <footer className="border-t border-border bg-secondary/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plan your entire celebration in one place. Budget, tasks,
              timeline, vendors, guests, and AI recommendations.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={`#${link.view}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate({ kind: "public", view: link.view });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
              Made for celebrations
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Weddings, birthdays, community events, family celebrations, and
              custom occasions.
            </p>
            <div className="pt-1 flex flex-col gap-1.5 text-xs text-muted-foreground">
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ kind: "public", view: "features" });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-left hover:text-foreground transition-colors cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 inline-block"
              >
                Budget, Tasks &amp; Vendor Tools →
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ kind: "public", view: "faq" });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-left hover:text-foreground transition-colors cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 inline-block"
              >
                Celebration Planning FAQs →
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} UtsavAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                navigate({ kind: "public", view: "privacy" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 inline-block"
            >
              Privacy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                navigate({ kind: "public", view: "terms" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 inline-block"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

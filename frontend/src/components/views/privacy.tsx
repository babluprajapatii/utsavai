"use client";

import { Shield } from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    body: [
      "This Privacy Policy explains how UtsavAI handles information when you use our event planning platform. UtsavAI helps you plan weddings, birthdays, community events, family celebrations, and custom occasions by managing budget, tasks, timeline, vendors, guests, and an AI planning assistant.",
      "When you create an account, your event planning data is stored securely in our cloud database (Supabase PostgreSQL), protected by Row Level Security (RLS) tied to your authenticated user account so your plans are preserved across sessions.",
    ],
  },
  {
    id: "information-types",
    title: "2. Information we collect & store",
    body: [
      "Account Information: Your name, email address, and authentication credentials managed securely through Supabase Auth. Passwords are encrypted by Supabase and never stored in plaintext by UtsavAI.",
      "Event Planning Data: Details you create to plan celebrations, including event names, dates, budget targets, expenses, checklist tasks, timeline milestones, vendor contacts, guest names, RSVPs, dietary preferences, and event-day schedules.",
      "Preferences: Theme preferences (light, dark, or system) stored locally in your browser.",
    ],
  },
  {
    id: "ai-assistant",
    title: "3. AI assistant & planning interactions",
    body: [
      "When you generate an event plan or chat with the AI assistant, our server constructs a focused context payload (event type, budget parameters, task summaries, guest counts) stripped of sensitive personal identifiers (such as guest phone numbers or email addresses) and sends it via encrypted HTTPS to Google Gemini (model gemini-1.5-flash).",
      "API keys and database credentials are held strictly in server environment variables and are never transmitted to client browsers or AI prompts.",
      "AI-generated content is clearly marked in the interface as drafts and recommendations. AI suggestions never mutate your authoritative database records without your explicit review and acceptance.",
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies and local storage",
    body: [
      "We use browser local storage to remember your chosen theme preference (light, dark, or system).",
      "We use secure session cookies managed by Supabase to maintain your authenticated session across page loads. We do not use third-party tracking, advertising, or profiling cookies.",
    ],
  },
  {
    id: "third-parties",
    title: "5. Third-party services",
    body: [
      "Authentication: Handled via Supabase Auth. Google OAuth is available as an optional sign-in method, redirecting to Google's authentication servers for identity verification.",
      "AI Processing: Server-to-server requests to the Google Gemini API for plan generation and conversational assistant queries.",
      "We do not sell, rent, or trade your personal or event data to third-party advertisers or data brokers.",
    ],
  },
  {
    id: "children",
    title: "6. Children's privacy",
    body: [
      "UtsavAI is intended for adults who are planning celebrations. The platform is not directed at children under the age of 16, and we do not knowingly collect personal information from children.",
    ],
  },
  {
    id: "your-rights",
    title: "7. Your rights & data control",
    body: [
      "You have direct control over your event data. You can view, edit, export, or permanently delete your events, tasks, vendors, and guests at any time directly through the application interface.",
      "Deleting an event permanently removes all related tasks, expenses, vendors, guests, schedule items, and milestones from the database.",
    ],
  },
  {
    id: "security",
    title: "8. Security measures",
    body: [
      "We protect your data using transport encryption (HTTPS / TLS 1.3), strict Content Security Policy (CSP), HTTP security headers, and Supabase Row Level Security (RLS) guaranteeing that queries are strictly isolated to your authenticated user account.",
      "All API route inputs pass runtime Zod schema validation to guard against injection and malformed payloads.",
    ],
  },
  {
    id: "changes",
    title: "9. Changes to this policy",
    body: [
      "We may update this Privacy Policy as our services evolve. Material updates will be published on this page with an updated modification date.",
      "Continued use of UtsavAI after a policy update takes effect constitutes acceptance of the updated terms.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    body: [
      "If you have questions about this Privacy Policy or your data, please reach out to the UtsavAI team through the About page.",
    ],
  },
];

export function PrivacyView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <section className="border-b border-border py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              <Shield className="h-4 w-4" />
              Legal &amp; Privacy
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              How UtsavAI handles and protects information when you use our celebration planning workspace.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-10">
              {sections.map((section) => (
                <article key={section.id} id={section.id} className="space-y-3">
                  <h2 className="text-xl font-semibold font-display text-foreground">
                    {section.title}
                  </h2>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    {section.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              ))}

              <Card className="p-6 border-border bg-secondary/30 mt-8">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Related documents: review our{" "}
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate({ kind: "public", view: "terms" });
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  for details regarding service scope and user responsibilities.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

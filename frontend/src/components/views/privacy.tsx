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
      "This is a frontend demonstration of the UtsavAI interface. The current deployment runs entirely in your browser: there is no live backend, no account database, and no server-side storage of your information. The events, tasks, vendors, guests, expenses, and other data you see are realistic demo data built into the application.",
      "When UtsavAI is connected to a production backend in a future deployment, this policy will be updated to describe what data is collected, how it is stored, who can access it, and how long it is retained.",
    ],
  },
  {
    id: "information-types",
    title: "2. Information in this demonstration",
    body: [
      "While using this demonstration, the only inputs you may enter are: a name and email on the registration form, an email on the login form, and any free-text content you type into onboarding forms, event details, tasks, vendors, guests, expenses, schedule items, or AI assistant prompts.",
      "All of this input is held only in your browser's local memory for the duration of your session. It is not transmitted to any server, not stored in any database, and not shared with any third party. When you close or refresh the browser tab, all session data is lost.",
      "Authentication in this demonstration accepts any email and password. No real credential verification takes place.",
    ],
  },
  {
    id: "ai-assistant",
    title: "3. AI assistant interactions",
    body: [
      "When you type a message into the UtsavAI planning assistant in this demonstration, the message is processed locally within the application. The assistant's response is generated using a fixed set of contextual rules based on the currently selected event and its tasks. No request is sent to an external AI service.",
      "In a production deployment, assistant messages would be sent to an AI model provider along with relevant event context. That deployment would describe the provider, retention, and any logging practices here.",
      "AI-generated content is always marked as such in the interface. It is intended as suggestions and drafts, not as verified facts or professional advice.",
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies and local storage",
    body: [
      "This demonstration uses local storage to remember your theme preference (light, dark, or system). No tracking cookies, advertising cookies, or analytics cookies are set.",
      "If you prefer not to use local storage, you can disable it in your browser settings. The application will still function, defaulting to the system theme.",
    ],
  },
  {
    id: "third-parties",
    title: "5. Third-party services",
    body: [
      "This demonstration does not integrate with any third-party analytics, advertising, or tracking services.",
      "The login page includes a 'Continue with Google' option for visual completeness. In this demonstration, clicking it signs you in with a placeholder local account. No request is made to Google.",
    ],
  },
  {
    id: "children",
    title: "6. Children's privacy",
    body: [
      "UtsavAI is intended for use by adults who are planning celebrations. The platform is not directed at children under the age of 16, and we do not knowingly collect information from children.",
      "If you believe a child has provided information through a future production deployment of UtsavAI, please contact us so it can be removed.",
    ],
  },
  {
    id: "your-rights",
    title: "7. Your rights",
    body: [
      "Because this demonstration does not persist any data outside your browser, you have full control at all times. Refreshing the page or closing the tab clears everything you have entered.",
      "In a production deployment, you would have the right to access, correct, export, or delete your personal data, subject to applicable laws such as the Information Technology Act, 2000 and applicable rules in India, or the General Data Protection Regulation (GDPR) in the European Union.",
    ],
  },
  {
    id: "security",
    title: "8. Security",
    body: [
      "This demonstration does not store any data server-side, so there is no server-side data to secure. Any data you enter exists only in your browser session.",
      "When UtsavAI is deployed with a real backend, security measures would include encrypted password storage, transport-layer encryption (HTTPS), access controls, audit logging, and regular security review. Those measures would be described in detail here.",
    ],
  },
  {
    id: "changes",
    title: "9. Changes to this policy",
    body: [
      "We may update this Privacy Policy when UtsavAI is connected to a real backend, when new features are introduced, or when legal requirements change. Material changes will be communicated through a prominent notice in the application.",
      "Continued use of UtsavAI after a change takes effect constitutes acceptance of the updated policy.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    body: [
      "If you have questions about this Privacy Policy or about how UtsavAI handles information, please reach out through the contact information on the About page.",
      "For this demonstration, no contact email is configured. The contact details would be added here before the production launch.",
    ],
  },
];

export function PrivacyView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1">
        <section className="border-b border-border py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              This page explains what information UtsavAI handles and how it is treated. Please read it carefully before using the platform.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
              {/* Table of contents */}
              <aside className="hidden lg:block">
                <nav className="sticky top-24 space-y-1" aria-label="Privacy Policy sections">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Contents
                  </p>
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground py-1"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </aside>

              <div className="space-y-10 min-w-0">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-24">
                    <h2 className="text-xl font-semibold font-display text-foreground mb-3">
                      {s.title}
                    </h2>
                    <div className="space-y-4">
                      {s.body.map((para, i) => (
                        <p key={i} className="text-sm text-foreground/80 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}

                <Card className="p-5 bg-secondary/40 border-dashed">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This Privacy Policy applies to the current demonstration deployment of UtsavAI. A production deployment with a real backend would update this document with specifics about data storage, processing, retention, and third-party integrations before launch.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

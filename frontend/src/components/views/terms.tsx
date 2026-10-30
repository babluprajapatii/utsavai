"use client";

import { FileText } from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    body: [
      "These Terms and Conditions govern your use of UtsavAI, an event and celebration planning platform. By accessing or using UtsavAI, you agree to be bound by these terms.",
      "If you do not agree with any part of these terms, please do not use UtsavAI. We may update these terms from time to time, and continued use after changes take effect constitutes acceptance of the updated terms.",
    ],
  },
  {
    id: "service-description",
    title: "2. What UtsavAI provides",
    body: [
      "UtsavAI is a planning workspace for weddings, birthdays, community events, family celebrations, and custom occasions. It helps you organize budget, tasks, timeline, vendors, guests, an event-day schedule, and an AI planning assistant.",
      "UtsavAI is a planning and management tool, not a vendor marketplace. We do not sell products, book vendors on your behalf, or take payment for services rendered by third-party vendors. You research, negotiate, and book vendors on your own terms.",
      "The current deployment is a frontend demonstration. It runs entirely in your browser and does not persist data to a server. Functionality that requires a backend, such as saving events across sessions or sharing plans with collaborators, is not available in this demonstration.",
    ],
  },
  {
    id: "ai-content",
    title: "3. AI-generated content",
    body: [
      "UtsavAI uses an AI assistant to help draft event plans, suggest priorities, surface risks, and answer questions about your event. All AI-generated content is clearly marked as such in the interface.",
      "AI-generated content is provided as suggestions and drafts, not as professional advice. You are responsible for reviewing, editing, and approving all content before acting on it. UtsavAI does not guarantee the accuracy, completeness, or suitability of AI-generated content for your specific event.",
      "For decisions involving contracts, payments, legal obligations, health and safety, or religious and cultural practices, consult qualified professionals. UtsavAI's recommendations do not replace such advice.",
    ],
  },
  {
    id: "your-responsibilities",
    title: "4. Your responsibilities",
    body: [
      "You are responsible for the accuracy of information you enter into UtsavAI, including event details, budget figures, task assignments, vendor contacts, guest information, and special requirements.",
      "You are responsible for verifying vendor credentials, reviewing contracts, and making payments directly to vendors. UtsavAI does not vet, endorse, or guarantee any vendor you choose to work with.",
      "You agree to use UtsavAI only for lawful purposes and in a manner that does not infringe the rights of others. You may not use UtsavAI to store defamatory, harmful, or unlawful content.",
    ],
  },
  {
    id: "accounts",
    title: "5. Accounts and authentication",
    body: [
      "Authentication uses real Supabase Auth to verify user credentials securely. When you sign in, Supabase validates your email and password against its authentication service. New users can register and create accounts using Supabase's registration flow.",
      "In a production deployment, you would be responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You would agree to notify us of any unauthorized use of your account.",
    ],
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable use",
    body: [
      "You agree not to: enter information that is false, misleading, or fraudulent; attempt to access data belonging to other users; interfere with the operation of UtsavAI; introduce malware or harmful code; use automated tools to scrape or overload the service; or use UtsavAI in violation of applicable laws.",
      "We reserve the right to suspend or terminate access for violations of these terms, with or without notice.",
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual property",
    body: [
      "UtsavAI, including its logo, design, text, and software, is owned by UtsavAI. The brand mark, color palette, and visual design are protected as intellectual property.",
      "Content you enter into UtsavAI, such as event details and task descriptions, remains yours. You grant UtsavAI a limited license to process and display that content within the application for the purpose of providing the service.",
    ],
  },
  {
    id: "third-party-vendors",
    title: "8. Third-party vendors and services",
    body: [
      "UtsavAI helps you track vendors you are researching or have booked. We are not a party to any agreement between you and a vendor. We do not control vendor pricing, availability, or performance.",
      "Any dispute or claim arising from a vendor relationship is between you and the vendor. UtsavAI is not liable for vendor actions, errors, or failures.",
    ],
  },
  {
    id: "disclaimer",
    title: "9. Disclaimer of warranties",
    body: [
      "UtsavAI is provided on an 'as is' and 'as available' basis. We make no warranties, express or implied, regarding the operation of the platform, the accuracy of AI-generated content, or the suitability of UtsavAI for your specific event.",
      "We do not guarantee that UtsavAI will be uninterrupted, error-free, or secure. You use the platform at your own risk.",
    ],
  },
  {
    id: "limitation",
    title: "10. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, UtsavAI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to loss of profits, loss of data, missed deadlines, or vendor disputes.",
      "UtsavAI's aggregate liability for any claim arising from these terms shall not exceed the amount you have paid us for the service in the twelve months preceding the claim. Since this demonstration is provided without charge, that amount is zero.",
    ],
  },
  {
    id: "governing-law",
    title: "11. Governing law",
    body: [
      "These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of UtsavAI shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.",
      "If you are accessing UtsavAI from outside India, you are responsible for compliance with local laws.",
    ],
  },
  {
    id: "changes",
    title: "12. Changes to these terms",
    body: [
      "We may revise these Terms and Conditions at any time. The most current version will always be available on this page, with an updated 'last revised' date.",
      "Material changes, such as new fees, changes to liability, or changes to data practices, will be communicated through a prominent notice in the application before they take effect.",
    ],
  },
  {
    id: "contact",
    title: "13. Contact",
    body: [
      "If you have questions about these Terms and Conditions, please reach out through the contact information on the About page.",
      "For this demonstration, no contact email is configured. Production contact details would be added here before launch.",
    ],
  },
];

export function TermsView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1">
        <section className="border-b border-border py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display text-foreground">
              Terms and Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Last revised: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              These terms govern your use of UtsavAI. Please read them carefully before using the platform.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
              {/* Table of contents */}
              <aside className="hidden lg:block">
                <nav className="sticky top-24 space-y-1" aria-label="Terms sections">
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
                    These Terms and Conditions apply to the current demonstration deployment of UtsavAI. A production deployment would review and update this document with specifics about fees, service levels, support, and dispute resolution before launch.
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

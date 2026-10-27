"use client";

import { HelpCircle, ChevronDown } from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const faqs = [
  {
    category: "Getting started",
    items: [
      {
        q: "What kinds of events does UtsavAI support?",
        a: "Weddings, birthdays, community events, family celebrations, and custom events. The same interface works for all of them, with categories and recommendations that adapt to the occasion.",
      },
      {
        q: "How do I create my first event?",
        a: "Sign up and follow the guided onboarding. Pick an event type, enter your event details, set a budget, choose your preferences, and generate a starter plan. You can edit anything afterward.",
      },
      {
        q: "Do I need to install anything?",
        a: "No. UtsavAI runs in the browser and works on desktop and mobile. The responsive layout adapts from large monitors down to small phones.",
      },
    ],
  },
  {
    category: "AI features",
    items: [
      {
        q: "What does the AI actually do?",
        a: "The AI generates a starter plan based on your event details, and answers questions in the assistant using your event context. It can suggest priorities, surface overdue tasks, and propose budget trade-offs.",
      },
      {
        q: "Is AI content marked?",
        a: "Yes. Every AI-generated response is clearly marked as such. Generated plan sections are visually distinguished from manually created content.",
      },
      {
        q: "Can I edit what the AI generates?",
        a: "Yes. Every section of a generated plan can be edited, regenerated, or removed. The AI gives you a starting point, not a final answer.",
      },
    ],
  },
  {
    category: "Pricing and data",
    items: [
      {
        q: "Is UtsavAI a vendor marketplace?",
        a: "No. UtsavAI is a planning and management workspace. You research, shortlist, and book vendors on your own terms. The product helps you track them, not sell to you.",
      },
      {
        q: "Is my data stored online?",
        a: "This is a frontend showcase with realistic demo data. When connected to a real backend, your events, tasks, and guests would be stored securely under your account.",
      },
      {
        q: "Can I export my plan?",
        a: "You can preview your event summary, budget, tasks, timeline, vendors, guests, and event-day schedule in the Export view. File download (PDF and ICS) is not available in this demo but is planned for the production release.",
      },
    ],
  },
  {
    category: "Mobile and accessibility",
    items: [
      {
        q: "Does it work on mobile?",
        a: "Yes. The dashboard, event-day schedule, and guest list are built mobile-first. Navigation adapts with a compact header and mobile menu.",
      },
      {
        q: "Is the interface accessible?",
        a: "We follow WCAG 2.1 AA principles: semantic HTML, keyboard navigation, visible focus, accessible labels, form error messages, accessible dialogs, screen-reader-friendly controls, and reduced-motion support.",
      },
      {
        q: "Does it work without an internet connection?",
        a: "Once a plan is loaded, most interactions work offline. The AI assistant and any sync operations require connectivity.",
      },
    ],
  },
];

export function FaqView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1">
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-2 text-primary">
              <HelpCircle className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Help center
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight font-display text-foreground leading-tight">
              Frequently asked questions
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Quick answers to common questions about UtsavAI. If something is
              unclear, the in-app assistant can usually help.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
            {faqs.map((group) => (
              <div key={group.category} className="space-y-3">
                <h2 className="text-lg font-semibold font-display text-foreground">
                  {group.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {group.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${group.category}-${i}`}
                      className="border border-border rounded-md px-5 bg-card"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight font-display text-foreground">
              Ready to plan your celebration?
            </h2>
            <Button
              size="lg"
              onClick={() => navigate({ kind: "public", view: "register" })}
            >
              Start Planning
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

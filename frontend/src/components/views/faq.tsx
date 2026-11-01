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
    category: "Planning workflows & features",
    items: [
      {
        q: "How does event budget tracking and contingency work?",
        a: "UtsavAI lets you set an overall target budget and distribute planned amounts across essential categories: venue, food/catering, decoration, photography, entertainment, transportation, and contingency. It compares planned vs. actual expenses and includes a dedicated contingency line to absorb unexpected expenses and price variations.",
      },
      {
        q: "How does task management help prevent planning delays?",
        a: "Tasks in UtsavAI are organized with priorities (Low, Medium, High, Critical), ownership assignment, and due dates. Urgent and overdue tasks are highlighted in your dashboard and planning timeline to ensure essential milestones are finished first.",
      },
      {
        q: "What is the difference between the Planning Timeline and the Event-Day Schedule?",
        a: "The Planning Timeline tracks major milestones across weeks or months leading up to the celebration. The Event-Day Schedule is an hour-by-hour, mobile-optimized operational run sheet designed for coordinators and family leads on the day of the event.",
      },
      {
        q: "How does guest management handle RSVPs and meal preferences?",
        a: "You can track real-time response statuses (Attending, Declined, Pending), plus-ones, family groups, and dietary preferences (vegetarian, non-vegetarian, or special needs) for accurate catering calculations.",
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
        a: "Your celebration data, budgets, tasks, vendors, and guests are stored securely in Supabase PostgreSQL cloud database storage, isolated to your account using Row Level Security.",
      },
      {
        q: "Can I export my plan?",
        a: "Yes. You can download an RFC 5545-compliant calendar file (.ics) to import your celebration and milestones into Google Calendar, Apple Calendar, or Outlook, or use the print option to save a clean PDF via your browser.",
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
      <main className="flex-1" id="main-content" tabIndex={-1}>
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
              Clear answers to common questions about celebration budgeting, tasks, vendors, guest lists, and our event-aware AI assistant.
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
              Ready to organize your celebration with UtsavAI?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Start with an AI-generated starter plan or build from scratch. Manage budget, tasks, timeline, vendors, and guests in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
              >
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ kind: "public", view: "register" });
                  }}
                >
                  Start Planning Free
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
              >
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ kind: "public", view: "features" });
                  }}
                >
                  Explore Features &amp; Workflows
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

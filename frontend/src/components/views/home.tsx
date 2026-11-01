"use client";

import {
  ArrowRight,
  IndianRupee,
  Users,
  Store,
  Clock,
  Sparkles,
  Bell,
  FileDown,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  PartyPopper,
  Cake,
  Wand2,
  Heart,
  Gift,
  Building2,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { useAppStore } from "@/lib/store";
import { EventType, eventTypeMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const eventTypeIcons: Record<EventType, typeof Heart> = {
  wedding: Heart,
  birthday: Cake,
  community: Building2,
  family: Gift,
  custom: PartyPopper,
};

const eventTypeAccents: Record<EventType, string> = {
  wedding: "oklch(0.55 0.14 35)",
  birthday: "oklch(0.65 0.12 150)",
  community: "oklch(0.65 0.13 70)",
  family: "oklch(0.55 0.10 320)",
  custom: "oklch(0.55 0.08 220)",
};

const features = [
  {
    icon: Sparkles,
    title: "Smart Event Planning",
    description:
      "Generate a complete event plan in minutes. UtsavAI drafts your tasks, timeline, and budget suggestions based on your event details.",
  },
  {
    icon: IndianRupee,
    title: "Budget Management",
    description:
      "Set a total budget, plan per category, and track actual spending. Always know what is left, with clear category breakdowns.",
  },
  {
    icon: ListChecks,
    title: "Task Management",
    description:
      "Every task with status, priority, owner, and due date. Dependencies and overdue alerts keep your plan on track.",
  },
  {
    icon: CalendarDays,
    title: "Timeline",
    description:
      "Visual planning milestones from today to event day. Distinct from the event-day schedule so nothing gets confused.",
  },
  {
    icon: Store,
    title: "Vendor Management",
    description:
      "Track vendors from research to booking. Categories, costs, contacts, and status in one workspace. Not a marketplace.",
  },
  {
    icon: Users,
    title: "Guest Management",
    description:
      "Track RSVPs, meal preferences, and special requirements. Summary counts and large-list tools built in.",
  },
  {
    icon: Clock,
    title: "Event-Day Schedule",
    description:
      "A dedicated operational screen for event day. Current activity, next up, quick actions, all mobile-first.",
  },
  {
    icon: Wand2,
    title: "AI Planning Assistant",
    description:
      "Ask what to prioritize, how to reduce budget, what is overdue. The assistant knows your selected event and tasks.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Task overdue, deadline approaching, budget warning, vendor follow-up. Read and unread states, in one place.",
  },
  {
    icon: FileDown,
    title: "Export",
    description:
      "Preview your complete plan in one place: event summary, budget breakdown, tasks, timeline, vendors, guests, and schedule.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Event",
    description: "Pick an event type and add the basics: date, location, guests, and budget.",
  },
  {
    step: "02",
    title: "Add Details",
    description: "Set your theme, style, priorities, and any special requirements.",
  },
  {
    step: "03",
    title: "Generate Plan",
    description: "UtsavAI drafts tasks, timeline, budget suggestions, and recommendations.",
  },
  {
    step: "04",
    title: "Manage Everything",
    description: "Track budget, tasks, vendors, and guests in one organized workspace.",
  },
];

const faqs = [
  {
    q: "What kinds of events does UtsavAI support?",
    a: "Weddings, birthdays, community events, family celebrations, and custom events. The same interface works for all of them, with categories and recommendations that adapt to the occasion.",
  },
  {
    q: "Is UtsavAI a vendor marketplace?",
    a: "No. UtsavAI is a planning and management workspace. You research, shortlist, and book vendors on your own terms. The product helps you track them, not sell to you.",
  },
  {
    q: "What does the AI actually do?",
    a: "The AI generates a starter plan based on your event details, and answers questions in the assistant using your event context. It can suggest priorities, surface overdue tasks, and propose budget trade-offs.",
  },
  {
    q: "Is my data stored online?",
    a: "Your celebration data, budgets, tasks, vendors, and guests are stored securely in Supabase PostgreSQL cloud database storage, protected by Row Level Security.",
  },
  {
    q: "Can I export my plan?",
    a: "Yes. You can download an RFC 5545 calendar file (.ics) for Google Calendar, Apple Calendar, or Outlook, and print or save your full event plan as a PDF via your browser.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The dashboard, event-day schedule, and guest list are built mobile-first. Navigation adapts with a compact header and mobile menu.",
  },
];

const aiDemoConversation = [
  {
    role: "user" as const,
    content:
      "My wedding is in 60 days and my budget is ₹5 lakh. What should I prioritize?",
  },
  {
    role: "assistant" as const,
    content: [
      "Here is what I would prioritize over the next two weeks:",
      "",
      "1. Confirm venue booking and lock the contract.",
      "2. Finalize the caterer and menu, including dietary counts.",
      "3. Confirm the photographer and videographer.",
      "4. Complete the guest list with phone numbers and addresses.",
      "5. Review remaining budget and reserve a 10% contingency.",
      "",
      "Tackling these in order keeps the timeline stable and avoids last-minute costs.",
    ].join("\n"),
  },
];

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 paper-texture opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  Plan weddings, birthdays, community and family events
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground font-display leading-[1.05]">
                  Plan your entire celebration in one place.
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  UtsavAI brings budget, tasks, timeline, vendors, guests, and AI
                  recommendations into a single workspace. Built for weddings,
                  birthdays, community events, family celebrations, and custom
                  occasions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate({ kind: "public", view: "register" })}
                  >
                    Start Planning
                    <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById("how-it-works");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    See How It Works
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    No vendor lock-in
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    Works on mobile
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    AI plan generation
                  </span>
                </div>
              </div>

              <HeroDashboardPreview />
            </div>
          </div>
        </section>

        {/* Executive Summary & Key Takeaways */}
        <section className="border-b border-border py-12 sm:py-16 bg-secondary/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col gap-2 pb-6 border-b border-border">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Platform Overview &amp; Specifications
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
                  Key Takeaways: What You Need to Know About UtsavAI
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    Unified Workspace
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Brings target INR budgeting, milestone task checklists, vendor coordination, and guest RSVPs into one organized dashboard instead of disjointed spreadsheets.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    Contingency-Aware Budget
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Provides a dedicated contingency category kept separate from main expense buckets, helping organizers plan for price variations and surprise expenses.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    Context-Aware AI
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI planning assistant operates directly on your celebration parameters. Generates starter drafts that remain 100% customizable and user-editable.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    Two Operational Timelines
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Separates long-range planning milestones (weeks/months ahead) from the hour-by-hour operational run sheet needed on the event day itself.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Audience: Couples, families, and community coordinators</span>
                  <span>•</span>
                  <span>Scope: Planning workspace — users negotiate and contract with vendors directly</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate({ kind: "public", view: "features" });
                    }}
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Explore all features &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event types */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-10">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Every celebration, one workspace
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                Celebration &amp; Event Planning for Every Occasion
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Whether you are coordinating a multi-day traditional wedding, organizing a milestone birthday party,
                managing a community gathering, or hosting a family anniversary, UtsavAI adapts budget breakdowns,
                tasks, vendor checklists, and guest tracking to your specific celebration.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {(Object.keys(eventTypeMeta) as EventType[]).map((type) => {
                const Icon = eventTypeIcons[type];
                const meta = eventTypeMeta[type];
                const accent = eventTypeAccents[type];
                return (
                  <Card key={type} className="p-5 gap-0 hover:border-foreground/30 transition-colors group">
                    <div
                      className="h-10 w-10 rounded-md flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${accent}18`, color: accent }}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground font-display">
                      {meta.label}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {meta.description}
                    </p>
                    <p className="mt-3 text-xs italic text-foreground/70 border-l-2 pl-2.5" style={{ borderColor: accent }}>
                      {meta.tagline}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border py-16 sm:py-20 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-10">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Actual capabilities
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                Budget, tasks, vendors, and guests in one place
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Integrated tools designed for celebration organizers. Track expenses in INR, coordinate
                vendors, manage tasks and deadlines, track guest RSVPs, and follow an hour-by-hour schedule on the day itself.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title} className="p-6 gap-0 hover:border-foreground/30 transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground font-display">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => navigate({ kind: "public", view: "features" })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Explore all features and workflows"
              >
                Explore all features and workflows
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-10">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                A simple workflow
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                How UtsavAI works: from idea to event day
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Four clear steps from initial celebration concept to a fully coordinated event plan.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 relative">
              {howItWorks.map((s, i) => (
                <div key={s.step} className="relative">
                  <Card className="p-6 h-full gap-0">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-semibold text-primary font-display tracking-tight">
                        {s.step}
                      </span>
                      {i < howItWorks.length - 1 && (
                        <ChevronRight
                          className="hidden lg:block h-4 w-4 text-border absolute -right-3 top-9"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground font-display">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {s.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI demo */}
        <section className="border-b border-border py-16 sm:py-20 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-5 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  AI planning assistant
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                  An AI planning assistant that knows your event
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  The assistant understands your specific celebration context — tasks, deadlines, budget limits,
                  and vendor status. Ask what to prioritize, explore budget trade-offs, or review overdue items.
                </p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    <span>Real-time event context included in every answer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    <span>Actionable prompts for weddings, birthdays, and community festivals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    <span>Transparent, clearly marked AI-generated recommendations.</span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  onClick={() => navigate({ kind: "public", view: "register" })}
                >
                  Try the assistant
                  <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                </Button>
              </div>

              <AiDemoCard />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-3 mb-10 text-center">
              <div className="inline-flex items-center gap-2 text-primary">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Frequently asked
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                Common questions about planning with UtsavAI
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-border rounded-md px-5 bg-card"
                >
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => navigate({ kind: "public", view: "faq" })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="View all frequently asked questions"
              >
                Have more questions? Browse all FAQs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 bg-neutral-900 text-neutral-100 dark:bg-neutral-950 dark:text-neutral-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo variant="light" size={36} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display max-w-2xl mx-auto text-white">
              Start planning your next celebration today.
            </h2>
            <p className="mt-3 text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
              Create your first event in minutes. Generate a plan, manage your
              budget, track your tasks, and stay organized until event day.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate({ kind: "public", view: "register" })}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Planning
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate({ kind: "public", view: "login" })}
                className="text-neutral-100 hover:text-white hover:bg-white/10"
              >
                Login
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function HeroDashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" aria-hidden="true" />
      <Card className="relative p-0 overflow-hidden shadow-sm">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/40">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            UtsavAI / Dashboard
          </span>
          <span className="text-xs text-muted-foreground">Demo</span>
        </div>

        <div className="grid grid-cols-12 gap-0 min-h-[420px]">
          {/* Sidebar */}
          <aside className="col-span-3 border-r border-border bg-secondary/30 p-3 hidden sm:block">
            <div className="flex items-center gap-2 px-2 py-2 mb-3">
              <Logo size={22} withText={false} alt="UtsavAI logo mark" />
              <span className="text-xs font-semibold">UtsavAI</span>
            </div>
            <div className="space-y-1">
              {["Dashboard", "Overview", "Budget", "Tasks", "Timeline", "Vendors", "Guests", "Event-Day", "AI Assistant"].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "px-2 py-1.5 rounded text-xs",
                    i === 0
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/70"
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="col-span-12 sm:col-span-9 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Current event</p>
                <p className="text-lg font-semibold font-display">Wedding Celebration</p>
                <p className="text-xs text-muted-foreground">15 December 2026</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/15">
                42 days remaining
              </Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <PreviewStat label="Budget" value="₹2.37 L / ₹5 L" hint="47% used" />
              <PreviewStat label="Tasks" value="2 / 15" hint="13% complete" />
              <PreviewStat label="Guests" value="10" hint="3 pending RSVP" />
              <PreviewStat label="Vendors" value="1 booked" hint="5 in progress" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="border border-border rounded-md p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Upcoming
                </p>
                <div className="space-y-2">
                  {[
                    { t: "Complete guest list", d: "Due 30 Oct" },
                    { t: "Finalize caterer and menu", d: "Due 5 Nov" },
                    { t: "Confirm photographer", d: "Due 10 Nov" },
                  ].map((item) => (
                    <div key={item.t} className="flex items-center justify-between text-xs">
                      <span className="text-foreground/80">{item.t}</span>
                      <span className="text-muted-foreground">{item.d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border rounded-md p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Budget by category
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Venue", pct: 100, color: "oklch(0.55 0.14 35)" },
                    { label: "Food", pct: 25, color: "oklch(0.65 0.13 70)" },
                    { label: "Photography", pct: 25, color: "oklch(0.60 0.10 220)" },
                    { label: "Decoration", pct: 22, color: "oklch(0.50 0.10 150)" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground/80">{row.label}</span>
                        <span className="text-muted-foreground">{row.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PreviewStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border border-border rounded-md p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function AiDemoCard() {
  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <div className="border-b border-border px-4 py-2.5 flex items-center justify-between bg-secondary/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">AI Planning Assistant</span>
        </div>
        <span className="text-[10px] text-muted-foreground">Wedding Celebration</span>
      </div>
      <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto scroll-area-thin">
        {aiDemoConversation.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-md px-3 py-2 text-xs leading-relaxed whitespace-pre-line",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground border border-border"
              )}
            >
              {m.content}
              {m.role === "assistant" && (
                <p className="mt-2 text-[10px] opacity-70 border-t border-border pt-1.5">
                  AI-generated. Review and adjust as needed.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-3 flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-xs text-muted-foreground">
          Ask anything about your event...
        </div>
        <Button size="sm" disabled>
          Send
        </Button>
      </div>
    </Card>
  );
}

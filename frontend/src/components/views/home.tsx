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
      "Export your plan as PDF or calendar file. Event summary, budget, tasks, timeline, vendors, guests, schedule.",
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
    a: "This is a frontend showcase with realistic demo data. When connected to a real backend, your events, tasks, and guests would be stored securely under your account.",
  },
  {
    q: "Can I export my plan?",
    a: "Yes. You can export your event summary, budget, tasks, timeline, vendors, guests, and event-day schedule as a PDF or calendar file.",
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
      <main className="flex-1">
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
                    <ArrowRight className="h-4 w-4 ml-1.5" />
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
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" style={{ color: "oklch(0.55 0.12 150)" }} />
                    No vendor lock-in
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "oklch(0.55 0.12 150)" }} />
                    Works on mobile
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "oklch(0.55 0.12 150)" }} />
                    AI plan generation
                  </span>
                </div>
              </div>

              <HeroDashboardPreview />
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
                Built for any kind of event
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                The same interface adapts to weddings, birthdays, community
                gatherings, family occasions, and anything else worth
                celebrating.
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
                Everything you need to plan, in one place
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Each feature is built to do real work, not to look impressive on
                a marketing page.
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
                How it works
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Four steps from a blank canvas to a managed plan.
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
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI planning assistant
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                  Ask anything. Get event-aware answers.
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  The assistant knows which event is selected, your tasks,
                  budget, and timeline. Ask what to prioritize, what is overdue,
                  or how to reduce your budget.
                </p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "oklch(0.55 0.12 150)" }} />
                    <span>Event context included in every answer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "oklch(0.55 0.12 150)" }} />
                    <span>Suggested prompts to get you started.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "oklch(0.55 0.12 150)" }} />
                    <span>Clearly marked AI-generated responses.</span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  onClick={() => navigate({ kind: "public", view: "register" })}
                >
                  Try the assistant
                  <ArrowRight className="h-4 w-4 ml-1.5" />
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
                <HelpCircle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Frequently asked
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-display">
                Questions, answered
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
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo variant="light" size={36} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display max-w-2xl mx-auto">
              Start planning your next celebration today.
            </h2>
            <p className="mt-3 text-base text-background/70 max-w-xl mx-auto leading-relaxed">
              Create your first event in minutes. Generate a plan, manage your
              budget, track your tasks, and stay organized until event day.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate({ kind: "public", view: "register" })}
              >
                Start Planning
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate({ kind: "public", view: "login" })}
                className="text-background hover:text-background hover:bg-background/10"
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
              <Logo size={22} withText={false} />
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

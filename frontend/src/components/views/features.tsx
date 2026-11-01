"use client";

import {
  ArrowRight,
  Sparkles,
  IndianRupee,
  ListChecks,
  CalendarDays,
  Store,
  Users,
  Clock,
  Wand2,
  Bell,
  FileDown,
  CheckCircle2,
} from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const features = [
  {
    icon: Sparkles,
    title: "Smart Event Planning",
    summary:
      "Generate a comprehensive starter plan tailored to your event type, guest count, and budget. UtsavAI creates structured task checklists, milestone schedules, and suggested expense distributions that you can review, edit, or regenerate section by section.",
    points: [
      "AI drafts tasks, timeline milestones, and budget allocations",
      "Review, edit, and accept plan sections independently",
      "Regenerate specific sections without losing custom edits",
      "Deterministic fallback ensures complete plans even offline",
    ],
  },
  {
    icon: IndianRupee,
    title: "Event Budget Management",
    summary:
      "Maintain full financial control with transparent category breakdowns. Set total target budgets, allocate planned amounts for venue, catering, decor, photography, and entertainment, record actual expenditures, and preserve a dedicated contingency buffer.",
    points: [
      "Interactive category breakdown charts with planned vs. actual spending",
      "Automated budget alerts when spending approaches category limits",
      "Dedicated contingency line kept separate and visible to protect against surprise costs",
      "Native INR currency formatting tailored for Indian celebration scales",
    ],
  },
  {
    icon: ListChecks,
    title: "Task Management & Priorities",
    summary:
      "Organize your celebration checklist with priority levels, ownership assignment, due dates, and status updates so every planning detail is completed on schedule.",
    points: [
      "Three statuses: Not Started, In Progress, and Completed",
      "Four priority tiers: Low, Medium, High, and Critical",
      "Ownership assignment and clear due dates for every task",
      "Automated overdue highlighting to keep celebration milestones on track",
    ],
  },
  {
    icon: CalendarDays,
    title: "Planning Milestones & Timeline",
    summary:
      "Visualize your celebration journey from initial kickoff to event eve. Track key deadlines, payment milestones, and task deliverables on a clear chronological progression that remains distinct from the day-of operational schedule.",
    points: [
      "Chronological milestone progression distinct from event-day run sheet",
      "Completion percentage and status indicators per milestone",
      "Surfaces critical path delays before they impact the celebration",
      "Designed for clarity without overwhelming Gantt chart complexity",
    ],
  },
  {
    icon: Store,
    title: "Vendor Management Workspace",
    summary:
      "Manage all your event service providers in an unbundled workspace with zero middleman fees. Log quotes, compare estimated vs. actual invoices, track booking statuses from research to booked, and keep contact details accessible.",
    points: [
      "Track vendors across research, contacted, shortlisted, and booked stages",
      "Record vendor categories, contact details, quotes, and custom notes",
      "Side-by-side comparison of estimated quotes versus actual invoices",
      "Pure management workspace — you hire and negotiate on your own terms",
    ],
  },
  {
    icon: Users,
    title: "Guest List & RSVP Tracking",
    summary:
      "Streamline guest coordination across families, friends, and VIP groups. Track digital RSVPs, meal and dietary preferences, plus-ones, and contact details with real-time response summaries.",
    points: [
      "Real-time summary breakdown: Attending, Declined, and Pending RSVPs",
      "Organize guests by family clusters, tables, or relationship groups",
      "Track meal preferences (vegetarian, non-vegetarian, dietary restrictions)",
      "High-capacity guest list tools with mobile-optimized filtering",
    ],
  },
  {
    icon: Clock,
    title: "Event-Day Hourly Schedule",
    summary:
      "Execute smoothly on the day of the celebration with a dedicated mobile-first operational run sheet. Monitor current and upcoming ceremony activities, venue locations, assigned coordinators, and live status adjustments in real time.",
    points: [
      "Mobile-first operational view designed for coordinators on event day",
      "Current ceremony activity and upcoming items highlighted automatically",
      "Exact start/end times, venue hall locations, and responsible leads",
      "Quick one-tap status updates as celebrations unfold",
    ],
  },
  {
    icon: Wand2,
    title: "AI Planning Assistant",
    summary:
      "Get context-aware planning advice on demand. Ask how to reduce budget variances, prioritize overdue tasks, or sequence traditional ceremonies with an assistant that understands your specific event context.",
    points: [
      "Deeply aware of currently selected event tasks, budget, and dates",
      "Proactively surfaces budget risks and overdue milestone bottlenecks",
      "Curated quick prompts for wedding, birthday, and festival planning",
      "Transparent AI: all generated responses are clearly labeled",
    ],
  },
  {
    icon: Bell,
    title: "Event Notifications & Reminders",
    summary:
      "Stay ahead of planning deadlines with centralized notifications. Receive actionable alerts for approaching task due dates, budget thresholds, vendor payment milestones, and pending guest RSVPs.",
    points: [
      "Actionable alerts for overdue tasks, budget limits, and vendor milestones",
      "Clear unread counters with single-click 'Mark all read' control",
      "Direct navigation from notifications to relevant task or vendor records",
      "Event-specific alert isolation ensures multi-event planners stay focused",
    ],
  },
  {
    icon: FileDown,
    title: "Event Export & Plan Preview",
    summary:
      "Preview your complete celebration plan in a structured view before sharing with family and co-planners: event summary, budget breakdown, tasks, timeline, vendors, guests, and schedule.",
    points: [
      "Comprehensive preview: Event summary, budget, tasks, timeline, vendors",
      "Full export preview of guest lists with RSVP statuses and meal preferences",
      "Complete hour-by-hour event day schedule ready for print or sharing",
      "Full in-browser preview across all sections; direct PDF/ICS file download planned for production release",
    ],
  },
];

export function FeaturesView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Features
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight font-display text-foreground leading-tight">
              All the tools you need to plan a celebration.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              From budget tracking and task management to vendor coordination, guest RSVPs, and hour-by-hour event-day schedules.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            {features.map((f, i) => (
              <Card key={f.title} className="p-6 sm:p-8 gap-0">
                <div className="grid gap-6 lg:grid-cols-12 items-start">
                  <div className="lg:col-span-4 space-y-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-semibold font-display text-foreground">
                      <span className="text-muted-foreground/50 text-base font-normal mr-2">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {f.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.summary}
                    </p>
                  </div>
                  <div className="lg:col-span-8 grid gap-2 sm:grid-cols-2">
                    {f.points.map((p) => (
                      <div key={p} className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          className="h-4 w-4 mt-0.5 shrink-0"
                          style={{ color: "oklch(0.55 0.12 150)" }}
                          aria-hidden="true"
                        />
                        <span className="text-foreground/80 leading-relaxed">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
              Try every event planning feature with realistic celebration data.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Explore interactive weddings, birthdays, and community festivals. Test budget allocation charts,
              manage task dependencies, review vendor records, and test the event-aware AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate({ kind: "public", view: "register" })}
              >
                Start Planning Free
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ kind: "public", view: "faq" })}
              >
                View Planning FAQs
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

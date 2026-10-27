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
    summary: "Generate a complete plan from your event details.",
    points: [
      "AI drafts tasks, timeline, and budget suggestions",
      "Review, edit, and accept pieces independently",
      "Regenerate sections without losing your changes",
      "Clear visual progress while the plan builds",
    ],
  },
  {
    icon: IndianRupee,
    title: "Budget Management",
    summary: "Total budget, planned, spent, and remaining at a glance.",
    points: [
      "Category breakdown with charts that aid understanding",
      "Planned versus actual spending per category",
      "Contingency line kept separate and visible",
      "INR currency with Indian number formatting",
    ],
  },
  {
    icon: ListChecks,
    title: "Task Management",
    summary: "Status, priority, owner, due date, dependencies.",
    points: [
      "Three statuses: Not Started, In Progress, Completed",
      "Four priorities: Low, Medium, High, Critical",
      "Dependencies and overdue highlighting",
      "Quick status changes from the list",
    ],
  },
  {
    icon: CalendarDays,
    title: "Planning Timeline",
    summary: "Milestones from today to event day, visually distinct.",
    points: [
      "Separate from event-day schedule",
      "Completion tracking per milestone",
      "Overdue tasks surfaced clearly",
      "Visual progression, not a Gantt chart",
    ],
  },
  {
    icon: Store,
    title: "Vendor Management",
    summary: "A workspace, not a marketplace.",
    points: [
      "Track from research to booking to completion",
      "Categories, contacts, costs, and notes",
      "Estimated versus actual cost comparison",
      "Search, filter, and detail views",
    ],
  },
  {
    icon: Users,
    title: "Guest Management",
    summary: "RSVPs, meal preferences, special requirements.",
    points: [
      "Pending, Accepted, Declined summary",
      "Group or family organization",
      "Meal preference and plus-one tracking",
      "Large-list tools and mobile-friendly design",
    ],
  },
  {
    icon: Clock,
    title: "Event-Day Schedule",
    summary: "A dedicated operational screen for the day itself.",
    points: [
      "Mobile-first design for event-day use",
      "Current activity and next-up highlighted",
      "Time, location, owner, and status",
      "Quick status updates as the day unfolds",
    ],
  },
  {
    icon: Wand2,
    title: "AI Planning Assistant",
    summary: "Event-aware chat that knows your context.",
    points: [
      "Knows which event is currently selected",
      "Surfaces overdue tasks and budget risks",
      "Suggested prompts to get you started",
      "Responses clearly marked as AI-generated",
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    summary: "All your alerts in one place.",
    points: [
      "Task overdue, deadline, budget, vendor, guest reminders",
      "Read and unread states",
      "Mark one or all as read",
      "Linked to the relevant event",
    ],
  },
  {
    icon: FileDown,
    title: "Export",
    summary: "Preview your plan before sharing.",
    points: [
      "Preview event summary, budget, tasks, timeline",
      "Preview vendors, guests, and event-day schedule",
      "PDF and ICS file download planned for production",
      "Tabbed preview organized by section",
    ],
  },
];

export function FeaturesView() {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1">
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Features
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight font-display text-foreground leading-tight">
              Every feature does real work.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              No decorative dashboards, no vanity metrics. Each capability in
              UtsavAI exists to make planning a celebration calmer and more
              organized.
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
              Try every feature with realistic demo data.
            </h2>
            <p className="text-sm text-muted-foreground">
              The showcase includes a full wedding event, a birthday, and a
              community get-together. Explore the dashboard, edit tasks, change
              RSVPs, and chat with the AI assistant.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ kind: "public", view: "register" })}
            >
              Start Planning
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

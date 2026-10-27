"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  ListChecks,
  Store,
  Sparkles,
  Pencil,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CalendarRange,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  tasksForEvent,
  vendorsForEvent,
  guestsForEvent,
  expensesForEvent,
  timelineForEvent,
  eventTypeMeta,
} from "@/lib/mock-data";
import { formatINR, formatINRShort, formatDate, daysUntil } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatTile } from "@/components/shared/stat-tile";
import { ToneBadge } from "@/components/shared/status-pill";
import { cn } from "@/lib/utils";

export function EventOverviewView() {
  const navigate = useAppStore((s) => s.navigate);
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const tasks = useAppStore((s) => s.tasks);
  const vendors = useAppStore((s) => s.vendors);
  const guests = useAppStore((s) => s.guests);
  const expenses = useAppStore((s) => s.expenses);
  const milestones = useAppStore((s) => s.milestones);

  const event = events.find((e) => e.id === currentEventId);
  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No event selected.</p>
      </div>
    );
  }

  const eventTasks = tasksForEvent(tasks, event.id);
  const eventVendors = vendorsForEvent(vendors, event.id);
  const eventGuests = guestsForEvent(guests, event.id);
  const eventExpenses = expensesForEvent(expenses, event.id);
  const eventMilestones = timelineForEvent(milestones, event.id);

  const days = daysUntil(event.date);
  const completedTasks = eventTasks.filter((t) => t.status === "completed").length;
  const taskPct = eventTasks.length > 0 ? (completedTasks / eventTasks.length) * 100 : 0;
  const totalSpent = eventExpenses.reduce((sum, e) => sum + e.actualAmount, 0);
  const budgetPct = event.totalBudget > 0 ? (totalSpent / event.totalBudget) * 100 : 0;
  const acceptedGuests = eventGuests.filter((g) => g.rsvp === "accepted").length;
  const pendingGuests = eventGuests.filter((g) => g.rsvp === "pending").length;

  const upcomingTasks = eventTasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const overdueTasks = eventTasks.filter(
    (t) => t.status !== "completed" && new Date(t.dueDate).getTime() < Date.now()
  );

  const upcomingMilestones = eventMilestones
    .filter((m) => !m.completed)
    .slice(0, 4);

  const risks = buildRisks({ overdueCount: overdueTasks.length, pendingRsvp: pendingGuests, budgetPct, daysUntil: days });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Event workspace"
        title={event.name}
        description={`${eventTypeMeta[event.type].label} - ${formatDate(event.date, "long")}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ kind: "app", view: "edit_event" })}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit event
            </Button>
            <Button onClick={() => navigate({ kind: "app", view: "ai_assistant" })}>
              <Sparkles className="h-4 w-4 mr-1.5" />
              Ask AI
            </Button>
          </>
        }
      />

      {/* Event details banner */}
      <Card className="overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: event.coverColor }} aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailRow icon={CalendarDays} label="Date" value={formatDate(event.date, "long")} />
            <DetailRow icon={Clock} label="Time" value={`${event.startTime} - ${event.endTime}`} />
            <DetailRow icon={MapPin} label="Location" value={event.location} />
            <DetailRow icon={Users} label="Expected guests" value={String(event.expectedGuests)} />
          </div>
          {(event.theme || event.style) && (
            <div className="mt-4 pt-4 border-t border-border grid gap-4 sm:grid-cols-2">
              {event.theme && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Theme</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{event.theme}</p>
                </div>
              )}
              {event.style && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Style</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{event.style}</p>
                </div>
              )}
            </div>
          )}
          {event.priorities && event.priorities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Priorities</p>
              <div className="flex flex-wrap gap-1.5">
                {event.priorities.map((p) => (
                  <Badge key={p} variant="outline" className="text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {event.specialRequirements && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Special requirements</p>
              <p className="text-sm text-foreground mt-0.5">{event.specialRequirements}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Days to event"
          value={days < 0 ? "Passed" : String(days)}
          hint={days < 0 ? "Event date has passed" : days === 1 ? "1 day to go" : `${days} days to go`}
          icon={CalendarDays}
          accent={event.coverColor ?? "oklch(0.55 0.14 35)"}
        />
        <StatTile
          label="Budget used"
          value={`${Math.round(budgetPct)}%`}
          hint={`${formatINRShort(totalSpent)} of ${formatINRShort(event.totalBudget)}`}
          icon={IndianRupee}
          accent="oklch(0.55 0.14 35)"
        />
        <StatTile
          label="Tasks complete"
          value={`${completedTasks}/${eventTasks.length}`}
          hint={`${Math.round(taskPct)}% done`}
          icon={ListChecks}
          accent="oklch(0.55 0.12 150)"
        />
        <StatTile
          label="Guests"
          value={`${acceptedGuests}/${event.expectedGuests}`}
          hint={`${pendingGuests} pending`}
          icon={Users}
          accent="oklch(0.55 0.10 320)"
        />
      </div>

      {/* Progress bars */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Tasks progress</p>
            <span className="text-xs text-muted-foreground">{Math.round(taskPct)}%</span>
          </div>
          <Progress value={taskPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedTasks} of {eventTasks.length} tasks completed
          </p>
        </Card>
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Budget utilization</p>
            <span className="text-xs text-muted-foreground">{Math.round(budgetPct)}%</span>
          </div>
          <Progress value={budgetPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {formatINRShort(totalSpent)} of {formatINRShort(event.totalBudget)} used
          </p>
        </Card>
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">RSVP response</p>
            <span className="text-xs text-muted-foreground">
              {eventGuests.length > 0 ? Math.round((acceptedGuests / eventGuests.length) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={eventGuests.length > 0 ? (acceptedGuests / eventGuests.length) * 100 : 0}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {acceptedGuests} accepted, {pendingGuests} pending
          </p>
        </Card>
      </div>

      {/* Two columns: upcoming tasks + risks */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold font-display text-foreground">
              Upcoming tasks
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate({ kind: "app", view: "tasks" })}>
              View all
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: "oklch(0.55 0.12 150)" }} />
              <p className="text-sm text-muted-foreground">All tasks complete.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.map((task) => {
                const overdue = new Date(task.dueDate).getTime() < Date.now();
                return (
                  <li key={task.id} className="flex items-start gap-2.5 py-2 border-b border-border/60 last:border-0">
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full mt-2 shrink-0")}
                      style={{ backgroundColor: overdue ? "oklch(0.55 0.18 25)" : "oklch(0.65 0.01 70)" }}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.owner ? `${task.owner} - ` : ""}
                        {formatDate(task.dueDate, "short")}
                      </p>
                    </div>
                    {overdue && <ToneBadge tone="danger">Overdue</ToneBadge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5 gap-0">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" style={{ color: "oklch(0.55 0.10 70)" }} />
            <h3 className="text-base font-semibold font-display text-foreground">
              Risk warnings
            </h3>
          </div>
          {risks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: "oklch(0.55 0.12 150)" }} />
              <p className="text-sm text-muted-foreground">No active risks.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {risks.map((r, i) => (
                <li
                  key={i}
                  className="p-3 rounded-md border border-border bg-secondary/40"
                  style={r.tone === "danger" ? {
                    backgroundColor: "oklch(0.55 0.18 25 / 0.05)",
                    borderColor: "oklch(0.55 0.18 25 / 0.18)",
                  } : r.tone === "warning" ? {
                    backgroundColor: "oklch(0.72 0.13 70 / 0.08)",
                    borderColor: "oklch(0.72 0.13 70 / 0.2)",
                  } : undefined}
                >
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Timeline + Quick links */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 gap-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-display text-foreground">
              Upcoming milestones
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate({ kind: "app", view: "timeline" })}>
              <CalendarRange className="h-3.5 w-3.5 mr-1" />
              Timeline
            </Button>
          </div>
          {upcomingMilestones.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No upcoming milestones.
            </p>
          ) : (
            <ol className="relative space-y-3 border-l-2 border-border pl-5">
              {upcomingMilestones.map((m) => (
                <li key={m.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background" />
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(m.date, "short")}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="p-5 gap-0">
          <h3 className="text-base font-semibold font-display text-foreground mb-3">
            Quick links
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Budget", view: "budget" as const, icon: IndianRupee },
              { label: "Tasks", view: "tasks" as const, icon: ListChecks },
              { label: "Vendors", view: "vendors" as const, icon: Store },
              { label: "Guests", view: "guests" as const, icon: Users },
              { label: "Timeline", view: "timeline" as const, icon: CalendarRange },
              { label: "Event-Day", view: "event_day" as const, icon: Clock },
            ].map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => navigate({ kind: "app", view: q.view })}
                className="flex items-center gap-2 p-3 rounded-md border border-border hover:border-foreground/30 transition-colors text-left"
              >
                <q.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{q.label}</span>
                <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function buildRisks(ctx: {
  overdueCount: number;
  pendingRsvp: number;
  budgetPct: number;
  daysUntil: number;
}) {
  const risks: { title: string; description: string; tone: "danger" | "warning" | "info" }[] = [];
  if (ctx.overdueCount > 0) {
    risks.push({
      title: `${ctx.overdueCount} overdue task${ctx.overdueCount > 1 ? "s" : ""}`,
      description: "Reschedule or reassign these to keep the timeline on track.",
      tone: "danger",
    });
  }
  if (ctx.pendingRsvp > 5) {
    risks.push({
      title: `${ctx.pendingRsvp} pending RSVPs`,
      description: "Send a gentle reminder to guests who have not responded yet.",
      tone: "warning",
    });
  }
  if (ctx.budgetPct >= 90) {
    risks.push({
      title: "Budget critically high",
      description: `Spending has reached ${Math.round(ctx.budgetPct)}% of the total budget. Halt new commitments until spending is reviewed.`,
      tone: "danger",
    });
  } else if (ctx.budgetPct >= 80) {
    risks.push({
      title: "Budget approaching critical",
      description: `Spending is at ${Math.round(ctx.budgetPct)}% of total. Approaching the 90% threshold - review upcoming expenses carefully.`,
      tone: "warning",
    });
  }
  if (ctx.daysUntil <= 14 && ctx.daysUntil > 0) {
    risks.push({
      title: "Event day approaching",
      description: "Confirm all vendor arrival times in writing this week.",
      tone: "warning",
    });
  }
  return risks;
}

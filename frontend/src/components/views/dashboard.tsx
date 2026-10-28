"use client";

import {
  CalendarDays,
  IndianRupee,
  ListChecks,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Store,
  CalendarRange,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  formatINR,
  formatINRShort,
  formatDate,
  daysUntil,
  relativeTime,
} from "@/lib/format";
import { eventTypeMeta } from "@/lib/mock-data";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatTile } from "@/components/shared/stat-tile";
import { ToneBadge } from "@/components/shared/status-pill";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const navigate = useAppStore((s) => s.navigate);
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const tasks = useAppStore((s) => s.tasks);
  const vendors = useAppStore((s) => s.vendors);
  const guests = useAppStore((s) => s.guests);
  const expenses = useAppStore((s) => s.expenses);
  const notifications = useAppStore((s) => s.notifications);

  const event = events.find((e) => e.id === currentEventId);
  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No event selected.</p>
        <Button onClick={() => navigate({ kind: "app", view: "create_event" })} className="mt-4">
          Create an event
        </Button>
      </div>
    );
  }

  const eventTasks = tasks.filter((task) => task.eventId === event.id);
  const eventVendors = vendors.filter((vendor) => vendor.eventId === event.id);
  const eventGuests = guests.filter((guest) => guest.eventId === event.id);
  const eventExpenses = expenses.filter((expense) => expense.eventId === event.id);

  const days = daysUntil(event.date);
  const completedTasks = eventTasks.filter((t) => t.status === "completed").length;
  const taskPct = eventTasks.length > 0 ? (completedTasks / eventTasks.length) * 100 : 0;
  const totalSpent = eventExpenses.reduce((sum, e) => sum + e.actualAmount, 0);
  const budgetPct = event.totalBudget > 0 ? (totalSpent / event.totalBudget) * 100 : 0;
  const acceptedGuests = eventGuests.filter((g) => g.rsvp === "accepted").length;
  const pendingGuests = eventGuests.filter((g) => g.rsvp === "pending").length;
  const bookedVendors = eventVendors.filter((v) => v.status === "booked").length;

  const upcomingTasks = eventTasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const overdueTasks = eventTasks.filter(
    (t) => t.status !== "completed" && new Date(t.dueDate).getTime() < Date.now()
  );

  const recentNotifications = notifications.slice(0, 4);

  const aiRecommendations = generateDashboardRecommendations({
    daysUntilEvent: days,
    overdueCount: overdueTasks.length,
    budgetPct,
    pendingRsvp: pendingGuests,
    unbookedVendors: eventVendors.filter((v) => v.status !== "booked" && v.status !== "completed").length,
  });

  return (
    <div className="space-y-6">
      {/* Hero event header */}
      <Card className="overflow-hidden">
        <div
          className="h-2"
          style={{ backgroundColor: event.coverColor }}
          aria-hidden="true"
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {eventTypeMeta[event.type].label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created {relativeTime(event.createdAt)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(event.date, "long")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {event.startTime} - {event.endTime}
                </span>
                {event.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Days remaining
              </p>
              <p
                className={cn(
                  "text-4xl font-semibold font-display tracking-tight",
                  days < 0 ? "text-muted-foreground" : days < 14 ? "text-warning-foreground" : "text-foreground"
                )}
                style={
                  days < 14 && days >= 0
                    ? { color: "oklch(0.55 0.10 70)" }
                    : undefined
                }
              >
                {days < 0 ? "Passed" : days}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {days < 0 ? "Event date has passed" : days === 1 ? "day to go" : "days to go"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat tiles */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Budget"
          value={formatINRShort(totalSpent)}
          hint={`of ${formatINRShort(event.totalBudget)} total`}
          icon={IndianRupee}
          accent="oklch(0.55 0.14 35)"
        >
          <Progress value={budgetPct} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(budgetPct)}% used
          </p>
        </StatTile>

        <StatTile
          label="Tasks"
          value={`${completedTasks} / ${eventTasks.length}`}
          hint={`${eventTasks.length - completedTasks} remaining`}
          icon={ListChecks}
          accent="oklch(0.55 0.12 150)"
        >
          <Progress value={taskPct} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(taskPct)}% complete
          </p>
        </StatTile>

        <StatTile
          label="Guests tracked"
          value={String(eventGuests.length)}
          hint={`${acceptedGuests} accepted, ${pendingGuests} pending of ${event.expectedGuests} expected`}
          icon={Users}
          accent="oklch(0.55 0.10 320)"
        >
          <div className="flex gap-1">
            <ToneBadge tone="success">{acceptedGuests}</ToneBadge>
            <ToneBadge tone="warning">{pendingGuests}</ToneBadge>
          </div>
        </StatTile>

        <StatTile
          label="Vendors"
          value={`${bookedVendors} / ${eventVendors.length}`}
          hint="booked"
          icon={Store}
          accent="oklch(0.65 0.13 70)"
        >
          <div className="flex gap-1 flex-wrap">
            {eventVendors.slice(0, 4).map((v) => (
              <span
                key={v.id}
                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground/70"
              >
                {v.name.split(" ").slice(0, 2).join(" ")}
              </span>
            ))}
          </div>
        </StatTile>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Upcoming tasks */}
        <Card className="p-5 gap-0 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold font-display text-foreground">
                Upcoming tasks
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Next deadlines for {event.name}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ kind: "app", view: "tasks" })}>
              View all
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <ListChecks className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No open tasks. Everything is complete.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {upcomingTasks.map((task) => {
                const overdue = new Date(task.dueDate).getTime() < Date.now();
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => navigate({ kind: "app", view: "tasks" })}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-secondary/60 transition-colors"
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          overdue ? "bg-destructive" : "bg-muted-foreground/40"
                        )}
                        style={overdue ? { backgroundColor: "oklch(0.55 0.18 25)" } : undefined}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.owner ? `${task.owner} - ` : ""}
                          {formatDate(task.dueDate, "short")}
                        </p>
                      </div>
                      {overdue && (
                        <ToneBadge tone="danger">Overdue</ToneBadge>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* AI recommendations */}
        <Card className="p-5 gap-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold font-display text-foreground">
              AI recommendations
            </h2>
          </div>
          <ul className="space-y-3">
            {aiRecommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="h-1.5 w-1.5 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: r.color }}
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {r.text}
                </p>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate({ kind: "app", view: "ai_assistant" })}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Ask the assistant
          </Button>
        </Card>

        {/* Risks */}
        {overdueTasks.length > 0 && (
          <Card className="p-5 gap-0 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "oklch(0.55 0.18 25 / 0.12)", color: "oklch(0.55 0.18 25)" }}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold font-display text-foreground">
                Important risks
              </h2>
            </div>
            <ul className="space-y-2">
              {overdueTasks.slice(0, 4).map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20"
                  style={{
                    backgroundColor: "oklch(0.55 0.18 25 / 0.04)",
                    borderColor: "oklch(0.55 0.18 25 / 0.18)",
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Was due {formatDate(task.dueDate, "short")}
                    </p>
                  </div>
                  <ToneBadge tone="danger">Overdue</ToneBadge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Quick actions */}
        <Card className="p-5 gap-0">
          <h2 className="text-base font-semibold font-display text-foreground mb-3">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction
              label="Add task"
              icon={ListChecks}
              onClick={() => navigate({ kind: "app", view: "tasks" })}
            />
            <QuickAction
              label="Add expense"
              icon={IndianRupee}
              onClick={() => navigate({ kind: "app", view: "expenses" })}
            />
            <QuickAction
              label="Add vendor"
              icon={Store}
              onClick={() => navigate({ kind: "app", view: "vendors" })}
            />
            <QuickAction
              label="Add guest"
              icon={Users}
              onClick={() => navigate({ kind: "app", view: "guests" })}
            />
            <QuickAction
              label="View timeline"
              icon={CalendarRange}
              onClick={() => navigate({ kind: "app", view: "timeline" })}
            />
            <QuickAction
              label="Event-day"
              icon={Clock}
              onClick={() => navigate({ kind: "app", view: "event_day" })}
            />
          </div>
        </Card>

        {/* Recent notifications */}
        <Card className="p-5 gap-0 lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold font-display text-foreground">
              Recent activity
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate({ kind: "app", view: "notifications" })}>
              View all
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {recentNotifications.map((n) => (
              <li key={n.id} className="py-2.5 flex items-start gap-3">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full mt-2 shrink-0",
                    n.read ? "bg-transparent" : "bg-primary"
                  )}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {relativeTime(n.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof ListChecks;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-md border border-border bg-card hover:border-foreground/30 transition-colors text-center"
    >
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

function generateDashboardRecommendations(ctx: {
  daysUntilEvent: number;
  overdueCount: number;
  budgetPct: number;
  pendingRsvp: number;
  unbookedVendors: number;
}) {
  const recs: { text: string; color: string }[] = [];
  if (ctx.overdueCount > 0) {
    recs.push({
      text: `You have ${ctx.overdueCount} overdue task${ctx.overdueCount > 1 ? "s" : ""}. Reassign or push due dates to keep the timeline stable.`,
      color: "oklch(0.55 0.18 25)",
    });
  }
  if (ctx.daysUntilEvent <= 14 && ctx.daysUntilEvent > 0) {
    recs.push({
      text: `${ctx.daysUntilEvent} days to go. Confirm all vendor arrival times in writing this week.`,
      color: "oklch(0.55 0.10 70)",
    });
  }
  if (ctx.pendingRsvp > 0) {
    recs.push({
      text: `${ctx.pendingRsvp} guest${ctx.pendingRsvp > 1 ? "s have" : " has"} not responded. Send a gentle RSVP reminder.`,
      color: "oklch(0.55 0.10 320)",
    });
  }
  if (ctx.unbookedVendors > 0 && ctx.daysUntilEvent < 60) {
    recs.push({
      text: `${ctx.unbookedVendors} vendor${ctx.unbookedVendors > 1 ? "s" : ""} still not booked. Popular vendors get harder to confirm close to the date.`,
      color: "oklch(0.65 0.13 70)",
    });
  }
  if (ctx.budgetPct >= 90) {
    recs.push({
      text: `Budget is critically high at ${Math.round(ctx.budgetPct)}% utilization. Only ${Math.round(100 - ctx.budgetPct)}% remains. Review planned expenses before committing to new ones.`,
      color: "oklch(0.55 0.18 25)",
    });
  } else if (ctx.budgetPct >= 80) {
    recs.push({
      text: `Budget is at ${Math.round(ctx.budgetPct)}% utilization. Approaching the critical 90% threshold - review upcoming expenses carefully.`,
      color: "oklch(0.55 0.10 70)",
    });
  }
  if (recs.length === 0) {
    recs.push({
      text: "Everything looks on track. Use this calm period to brief family on event-day responsibilities.",
      color: "oklch(0.55 0.12 150)",
    });
  }
  return recs.slice(0, 4);
}

"use client";

import { useState } from "react";
import {
  FileDown,
  Calendar,
  IndianRupee,
  ListChecks,
  Store,
  Users,
  Clock,
  Check,
  FileText,
  CalendarPlus,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import {
  tasksForEvent,
  vendorsForEvent,
  guestsForEvent,
  expensesForEvent,
  timelineForEvent,
  scheduleForEvent,
  eventTypeMeta,
} from "@/lib/mock-data";
import { formatINR, formatINRShort, formatDate, formatTime } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function ExportView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const tasks = useAppStore((s) => s.tasks);
  const vendors = useAppStore((s) => s.vendors);
  const guests = useAppStore((s) => s.guests);
  const expenses = useAppStore((s) => s.expenses);
  const milestones = useAppStore((s) => s.milestones);
  const schedule = useAppStore((s) => s.schedule);

  const event = events.find((e) => e.id === currentEventId);
  const [exporting, setExporting] = useState<"pdf" | "ics" | null>(null);
  const [done, setDone] = useState<"pdf" | "ics" | null>(null);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const eventTasks = tasksForEvent(tasks, event.id);
  const eventVendors = vendorsForEvent(vendors, event.id);
  const eventGuests = guestsForEvent(guests, event.id);
  const eventExpenses = expensesForEvent(expenses, event.id);
  const eventMilestones = timelineForEvent(milestones, event.id);
  const eventSchedule = scheduleForEvent(schedule, event.id);

  const totalSpent = eventExpenses.reduce((s, e) => s + e.actualAmount, 0);
  const completedTasks = eventTasks.filter((t) => t.status === "completed").length;
  const acceptedGuests = eventGuests.filter((g) => g.rsvp === "accepted").length;

  const handleExport = (kind: "pdf" | "ics") => {
    setExporting(kind);
    setDone(null);
    setTimeout(() => {
      setExporting(null);
      setDone(kind);
      toast({
        title: kind === "pdf" ? "PDF preview ready" : "Calendar preview ready",
        description:
          kind === "pdf"
            ? "Preview shown below. File download is not available in this demo."
            : "Preview shown below. File download is not available in this demo.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Export"
        title="Export your event plan"
        description={`Preview ${event.name} as a PDF or calendar file. File download is not available in this demo.`}
      />

      {/* Export options */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6 space-y-3 gap-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display text-foreground">PDF document</h3>
              <p className="text-xs text-muted-foreground">Complete event summary</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Includes event summary, budget breakdown, tasks, timeline, vendors,
            guests, and event-day schedule in a print-ready format.
          </p>
          <p
            className="text-xs rounded-md p-2 border"
            style={{
              backgroundColor: "oklch(0.65 0.13 70 / 0.08)",
              borderColor: "oklch(0.65 0.13 70 / 0.2)",
              color: "oklch(0.40 0.08 60)",
            }}
          >
            Demo only: file download is not available. Preview shown below.
          </p>
          <Button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="w-full"
          >
            {exporting === "pdf" ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Preparing preview...
              </>
            ) : done === "pdf" ? (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Preview ready
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-1.5" />
                Preview PDF
              </>
            )}
          </Button>
        </Card>

        <Card className="p-6 space-y-3 gap-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-secondary text-foreground flex items-center justify-center">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display text-foreground">Calendar file</h3>
              <p className="text-xs text-muted-foreground">.ics for calendar apps</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Adds the event and key milestones to Google Calendar, Apple
            Calendar, Outlook, or any calendar app that supports the .ics format.
          </p>
          <p
            className="text-xs rounded-md p-2 border"
            style={{
              backgroundColor: "oklch(0.65 0.13 70 / 0.08)",
              borderColor: "oklch(0.65 0.13 70 / 0.2)",
              color: "oklch(0.40 0.08 60)",
            }}
          >
            Demo only: file download is not available. Preview shown below.
          </p>
          <Button
            onClick={() => handleExport("ics")}
            disabled={exporting !== null}
            variant="outline"
            className="w-full"
          >
            {exporting === "ics" ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                Preparing preview...
              </>
            ) : done === "ics" ? (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Preview ready
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-1.5" />
                Preview .ics
              </>
            )}
          </Button>
        </Card>
      </div>

      {done && (
        <div
          className="rounded-md p-4 border flex items-start gap-3"
          style={{
            backgroundColor: "oklch(0.55 0.12 150 / 0.08)",
            borderColor: "oklch(0.55 0.12 150 / 0.25)",
            color: "oklch(0.40 0.10 150)",
          }}
          role="status"
        >
          <Check className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {done === "pdf" ? "PDF preview ready" : "Calendar preview ready"}
            </p>
            <p className="text-xs mt-1 opacity-90">
              The preview below shows the data that would be included in the exported file.
              File download is not available in this demo.
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold font-display text-foreground">
          Export preview
        </h3>
        <Card className="p-0 overflow-hidden">
          <Tabs defaultValue="summary">
            <div className="border-b border-border px-4 py-2 overflow-x-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger value="summary" className="text-xs px-3 py-1.5">Summary</TabsTrigger>
                <TabsTrigger value="budget" className="text-xs px-3 py-1.5">Budget</TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs px-3 py-1.5">Tasks</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs px-3 py-1.5">Timeline</TabsTrigger>
                <TabsTrigger value="vendors" className="text-xs px-3 py-1.5">Vendors</TabsTrigger>
                <TabsTrigger value="guests" className="text-xs px-3 py-1.5">Guests</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs px-3 py-1.5">Schedule</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="summary" className="p-6 m-0">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="h-12 w-12 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${event.coverColor}18`, color: event.coverColor }}
                  >
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold font-display text-foreground">{event.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {eventTypeMeta[event.type].label} - {formatDate(event.date, "long")}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Detail label="Date" value={formatDate(event.date, "long")} />
                  <Detail label="Time" value={`${event.startTime} - ${event.endTime}`} />
                  <Detail label="Location" value={event.location} />
                  <Detail label="Expected guests" value={String(event.expectedGuests)} />
                  <Detail label="Total budget" value={formatINR(event.totalBudget)} />
                  <Detail label="Total spent" value={formatINR(totalSpent)} />
                  {event.theme && <Detail label="Theme" value={event.theme} />}
                  {event.style && <Detail label="Style" value={event.style} />}
                </div>

                {event.priorities && event.priorities.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Priorities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.priorities.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                  <StatBlock label="Tasks" value={`${completedTasks}/${eventTasks.length}`} />
                  <StatBlock label="Guests" value={`${acceptedGuests}/${eventGuests.length}`} />
                  <StatBlock label="Vendors" value={`${eventVendors.length}`} />
                  <StatBlock label="Schedule items" value={`${eventSchedule.length}`} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="p-6 m-0">
              <ExportBudget expenses={eventExpenses} totalBudget={event.totalBudget} />
            </TabsContent>

            <TabsContent value="tasks" className="p-6 m-0">
              <ExportTasks tasks={eventTasks} />
            </TabsContent>

            <TabsContent value="timeline" className="p-6 m-0">
              <ExportTimeline milestones={eventMilestones} />
            </TabsContent>

            <TabsContent value="vendors" className="p-6 m-0">
              <ExportVendors vendors={eventVendors} />
            </TabsContent>

            <TabsContent value="guests" className="p-6 m-0">
              <ExportGuests guests={eventGuests} />
            </TabsContent>

            <TabsContent value="schedule" className="p-6 m-0">
              <ExportSchedule schedule={eventSchedule} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-secondary/50">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold font-display mt-0.5">{value}</p>
    </div>
  );
}

function ExportBudget({ expenses, totalBudget }: { expenses: any[]; totalBudget: number }) {
  const totalSpent = expenses.reduce((s, e) => s + e.actualAmount, 0);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <StatBlock label="Total budget" value={formatINRShort(totalBudget)} />
        <StatBlock label="Spent" value={formatINRShort(totalSpent)} />
        <StatBlock label="Remaining" value={formatINRShort(totalBudget - totalSpent)} />
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Planned</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actual</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-3">{e.description}</td>
                <td className="p-3 text-right tabular-nums">{formatINR(e.plannedAmount)}</td>
                <td className="p-3 text-right tabular-nums">{formatINR(e.actualAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExportTasks({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">No tasks.</p>;
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <div key={t.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
          <span
            className="h-2 w-2 rounded-full mt-2 shrink-0"
            style={{
              backgroundColor:
                t.status === "completed" ? "oklch(0.55 0.12 150)" :
                t.status === "in_progress" ? "oklch(0.65 0.13 70)" :
                "oklch(0.65 0.01 70)",
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            <p className="text-xs text-muted-foreground">
              {t.owner ? `${t.owner} - ` : ""}Due {formatDate(t.dueDate, "short")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExportTimeline({ milestones }: { milestones: any[] }) {
  if (milestones.length === 0) return <p className="text-sm text-muted-foreground">No milestones.</p>;
  return (
    <ol className="relative border-l-2 border-border pl-5 space-y-3">
      {milestones.map((m) => (
        <li key={m.id} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background" />
          <p className="text-sm font-medium text-foreground">{m.title}</p>
          <p className="text-xs text-muted-foreground">{formatDate(m.date, "medium")}</p>
        </li>
      ))}
    </ol>
  );
}

function ExportVendors({ vendors }: { vendors: any[] }) {
  if (vendors.length === 0) return <p className="text-sm text-muted-foreground">No vendors.</p>;
  return (
    <div className="space-y-2">
      {vendors.map((v) => (
        <div key={v.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
          <div>
            <p className="text-sm font-medium text-foreground">{v.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{v.category} - {v.status}</p>
          </div>
          <p className="text-sm tabular-nums">{formatINR(v.estimatedCost)}</p>
        </div>
      ))}
    </div>
  );
}

function ExportGuests({ guests }: { guests: any[] }) {
  if (guests.length === 0) return <p className="text-sm text-muted-foreground">No guests.</p>;
  const accepted = guests.filter((g) => g.rsvp === "accepted").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const declined = guests.filter((g) => g.rsvp === "declined").length;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <StatBlock label="Total" value={String(guests.length)} />
        <StatBlock label="Accepted" value={String(accepted)} />
        <StatBlock label="Pending" value={String(pending)} />
        <StatBlock label="Declined" value={String(declined)} />
      </div>
      <div className="space-y-1">
        {guests.map((g) => (
          <div key={g.id} className="flex items-center justify-between py-1.5 text-sm border-b border-border last:border-0">
            <div>
              <span className="font-medium text-foreground">{g.name}</span>
              {g.group && <span className="text-xs text-muted-foreground ml-2">{g.group}</span>}
            </div>
            <span className="text-xs text-muted-foreground capitalize">{g.rsvp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportSchedule({ schedule }: { schedule: any[] }) {
  if (schedule.length === 0) return <p className="text-sm text-muted-foreground">No schedule items.</p>;
  return (
    <div className="space-y-2">
      {schedule.map((s) => (
        <div key={s.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
          <span className="text-sm font-semibold tabular-nums w-20 shrink-0">
            {formatTime(s.time)}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{s.title}</p>
            {s.location && <p className="text-xs text-muted-foreground">{s.location}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

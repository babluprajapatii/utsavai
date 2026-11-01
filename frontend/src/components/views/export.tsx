"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  Printer,
  CalendarPlus,
  ArrowDownToLine,
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
  CelebrationEvent,
  Task,
  Vendor,
  Guest,
  Expense,
  TimelineMilestone,
  ScheduleItem,
  eventTypeMeta,
} from "@/types/domain";
import { formatINR, formatINRShort, formatDate, formatTime } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { useToast } from "@/hooks/use-toast";
import { generateICS, downloadICSFile } from "@/lib/ics";

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
  const [downloadingIcs, setDownloadingIcs] = useState(false);
  const [doneAction, setDoneAction] = useState<"pdf" | "ics" | null>(null);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const eventTasks = event ? tasks.filter((task) => task.eventId === event.id) : [];
  const eventVendors = event ? vendors.filter((vendor) => vendor.eventId === event.id) : [];
  const eventGuests = event ? guests.filter((guest) => guest.eventId === event.id) : [];
  const eventExpenses = event ? expenses.filter((expense) => expense.eventId === event.id) : [];
  const eventMilestones = event ? milestones.filter((milestone) => milestone.eventId === event.id) : [];
  const eventSchedule = event ? schedule.filter((item) => item.eventId === event.id) : [];

  const totalSpent = eventExpenses.reduce((s, e) => s + e.actualAmount, 0);
  const completedTasks = eventTasks.filter((t) => t.status === "completed").length;
  const acceptedGuests = eventGuests.filter((g) => g.rsvp === "accepted").length;

  const handlePrintPdf = () => {
    setDoneAction("pdf");
    toast({
      title: "Opening print dialog",
      description: "You can print directly or select 'Save as PDF' from your browser's print destinations.",
    });
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadIcs = () => {
    setDownloadingIcs(true);
    try {
      const icsData = generateICS(
        {
          id: event.id,
          name: event.name,
          description: event.specialRequirements || event.theme,
          location: event.location,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
        },
        eventMilestones.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          date: m.date,
        }))
      );

      const filename = `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "event"}-plan.ics`;
      downloadICSFile(filename, icsData);

      setDoneAction("ics");
      toast({
        title: "Calendar file downloaded",
        description: `Saved ${filename}. Import this file into Google Calendar, Apple Calendar, or Outlook.`,
      });
    } catch {
      toast({
        title: "Calendar export failed",
        description: "Could not generate calendar file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingIcs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <SectionHeading
          eyebrow="Export"
          title="Export your event plan"
          description={`Download ${event.name} as a calendar file or print/save as a PDF document.`}
        />
      </div>

      {/* Export options */}
      <div className="grid gap-4 sm:grid-cols-2 print:hidden">
        <Card className="p-6 space-y-3 gap-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display text-foreground">Print / Save as PDF</h3>
              <p className="text-xs text-muted-foreground">Complete formatted event summary</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Formats your complete celebration plan (summary, budget, tasks, timeline, vendors, guests, schedule) for clean printing or saving to PDF via your browser.
          </p>
          <Button
            onClick={handlePrintPdf}
            className="w-full"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print or Save as PDF
          </Button>
        </Card>

        <Card className="p-6 space-y-3 gap-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-secondary text-foreground flex items-center justify-center">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display text-foreground">Calendar file (.ics)</h3>
              <p className="text-xs text-muted-foreground">Standard RFC 5545 calendar export</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Downloads a standard calendar file containing your celebration event and all planning milestones for Google Calendar, Apple Calendar, or Outlook.
          </p>
          <Button
            onClick={handleDownloadIcs}
            disabled={downloadingIcs}
            variant="outline"
            className="w-full"
          >
            {downloadingIcs ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-foreground border-t-transparent animate-spin mr-1.5" />
                Generating .ics...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4 mr-1.5" />
                Download Calendar (.ics)
              </>
            )}
          </Button>
        </Card>
      </div>

      {doneAction && (
        <div
          className="rounded-md p-4 border flex items-start gap-3 print:hidden"
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
              {doneAction === "pdf" ? "Print dialog opened" : "Calendar file downloaded"}
            </p>
            <p className="text-xs mt-1 opacity-90">
              {doneAction === "pdf"
                ? "Select 'Save as PDF' in the destination dropdown to save a digital copy, or select your printer."
                : "Your .ics file has been downloaded and is ready to import into your calendar app."}
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold font-display text-foreground print:hidden">
          Export preview
        </h3>
        <Card className="p-0 overflow-hidden print:border-none print:shadow-none">
          <Tabs defaultValue="summary">
            <div className="border-b border-border px-4 py-2 overflow-x-auto print:hidden">
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
                <div>
                  <h4 className="text-xl font-bold font-display text-foreground">{event.name}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {eventTypeMeta[event.type]?.label} &bull; {formatDate(event.date, "long")}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <StatBlock label="Budget" value={formatINRShort(event.totalBudget)} />
                  <StatBlock label="Spent" value={formatINRShort(totalSpent)} />
                  <StatBlock
                    label="Tasks"
                    value={`${completedTasks}/${eventTasks.length}`}
                  />
                  <StatBlock
                    label="RSVPs"
                    value={`${acceptedGuests}/${eventGuests.length}`}
                  />
                </div>

                <div className="space-y-2 pt-2 text-sm">
                  {event.location && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Location:</span>
                      <span className="text-foreground">{event.location}</span>
                    </div>
                  )}
                  {event.startTime && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Time:</span>
                      <span className="text-foreground">
                        {formatTime(event.startTime)}
                        {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
                      </span>
                    </div>
                  )}
                  {event.theme && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Theme:</span>
                      <span className="text-foreground">{event.theme}</span>
                    </div>
                  )}
                  {event.priorities && event.priorities.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">Priorities:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.priorities.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs font-normal">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-secondary/50 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold font-display mt-0.5">{value}</p>
    </div>
  );
}

function ExportBudget({ expenses, totalBudget }: { expenses: Expense[]; totalBudget: number }) {
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

function ExportTasks({ tasks }: { tasks: Task[] }) {
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

function ExportTimeline({ milestones }: { milestones: TimelineMilestone[] }) {
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

function ExportVendors({ vendors }: { vendors: Vendor[] }) {
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

function ExportGuests({ guests }: { guests: Guest[] }) {
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

function ExportSchedule({ schedule }: { schedule: ScheduleItem[] }) {
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

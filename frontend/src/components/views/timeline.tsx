"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarRange, Plus, Check, AlertTriangle, Clock, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/store";
import { TimelineMilestone } from "@/lib/mock-data";
import { formatDate, daysUntil } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function TimelineView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const milestones = useAppStore((s) => s.milestones);
  const toggleMilestone = useAppStore((s) => s.toggleMilestone);
  const addMilestone = useAppStore((s) => s.addMilestone);
  const deleteMilestone = useAppStore((s) => s.deleteMilestone);
  const tasks = useAppStore((s) => s.tasks);

  const event = events.find((e) => e.id === currentEventId);
  const eventMilestones = useMemo(
    () => (event ? milestones.filter((milestone) => milestone.eventId === event.id) : []),
    [milestones, event]
  );

  const eventTasks = event ? tasks.filter((task) => task.eventId === event.id) : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineMilestone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const overdueTasks = eventTasks.filter(
    (t) => t.status !== "completed" && new Date(t.dueDate).getTime() < Date.now()
  );

  // Combine into a unified timeline
  const allItems = [
    ...eventMilestones.map((m) => ({
      id: m.id,
      kind: "milestone" as const,
      title: m.title,
      date: m.date,
      description: m.description,
      completed: m.completed,
    })),
    ...overdueTasks.map((t) => ({
      id: t.id,
      kind: "task_overdue" as const,
      title: t.title,
      date: t.dueDate,
      description: t.description,
      completed: false,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const completedCount = eventMilestones.filter((m) => m.completed).length;
  const totalMilestones = eventMilestones.length;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (m: TimelineMilestone) => {
    setEditing(m);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Timeline"
        title="Planning timeline"
        description={`Milestones from today to event day for ${event.name}. This is the planning view, distinct from the event-day schedule.`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add milestone
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total milestones</p>
          <p className="text-2xl font-semibold font-display mt-1">{totalMilestones}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.45 0.10 150)" }}>
            {completedCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Overdue tasks</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.50 0.18 25)" }}>
            {overdueTasks.length}
          </p>
        </Card>
      </div>

      {overdueTasks.length > 0 && (
        <div
          className="rounded-md p-4 border flex items-start gap-3"
          style={{
            backgroundColor: "oklch(0.55 0.18 25 / 0.05)",
            borderColor: "oklch(0.55 0.18 25 / 0.2)",
            color: "oklch(0.50 0.18 25)",
          }}
          role="alert"
        >
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}</p>
            <p className="text-xs mt-1 opacity-90">
              Overdue tasks are highlighted in the timeline below. Reschedule or complete them to keep the plan on track.
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {allItems.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No milestones yet"
          description="Add milestones to track key dates from today through event day. Milestones are distinct from event-day schedule items."
          actionLabel="Add milestone"
          onAction={openAdd}
        />
      ) : (
        <Card className="p-6 sm:p-8">
          <ol className="relative border-l-2 border-border pl-8 space-y-6">
            {allItems.map((item) => {
              const days = daysUntil(item.date);
              const isPast = new Date(item.date).getTime() < Date.now();
              return (
                <li key={`${item.kind}-${item.id}`} className="relative group">
                  {/* Marker */}
                  <button
                    type="button"
                    onClick={() => item.kind === "milestone" && toggleMilestone(item.id)}
                    className={cn(
                      "absolute -left-[42px] top-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      item.completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : item.kind === "task_overdue"
                          ? "border-destructive bg-background"
                          : "border-border bg-background hover:border-foreground/30"
                    )}
                    style={
                      item.kind === "task_overdue" && !item.completed
                        ? { borderColor: "oklch(0.55 0.18 25)" }
                        : undefined
                    }
                    aria-label={item.completed ? "Mark as not done" : "Mark as done"}
                  >
                    {item.completed && <Check className="h-3 w-3" />}
                    {item.kind === "task_overdue" && !item.completed && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "oklch(0.55 0.18 25)" }}
                      />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.kind === "milestone" ? (
                          <Badge variant="outline" className="text-xs">Milestone</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ color: "oklch(0.55 0.18 25)", borderColor: "oklch(0.55 0.18 25 / 0.3)" }}
                          >
                            Overdue task
                          </Badge>
                        )}
                        {item.completed && (
                          <Badge variant="outline" className="text-xs" style={{ color: "oklch(0.55 0.12 150)", borderColor: "oklch(0.55 0.12 150 / 0.3)" }}>
                            <Check className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-base font-semibold font-display",
                        item.completed ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0 sm:text-right flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">{formatDate(item.date, "medium")}</p>
                        <p
                          className="text-xs mt-0.5"
                          style={
                            isPast && !item.completed
                              ? { color: "oklch(0.55 0.18 25)" }
                              : undefined
                          }
                        >
                          {item.completed
                            ? "Completed"
                            : days < 0
                              ? `${Math.abs(days)} days ago`
                              : days === 0
                                ? "Today"
                                : `In ${days} days`}
                        </p>
                      </div>
                      {item.kind === "milestone" && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              const m = eventMilestones.find((mm) => mm.id === item.id);
                              if (m) openEdit(m);
                            }}
                            aria-label={`Edit ${item.title}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setDeleteId(item.id)}
                            aria-label={`Delete ${item.title}`}
                            style={{ color: "oklch(0.55 0.18 25)" }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      <Card className="p-5 border-dashed">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Looking for the event-day schedule?</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This timeline tracks planning milestones before the event. For the hour-by-hour schedule on event day, use the Event-Day Schedule view.
            </p>
          </div>
        </div>
      </Card>

      <MilestoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        milestone={editing}
        eventId={event.id}
        onSave={(data) => {
          if (editing) {
            // Edit path: delete + re-add (store lacks updateMilestone)
            deleteMilestone(editing.id);
            addMilestone({ ...data, eventId: event.id });
            toast({ title: "Milestone updated" });
          } else {
            addMilestone({ ...data, eventId: event.id });
            toast({ title: "Milestone added" });
          }
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              The milestone will be permanently removed from the timeline. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMilestone(deleteId);
                  toast({ title: "Milestone deleted" });
                  setDeleteId(null);
                }
              }}
              style={{ backgroundColor: "oklch(0.55 0.18 25)", color: "white" }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MilestoneDialog({
  open,
  onOpenChange,
  milestone,
  eventId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  milestone: TimelineMilestone | null;
  eventId: string;
  onSave: (data: Omit<TimelineMilestone, "id" | "eventId">) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    completed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (milestone) {
        setForm({
          title: milestone.title,
          description: milestone.description ?? "",
          date: milestone.date,
          completed: milestone.completed,
        });
      } else {
        setForm({
          title: "",
          description: "",
          date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          completed: false,
        });
      }
      setErrors({});
    }
  }, [open, milestone]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.date) e.date = "Date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      completed: form.completed,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{milestone ? "Edit milestone" : "Add milestone"}</DialogTitle>
          <DialogDescription>
            {milestone ? "Update this milestone." : "Add a milestone to track a key date in your planning timeline."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ms-title">Title</Label>
            <Input
              id="ms-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Venue confirmed"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ms-date">Date</Label>
            <Input
              id="ms-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              aria-invalid={!!errors.date}
            />
            {errors.date && (
              <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.date}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ms-desc">Description (optional)</Label>
            <Textarea
              id="ms-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Add context about this milestone"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{milestone ? "Save changes" : "Add milestone"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

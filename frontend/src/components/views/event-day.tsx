"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Clock,
  MapPin,
  User,
  Pencil,
  Trash2,
  Check,
  Play,
  Pause,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { ScheduleItem } from "@/lib/mock-data";
import { formatTime, formatTimeRange, formatDate } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusOptions: ScheduleItem["status"][] = ["scheduled", "in_progress", "completed", "delayed"];
const statusMeta: Record<ScheduleItem["status"], { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: "oklch(0.65 0.01 70)" },
  in_progress: { label: "In Progress", color: "oklch(0.65 0.13 70)" },
  completed: { label: "Completed", color: "oklch(0.55 0.12 150)" },
  delayed: { label: "Delayed", color: "oklch(0.55 0.18 25)" },
};

export function EventDayView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const schedule = useAppStore((s) => s.schedule);
  const addScheduleItem = useAppStore((s) => s.addScheduleItem);
  const updateScheduleItem = useAppStore((s) => s.updateScheduleItem);
  const deleteScheduleItem = useAppStore((s) => s.deleteScheduleItem);

  const event = events.find((e) => e.id === currentEventId);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const eventSchedule = useMemo(
    () => (event ? schedule.filter((item) => item.eventId === event.id) : []),
    [schedule, event]
  );

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const currentIndex = eventSchedule.findIndex((s) => s.status === "in_progress");
  const nextIndex = currentIndex >= 0 ? currentIndex + 1 : eventSchedule.findIndex((s) => s.status === "scheduled");
  const currentItem = currentIndex >= 0 ? eventSchedule[currentIndex] : null;
  const nextItem = nextIndex >= 0 ? eventSchedule[nextIndex] : null;
  const completedCount = eventSchedule.filter((s) => s.status === "completed").length;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const changeStatus = (item: ScheduleItem, status: ScheduleItem["status"]) => {
    updateScheduleItem(item.id, { status });
    toast({
      title: "Status updated",
      description: `${item.title} - ${statusMeta[status].label}`,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Event-Day Schedule"
        title="Event-day operations"
        description={`Hour-by-hour schedule for ${event.name} on ${formatDate(event.date, "long")}. Built mobile-first for use on the day.`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add item
          </Button>
        }
      />

      {/* Current activity banner */}
      {currentItem ? (
        <Card
          className="p-5 border-l-4"
          style={{ borderLeftColor: "oklch(0.65 0.13 70)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: "oklch(0.65 0.13 70 / 0.15)", color: "oklch(0.55 0.10 70)" }}
            >
              <Play className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.10 70)", borderColor: "oklch(0.55 0.10 70 / 0.3)" }}
                >
                  Now
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTimeRange(currentItem.time, currentItem.endTime)}
                </span>
              </div>
              <p className="text-base font-semibold font-display text-foreground">{currentItem.title}</p>
              {currentItem.description && (
                <p className="text-sm text-muted-foreground mt-1">{currentItem.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                {currentItem.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentItem.location}
                  </span>
                )}
                {currentItem.owner && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {currentItem.owner}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : nextItem ? (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Up next</p>
              <p className="text-base font-semibold font-display text-foreground mt-0.5">{nextItem.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Starts at {formatTime(nextItem.time)}
                {nextItem.location ? ` - ${nextItem.location}` : ""}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Quick stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total items</p>
          <p className="text-xl font-semibold font-display mt-1">{eventSchedule.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="text-xl font-semibold font-display mt-1" style={{ color: "oklch(0.45 0.10 150)" }}>
            {completedCount}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">In progress</p>
          <p className="text-xl font-semibold font-display mt-1" style={{ color: "oklch(0.55 0.10 70)" }}>
            {eventSchedule.filter((s) => s.status === "in_progress").length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Delayed</p>
          <p className="text-xl font-semibold font-display mt-1" style={{ color: "oklch(0.50 0.18 25)" }}>
            {eventSchedule.filter((s) => s.status === "delayed").length}
          </p>
        </Card>
      </div>

      {/* Schedule list */}
      {eventSchedule.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No event-day schedule"
          description="Add the hour-by-hour schedule for event day. This is the operational view, separate from your planning timeline."
          actionLabel="Add schedule item"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-2">
          {eventSchedule.map((item, i) => (
            <ScheduleRow
              key={item.id}
              item={item}
              isCurrent={item.status === "in_progress"}
              isNext={i === nextIndex}
              onStatusChange={(s) => changeStatus(item, s)}
              onEdit={() => { setEditing(item); setDialogOpen(true); }}
              onDelete={() => setDeleteId(item.id)}
            />
          ))}
        </div>
      )}

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        eventId={event.id}
        onSave={(data) => {
          if (editing) {
            updateScheduleItem(editing.id, data);
            toast({ title: "Schedule item updated" });
          } else {
            addScheduleItem({ ...data, eventId: event.id });
            toast({ title: "Schedule item added" });
          }
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this schedule item?</AlertDialogTitle>
            <AlertDialogDescription>
              The schedule item will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteScheduleItem(deleteId);
                  toast({ title: "Schedule item removed" });
                  setDeleteId(null);
                }
              }}
              style={{ backgroundColor: "oklch(0.55 0.18 25)", color: "white" }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ScheduleRow({
  item,
  isCurrent,
  isNext,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  item: ScheduleItem;
  isCurrent: boolean;
  isNext: boolean;
  onStatusChange: (s: ScheduleItem["status"]) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusM = statusMeta[item.status];
  return (
    <Card
      className={cn(
        "p-4 gap-0 transition-colors",
        isCurrent && "ring-2 ring-warning"
      )}
      style={isCurrent ? { boxShadow: "0 0 0 2px oklch(0.65 0.13 70 / 0.4)" } : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Time block */}
        <div className="shrink-0 text-right w-16">
          <p className="text-sm font-semibold font-display text-foreground tabular-nums">
            {formatTime(item.time)}
          </p>
          {item.endTime && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatTime(item.endTime)}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center pt-1">
          <span
            className={cn("h-2 w-2 rounded-full")}
            style={{ backgroundColor: statusM.color }}
            aria-hidden="true"
          />
          <span className="w-px flex-1 bg-border mt-1" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn(
              "text-sm font-medium",
              item.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {item.title}
            </p>
            {isCurrent && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{ color: "oklch(0.55 0.10 70)", borderColor: "oklch(0.55 0.10 70 / 0.3)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" style={{ backgroundColor: "oklch(0.55 0.10 70)" }} />
                Now
              </Badge>
            )}
            {isNext && !isCurrent && (
              <Badge variant="outline" className="text-xs text-muted-foreground">Next</Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            {item.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.location}
              </span>
            )}
            {item.owner && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.owner}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border border-border hover:border-foreground/30 transition-colors"
                style={{
                  backgroundColor: `${statusM.color}15`,
                  color: statusM.color,
                  borderColor: `${statusM.color}40`,
                }}
                aria-label={`Status: ${statusM.label}. Click to change.`}
              >
                {statusM.label}
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((s) => (
                <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>
                  <span className="h-1.5 w-1.5 rounded-full mr-2" style={{ backgroundColor: statusMeta[s].color }} />
                  {statusMeta[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label={`Edit ${item.title}`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDelete}
              aria-label={`Delete ${item.title}`}
              style={{ color: "oklch(0.55 0.18 25)" }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ScheduleDialog({
  open,
  onOpenChange,
  item,
  eventId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: ScheduleItem | null;
  eventId: string;
  onSave: (data: Omit<ScheduleItem, "id" | "eventId">) => void;
}) {
  const [form, setForm] = useState({
    time: "10:00",
    endTime: "",
    title: "",
    description: "",
    location: "",
    status: "scheduled" as ScheduleItem["status"],
    owner: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          time: item.time,
          endTime: item.endTime ?? "",
          title: item.title,
          description: item.description ?? "",
          location: item.location ?? "",
          status: item.status,
          owner: item.owner ?? "",
        });
      } else {
        setForm({
          time: "10:00",
          endTime: "",
          title: "",
          description: "",
          location: "",
          status: "scheduled",
          owner: "",
        });
      }
      setErrors({});
    }
  }, [open, item]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.time) e.time = "Start time is required.";
    if (form.endTime && form.endTime <= form.time) e.endTime = "End time must be after start time.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      time: form.time,
      endTime: form.endTime || undefined,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      location: form.location.trim() || undefined,
      status: form.status,
      owner: form.owner.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit schedule item" : "Add schedule item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update this schedule item." : "Add an item to the event-day schedule."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-title">Title</Label>
            <Input
              id="s-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Ceremony"
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-time">Start time</Label>
              <Input
                id="s-time"
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                aria-invalid={!!errors.time}
              />
              {errors.time && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.time}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-end">End time (optional)</Label>
              <Input
                id="s-end"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                aria-invalid={!!errors.endTime}
              />
              {errors.endTime && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.endTime}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((p) => ({ ...p, status: v as ScheduleItem["status"] }))}
            >
              <SelectTrigger id="s-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{statusMeta[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-loc">Location (optional)</Label>
              <Input
                id="s-loc"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Main Hall"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-owner">Owner (optional)</Label>
              <Input
                id="s-owner"
                value={form.owner}
                onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))}
                placeholder="Responsible person"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-desc">Description (optional)</Label>
            <Textarea
              id="s-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{item ? "Save changes" : "Add item"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ListChecks,
  Filter,
  Calendar,
  User,
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
import {
  Task,
  TaskStatus,
  TaskPriority,
  taskStatusMeta,
  priorityMeta,
  tasksForEvent,
  BudgetCategory,
  categoryMeta,
} from "@/lib/mock-data";
import { formatDate, daysUntil } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statuses: TaskStatus[] = ["not_started", "in_progress", "completed"];
const priorities: TaskPriority[] = ["low", "medium", "high", "critical"];
const taskCategories = [...Object.keys(categoryMeta), "planning", "logistics"] as const;

export function TasksView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const setTaskStatus = useAppStore((s) => s.setTaskStatus);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const addNotification = useAppStore((s) => s.addNotification);

  const event = events.find((e) => e.id === currentEventId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const eventTasks = useMemo(() => {
    if (!event) return [];
    let list = tasksForEvent(tasks, event.id);
    if (search) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") list = list.filter((t) => t.priority === priorityFilter);
    return list.sort((a, b) => {
      // Overdue first, then by due date
      const aOverdue = a.status !== "completed" && new Date(a.dueDate).getTime() < Date.now() ? 0 : 1;
      const bOverdue = b.status !== "completed" && new Date(b.dueDate).getTime() < Date.now() ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, event, search, statusFilter, priorityFilter]);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const completedCount = eventTasks.filter((t) => t.status === "completed").length;
  const inProgressCount = eventTasks.filter((t) => t.status === "in_progress").length;
  const overdueCount = eventTasks.filter(
    (t) => t.status !== "completed" && new Date(t.dueDate).getTime() < Date.now()
  ).length;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDialogOpen(true);
  };

  const changeStatus = (task: Task, status: TaskStatus) => {
    // Only fire the completion notification on the actual transition
    // (not_started or in_progress -> completed). Re-clicking "completed"
    // on an already-completed task should not create duplicate notifications.
    const wasCompleted = task.status === "completed";
    setTaskStatus(task.id, status);
    if (status === "completed" && !wasCompleted) {
      addNotification({
        type: "task_completed",
        title: "Task completed",
        message: `${task.title} marked as complete.`,
        eventId: event.id,
      });
    }
    toast({
      title: "Status updated",
      description: `${task.title} - ${taskStatusMeta[status].label}`,
    });
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTask(deleteId);
      toast({ title: "Task deleted" });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Tasks"
        title="Task management"
        description={`All tasks for ${event.name}. Click status to update.`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add task
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold font-display mt-1">{eventTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.45 0.10 150)" }}>
            {completedCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">In progress</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.55 0.10 70)" }}>
            {inProgressCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Overdue</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.50 0.18 25)" }}>
            {overdueCount}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search tasks"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{taskStatusMeta[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>{priorityMeta[p].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {eventTasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Add tasks to track what needs to happen before the event. Each task has a status, priority, due date, and owner."
          actionLabel="Add task"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-2">
          {eventTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onStatusChange={(s) => changeStatus(task, s)}
              onEdit={() => openEdit(task)}
              onDelete={() => setDeleteId(task.id)}
            />
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        eventId={event.id}
        onSave={(data) => {
          if (editing) {
            updateTask(editing.id, data);
            toast({ title: "Task updated" });
          } else {
            addTask({ ...data, eventId: event.id });
            toast({ title: "Task added" });
          }
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              The task will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

function TaskRow({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  onStatusChange: (s: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue = task.status !== "completed" && new Date(task.dueDate).getTime() < Date.now();
  const statusMeta = taskStatusMeta[task.status];
  const priorityM = priorityMeta[task.priority];

  return (
    <Card className={cn("p-4 gap-0", overdue && "border-l-2")} style={overdue ? { borderLeftColor: "oklch(0.55 0.18 25)" } : undefined}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:border-foreground/30 transition-colors shrink-0"
              style={{
                backgroundColor: `${statusMeta.color}15`,
                color: statusMeta.color,
                borderColor: `${statusMeta.color}40`,
              }}
              aria-label={`Status: ${statusMeta.label}. Click to change.`}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} aria-hidden="true" />
              {statusMeta.label}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Set status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statuses.map((s) => (
              <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>
                <span className={cn("h-1.5 w-1.5 rounded-full mr-2", taskStatusMeta[s].dot)} aria-hidden="true" />
                {taskStatusMeta[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn(
              "text-sm font-medium",
              task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {task.title}
            </p>
            <Badge
              variant="outline"
              className="text-xs"
              style={{ color: priorityM.color, borderColor: `${priorityM.color}40` }}
            >
              {priorityM.label}
            </Badge>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate, "short")}
              {overdue && (
                <span style={{ color: "oklch(0.55 0.18 25)" }} className="font-medium ml-1">
                  (overdue)
                </span>
              )}
            </span>
            {task.owner && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.owner}
              </span>
            )}
            <span className="text-foreground/60 capitalize">
              {task.category.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            aria-label={`Edit ${task.title}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
            aria-label={`Delete ${task.title}`}
            style={{ color: "oklch(0.55 0.18 25)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TaskDialog({
  open,
  onOpenChange,
  task,
  eventId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task: Task | null;
  eventId: string;
  onSave: (data: Omit<Task, "id" | "eventId">) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "not_started" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: new Date().toISOString().slice(0, 10),
    category: "planning" as string,
    owner: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          category: task.category,
          owner: task.owner ?? "",
        });
      } else {
        setForm({
          title: "",
          description: "",
          status: "not_started",
          priority: "medium",
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          category: "planning",
          owner: "",
        });
      }
      setErrors({});
    }
  }, [open, task]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.dueDate) e.dueDate = "Due date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      category: form.category as any,
      owner: form.owner.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details." : "Add a new task to track for this event."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Confirm venue booking"
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description (optional)</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Add details, context, or notes"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as TaskStatus }))}
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{taskStatusMeta[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((p) => ({ ...p, priority: v as TaskPriority }))}
              >
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>{priorityMeta[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                aria-invalid={!!errors.dueDate}
              />
              {errors.dueDate && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.dueDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-cat">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger id="task-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskCategories.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-owner">Owner (optional)</Label>
            <Input
              id="task-owner"
              value={form.owner}
              onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))}
              placeholder="Who is responsible?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{task ? "Save changes" : "Add task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

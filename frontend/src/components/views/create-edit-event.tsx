"use client";

import { useState, FormEvent, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { EventType, eventTypeMeta } from "@/lib/mock-data";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface EventFormProps {
  mode: "create" | "edit";
}

interface FormData {
  name: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  expectedGuests: number;
  totalBudget: number;
  currency: string;
  theme: string;
  style: string;
  priorities: string[];
  specialRequirements: string;
}

interface FormErrors {
  name?: string;
  date?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  expectedGuests?: string;
  totalBudget?: string;
}

const priorityOptions = [
  "Venue", "Catering", "Photography", "Decoration", "Entertainment",
  "Guest experience", "Budget discipline", "Tradition", "Music", "Comfort",
];

const eventTypeAccents: Record<EventType, string> = {
  wedding: "oklch(0.55 0.14 35)",
  birthday: "oklch(0.65 0.12 150)",
  community: "oklch(0.65 0.13 70)",
  family: "oklch(0.55 0.10 320)",
  custom: "oklch(0.55 0.08 220)",
};

export function CreateEditEventView({ mode }: EventFormProps) {
  const navigate = useAppStore((s) => s.navigate);
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const createEvent = useAppStore((s) => s.createEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const deleteEvent = useAppStore((s) => s.deleteEvent);
  const addNotification = useAppStore((s) => s.addNotification);

  const existing = mode === "edit" ? events.find((e) => e.id === currentEventId) : undefined;

  const [form, setForm] = useState<FormData>({
    name: existing?.name ?? "",
    type: existing?.type ?? "wedding",
    date: existing?.date ?? "",
    startTime: existing?.startTime ?? "10:00",
    endTime: existing?.endTime ?? "22:00",
    location: existing?.location ?? "",
    expectedGuests: existing?.expectedGuests ?? 50,
    totalBudget: existing?.totalBudget ?? 100000,
    currency: existing?.currency ?? "INR",
    theme: existing?.theme ?? "",
    style: existing?.style ?? "",
    priorities: existing?.priorities ?? [],
    specialRequirements: existing?.specialRequirements ?? "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((p) => ({ ...p, [key]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Event name is required.";
    if (!form.date) e.date = "Event date is required.";
    else {
      const d = new Date(form.date);
      if (mode === "create" && d.getTime() < Date.now() - 86400000) {
        e.date = "Event date cannot be in the past.";
      }
    }
    if (!form.location || form.location.trim().length < 2) e.location = "Location is required.";
    if (!form.startTime) e.startTime = "Start time is required.";
    if (!form.endTime) e.endTime = "End time is required.";
    else if (form.startTime && form.endTime <= form.startTime) e.endTime = "End time must be after start time.";
    if (!form.expectedGuests || form.expectedGuests < 1) e.expectedGuests = "At least 1 guest.";
    if (!form.totalBudget || form.totalBudget < 1000) e.totalBudget = "Budget must be at least ₹1,000.";
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      const coverColor = eventTypeAccents[form.type];
      if (mode === "edit" && existing) {
        updateEvent(existing.id, { ...form, coverColor });
        addNotification({
          type: "ai_plan_generated",
          title: "Event updated",
          message: `${form.name} details have been saved.`,
          eventId: existing.id,
        });
      } else {
        const newId = createEvent({ ...form, coverColor });
        addNotification({
          type: "ai_plan_generated",
          title: "Event created",
          message: `${form.name} has been created.`,
          eventId: newId,
        });
      }
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate({ kind: "app", view: "event_overview" });
      }, 900);
    }, 600);
  };

  const togglePriority = (p: string) => {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter((x) => x !== p)
        : [...prev.priorities, p],
    }));
  };

  const onDelete = () => {
    if (!existing) return;
    deleteEvent(existing.id);
    navigate({ kind: "app", view: "dashboard" });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={mode === "create" ? "Create event" : "Edit event"}
        title={mode === "create" ? "New event" : existing?.name ?? "Edit event"}
        description={
          mode === "create"
            ? "Add the essentials about your celebration. You can change anything later."
            : "Update your event details. Changes apply across the workspace."
        }
        actions={
          <Button variant="ghost" onClick={() => navigate({ kind: "app", view: "event_overview" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        }
      />

      {success && (
        <div
          className="rounded-md p-4 border flex items-center gap-3"
          style={{
            backgroundColor: "oklch(0.55 0.12 150 / 0.08)",
            borderColor: "oklch(0.55 0.12 150 / 0.25)",
            color: "oklch(0.40 0.10 150)",
          }}
          role="status"
        >
          <Check className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">
              {mode === "create" ? "Event created" : "Event updated"}
            </p>
            <p className="text-xs opacity-90">Redirecting to event overview...</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {/* Basics */}
        <Card className="p-6 space-y-4 gap-0">
          <div>
            <h2 className="text-base font-semibold font-display text-foreground">Basics</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              The essentials about your celebration.
            </p>
          </div>

          <Field label="Event name" required error={errors.name} htmlFor="name">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Priya and Rahul's Wedding"
              aria-invalid={!!errors.name}
            />
          </Field>

          <Field label="Event type" required htmlFor="type">
            <Select value={form.type} onValueChange={(v) => set("type", v as EventType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(eventTypeMeta) as EventType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {eventTypeMeta[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date" required error={errors.date} htmlFor="date">
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                aria-invalid={!!errors.date}
              />
            </Field>
            <Field label="Location" required error={errors.location} htmlFor="location">
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Bengaluru"
                aria-invalid={!!errors.location}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Start time" required error={errors.startTime} htmlFor="startTime">
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                aria-invalid={!!errors.startTime}
              />
            </Field>
            <Field label="End time" required error={errors.endTime} htmlFor="endTime">
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                aria-invalid={!!errors.endTime}
              />
            </Field>
          </div>
        </Card>

        {/* Budget */}
        <Card className="p-6 space-y-4 gap-0">
          <div>
            <h2 className="text-base font-semibold font-display text-foreground">Budget</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              A starting total. You can break it down by category in the budget view.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Total budget" required error={errors.totalBudget} htmlFor="budget">
              <Input
                id="budget"
                type="number"
                min={0}
                step={1000}
                value={form.totalBudget}
                onChange={(e) => set("totalBudget", Number(e.target.value))}
                aria-invalid={!!errors.totalBudget}
              />
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Expected guests" required error={errors.expectedGuests} htmlFor="guests">
              <Input
                id="guests"
                type="number"
                min={1}
                value={form.expectedGuests}
                onChange={(e) => set("expectedGuests", Number(e.target.value))}
                aria-invalid={!!errors.expectedGuests}
              />
            </Field>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 space-y-4 gap-0">
          <div>
            <h2 className="text-base font-semibold font-display text-foreground">
              Theme and preferences
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Used by AI to weight recommendations. All fields optional.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Theme" htmlFor="theme">
              <Input
                id="theme"
                value={form.theme}
                onChange={(e) => set("theme", e.target.value)}
                placeholder="e.g. Ivory and marigold"
              />
            </Field>
            <Field label="Style" htmlFor="style">
              <Input
                id="style"
                value={form.style}
                onChange={(e) => set("style", e.target.value)}
                placeholder="e.g. Traditional with modern touches"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <Label>Priorities</Label>
            <p className="text-xs text-muted-foreground">
              Pick a few. The AI uses these to weight recommendations.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {priorityOptions.map((p) => {
                const selected = form.priorities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm border",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground/70 hover:border-foreground/30"
                    )}
                    aria-pressed={selected}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Special requirements" htmlFor="special">
            <Textarea
              id="special"
              value={form.specialRequirements}
              onChange={(e) => set("specialRequirements", e.target.value)}
              placeholder="e.g. Jain meals for 30 guests, wheelchair access"
              rows={3}
            />
          </Field>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ kind: "app", view: "event_overview" })}
            >
              Cancel
            </Button>
            {mode === "edit" && existing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    style={{ color: "oklch(0.55 0.18 25)" }}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove {existing.name} and all related tasks,
                      vendors, guests, and expenses. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      style={{
                        backgroundColor: "oklch(0.55 0.18 25)",
                        color: "white",
                      }}
                    >
                      Delete event
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <Button type="submit" disabled={submitting} size="lg">
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                {mode === "create" ? "Create event" : "Save changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-0.5" style={{ color: "oklch(0.55 0.18 25)" }}>*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1" style={{ color: "oklch(0.55 0.18 25)" }}>
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

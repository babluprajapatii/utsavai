"use client";

import { useState, useMemo, useEffect, FormEvent } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Cake,
  Building2,
  Gift,
  PartyPopper,
  Sparkles,
  IndianRupee,
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { useAppStore, OnboardingView } from "@/lib/store";
import { EventType, eventTypeMeta, BudgetCategory, TaskPriority } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { formatINR, formatDate } from "@/lib/format";

const eventTypeIcons: Record<EventType, typeof Heart> = {
  wedding: Heart,
  birthday: Cake,
  community: Building2,
  family: Gift,
  custom: PartyPopper,
};

const eventTypeAccents: Record<EventType, string> = {
  wedding: "oklch(0.55 0.14 35)",
  birthday: "oklch(0.65 0.12 150)",
  community: "oklch(0.65 0.13 70)",
  family: "oklch(0.55 0.10 320)",
  custom: "oklch(0.55 0.08 220)",
};

const steps: { id: OnboardingView; label: string }[] = [
  { id: "onboarding_welcome", label: "Welcome" },
  { id: "onboarding_event_type", label: "Event Type" },
  { id: "onboarding_details", label: "Details" },
  { id: "onboarding_budget", label: "Budget" },
  { id: "onboarding_preferences", label: "Preferences" },
  { id: "onboarding_generate", label: "Generate" },
  { id: "onboarding_review", label: "Review" },
];

export function OnboardingFlow() {
  const route = useAppStore((s) => s.route);
  const navigate = useAppStore((s) => s.navigate);
  const draft = useAppStore((s) => s.onboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);
  const resetDraft = useAppStore((s) => s.resetOnboardingDraft);
  const createEvent = useAppStore((s) => s.createEvent);
  const addTask = useAppStore((s) => s.addTask);
  const addMilestone = useAppStore((s) => s.addMilestone);
  const addExpense = useAppStore((s) => s.addExpense);
  const addNotification = useAppStore((s) => s.addNotification);

  const currentView = route.kind === "onboarding" ? route.view : "onboarding_welcome";
  const currentStepIndex = steps.findIndex((s) => s.id === currentView);

  const goToStep = (view: OnboardingView) => navigate({ kind: "onboarding", view });

  const cancel = () => {
    resetDraft();
    navigate({ kind: "app", view: "dashboard" });
  };

  const [accepting, setAccepting] = useState(false);

  const acceptPlan = () => {
    // Guard against double-clicks creating duplicate events
    if (accepting) return;
    setAccepting(true);
    // Generate the plan one more time so we have the data to persist
    const plan = generatePlanFromDraft(draft);

    // 1. Create the event itself
    const newId = createEvent({
      name: draft.name || "Untitled Event",
      type: (draft.type as EventType) || "custom",
      date: draft.date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      startTime: draft.startTime || "10:00",
      endTime: draft.endTime || "22:00",
      location: draft.location || "To be decided",
      expectedGuests: draft.expectedGuests ?? 50,
      totalBudget: draft.totalBudget ?? 100000,
      currency: "INR",
      theme: draft.theme,
      style: draft.style,
      priorities: draft.priorities ?? [],
      specialRequirements: draft.specialRequirements,
      coverColor: eventTypeAccents[(draft.type as EventType) || "custom"],
    });

    // 2. Persist every suggested task to the new event
    plan.tasks.forEach((task) => {
      addTask({
        title: task.title,
        description: task.description,
        status: "not_started",
        priority: task.priority,
        dueDate: task.dueDate,
        category: task.category,
        eventId: newId,
      });
    });

    // 3. Persist every timeline milestone
    plan.timeline.forEach((m) => {
      addMilestone({
        title: m.title,
        date: m.date,
        description: m.description,
        completed: false,
        eventId: newId,
      });
    });

    // 4. Persist budget plan as planned (zero spent) expenses per category
    plan.budget.forEach((b) => {
      addExpense({
        category: b.category,
        description: `${b.label} budget allocation`,
        plannedAmount: b.amount,
        actualAmount: 0,
        date: new Date().toISOString().slice(0, 10),
        eventId: newId,
      });
    });

    // 5. Notify the user that the plan was accepted
    addNotification({
      type: "ai_plan_generated",
      title: "Plan accepted",
      message: `${plan.tasks.length} tasks, ${plan.timeline.length} milestones, and ${plan.budget.length} budget categories were added to ${draft.name || "your event"}.`,
      eventId: newId,
    });

    resetDraft();
    navigate({ kind: "app", view: "event_overview" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate({ kind: "app", view: "dashboard" })}
            aria-label="UtsavAI home"
          >
            <Logo />
          </button>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => i <= currentStepIndex && goToStep(step.id)}
                  disabled={i > currentStepIndex}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
                    i === currentStepIndex
                      ? "text-primary"
                      : i < currentStepIndex
                      ? "text-foreground/70 hover:text-foreground cursor-pointer"
                      : "text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-semibold border",
                      i === currentStepIndex
                        ? "border-primary bg-primary text-primary-foreground"
                        : i < currentStepIndex
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground/60"
                    )}
                  >
                    {i < currentStepIndex ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <span className="h-px w-4 sm:w-6 bg-border mx-1" />
                )}
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={cancel}>
            Cancel
          </Button>
        </div>
        {/* Mobile progress bar */}
        <div className="sm:hidden border-t border-border">
          <div className="h-0.5 bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="font-medium text-foreground">{steps[currentStepIndex].label}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentView === "onboarding_welcome" && (
          <WelcomeStep onNext={() => goToStep("onboarding_event_type")} />
        )}
        {currentView === "onboarding_event_type" && (
          <EventTypeStep
            value={draft.type as EventType | undefined}
            onChange={(t) => setDraft({ type: t })}
            onBack={() => goToStep("onboarding_welcome")}
            onNext={() => goToStep("onboarding_details")}
          />
        )}
        {currentView === "onboarding_details" && (
          <DetailsStep
            draft={draft}
            setDraft={setDraft}
            onBack={() => goToStep("onboarding_event_type")}
            onNext={() => goToStep("onboarding_budget")}
          />
        )}
        {currentView === "onboarding_budget" && (
          <BudgetStep
            value={draft.totalBudget ?? 0}
            expectedGuests={draft.expectedGuests ?? 0}
            onChange={(total, guests) => setDraft({ totalBudget: total, expectedGuests: guests })}
            onBack={() => goToStep("onboarding_details")}
            onNext={() => goToStep("onboarding_preferences")}
          />
        )}
        {currentView === "onboarding_preferences" && (
          <PreferencesStep
            draft={draft}
            setDraft={setDraft}
            onBack={() => goToStep("onboarding_budget")}
            onNext={() => goToStep("onboarding_generate")}
          />
        )}
        {currentView === "onboarding_generate" && (
          <GenerateStep
            draft={draft}
            onBack={() => goToStep("onboarding_preferences")}
            onNext={() => goToStep("onboarding_review")}
            onRegenerate={() => {}}
          />
        )}
        {currentView === "onboarding_review" && (
          <ReviewStep
            draft={draft}
            onBack={() => goToStep("onboarding_generate")}
            onAccept={acceptPlan}
            onEdit={() => goToStep("onboarding_details")}
            accepting={accepting}
          />
        )}
      </main>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Welcome step
// ───────────────────────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-6 py-8">
      <div className="flex justify-center">
        <Logo stacked size={64} />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display text-foreground">
          Let's plan your celebration.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Over the next few steps we will collect the essentials about your
          event, then UtsavAI will draft a complete plan you can review and
          edit. Take your time. You can change anything later.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto pt-4">
        {[
          { icon: Check, label: "Takes about 3 minutes" },
          { icon: Pencil, label: "Edit anything later" },
          { icon: Sparkles, label: "AI-generated plan" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-sm text-foreground/80 justify-center sm:justify-start"
          >
            <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
            {item.label}
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onNext} className="mt-4">
        Get Started
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Event type step
// ───────────────────────────────────────────────────────────────────────────
function EventTypeStep({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: EventType | undefined;
  onChange: (t: EventType) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Step 2 of 6
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
          What are you celebrating?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick the closest match. The same workspace works for any of these.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(eventTypeMeta) as EventType[]).map((type) => {
          const Icon = eventTypeIcons[type];
          const meta = eventTypeMeta[type];
          const accent = eventTypeAccents[type];
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                "text-left p-5 rounded-md border-2 transition-all",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-foreground/30"
              )}
              aria-pressed={selected}
            >
              <div
                className="h-10 w-10 rounded-md flex items-center justify-center mb-3"
                style={{ backgroundColor: `${accent}18`, color: accent }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold font-display text-foreground">
                {meta.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {meta.description}
              </p>
              {selected && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                  <Check className="h-3.5 w-3.5" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!value} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Event details step
// ───────────────────────────────────────────────────────────────────────────
function DetailsStep({
  draft,
  setDraft,
  onBack,
  onNext,
}: {
  draft: any;
  setDraft: (p: any) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.name || draft.name.trim().length < 2) e.name = "Event name is required.";
    if (!draft.date) e.date = "Event date is required.";
    else {
      const d = new Date(draft.date);
      if (d.getTime() < Date.now() - 86400000) e.date = "Event date cannot be in the past.";
    }
    if (!draft.location || draft.location.trim().length < 2) e.location = "Location is required.";
    if (!draft.startTime) e.startTime = "Start time is required.";
    if (!draft.endTime) e.endTime = "End time is required.";
    else if (draft.startTime && draft.endTime <= draft.startTime) e.endTime = "End time must be after start time.";
    return e;
  };

  const next = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Step 3 of 6
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
          Event details
        </h1>
        <p className="text-sm text-muted-foreground">
          The basics about your celebration.
        </p>
      </div>

      <Card className="p-6 space-y-4 gap-0">
        <Field label="Event name" required error={errors.name} htmlFor="name">
          <Input
            id="name"
            value={draft.name ?? ""}
            onChange={(e) => setDraft({ name: e.target.value })}
            placeholder="e.g. Priya and Rahul's Wedding"
            aria-invalid={!!errors.name}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Event date" required error={errors.date} htmlFor="date">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="date"
                type="date"
                value={draft.date ?? ""}
                onChange={(e) => setDraft({ date: e.target.value })}
                className="pl-9"
                aria-invalid={!!errors.date}
              />
            </div>
          </Field>
          <Field label="Location" required error={errors.location} htmlFor="location">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="location"
                value={draft.location ?? ""}
                onChange={(e) => setDraft({ location: e.target.value })}
                placeholder="e.g. Bengaluru"
                className="pl-9"
                aria-invalid={!!errors.location}
              />
            </div>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Start time" required error={errors.startTime} htmlFor="startTime">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="startTime"
                type="time"
                value={draft.startTime ?? "10:00"}
                onChange={(e) => setDraft({ startTime: e.target.value })}
                className="pl-9"
                aria-invalid={!!errors.startTime}
              />
            </div>
          </Field>
          <Field label="End time" required error={errors.endTime} htmlFor="endTime">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="endTime"
                type="time"
                value={draft.endTime ?? "22:00"}
                onChange={(e) => setDraft({ endTime: e.target.value })}
                className="pl-9"
                aria-invalid={!!errors.endTime}
              />
            </div>
          </Field>
        </div>
      </Card>

      <StepNav onBack={onBack} onNext={next} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Budget step
// ───────────────────────────────────────────────────────────────────────────
function BudgetStep({
  value,
  expectedGuests,
  onChange,
  onBack,
  onNext,
}: {
  value: number;
  expectedGuests: number;
  onChange: (total: number, guests: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [total, setTotal] = useState(value ? String(value) : "");
  const [guests, setGuests] = useState(expectedGuests ? String(expectedGuests) : "50");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const presets = [50000, 100000, 250000, 500000, 1000000];

  const next = () => {
    const e: Record<string, string> = {};
    const t = Number(total);
    const g = Number(guests);
    if (!total || isNaN(t) || t <= 0) e.total = "Enter a valid budget amount.";
    if (!guests || isNaN(g) || g <= 0) e.guests = "Enter expected guest count.";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      onChange(t, g);
      onNext();
    }
  };

  const perHead = useMemo(() => {
    const t = Number(total);
    const g = Number(guests);
    if (!t || !g || g <= 0) return null;
    return Math.round(t / g);
  }, [total, guests]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Step 4 of 6
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
          Budget and guests
        </h1>
        <p className="text-sm text-muted-foreground">
          A starting budget and expected headcount. You can adjust later.
        </p>
      </div>

      <Card className="p-6 space-y-5 gap-0">
        <Field label="Total budget (INR)" required error={errors.total} htmlFor="budget">
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="budget"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="500000"
              className="pl-9"
              aria-invalid={!!errors.total}
            />
          </div>
        </Field>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTotal(String(p))}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs border",
                Number(total) === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground/70 hover:border-foreground/30"
              )}
            >
              {formatINR(p, { compact: true })}
            </button>
          ))}
        </div>

        <Field label="Expected guests" required error={errors.guests} htmlFor="guests">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="guests"
              type="number"
              inputMode="numeric"
              min={1}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="pl-9"
              aria-invalid={!!errors.guests}
            />
          </div>
        </Field>

        {perHead !== null && (
          <div className="rounded-md bg-secondary/60 p-4 text-sm">
            <p className="text-muted-foreground">Approximate budget per guest</p>
            <p className="text-xl font-semibold font-display text-foreground mt-0.5">
              {formatINR(perHead)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              UtsavAI will suggest category splits based on this number.
            </p>
          </div>
        )}
      </Card>

      <StepNav onBack={onBack} onNext={next} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Preferences step
// ───────────────────────────────────────────────────────────────────────────
function PreferencesStep({
  draft,
  setDraft,
  onBack,
  onNext,
}: {
  draft: any;
  setDraft: (p: any) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const priorityOptions = [
    "Venue", "Catering", "Photography", "Decoration", "Entertainment",
    "Guest experience", "Budget discipline", "Tradition", "Music", "Comfort",
  ];

  const togglePriority = (p: string) => {
    const current: string[] = draft.priorities ?? [];
    if (current.includes(p)) {
      setDraft({ priorities: current.filter((x) => x !== p) });
    } else {
      setDraft({ priorities: [...current, p] });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Step 5 of 6
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
          Preferences
        </h1>
        <p className="text-sm text-muted-foreground">
          Theme, style, and what matters most to you.
        </p>
      </div>

      <Card className="p-6 space-y-4 gap-0">
        <Field label="Theme (optional)" htmlFor="theme">
          <Input
            id="theme"
            value={draft.theme ?? ""}
            onChange={(e) => setDraft({ theme: e.target.value })}
            placeholder="e.g. Ivory and marigold"
          />
        </Field>

        <Field label="Style (optional)" htmlFor="style">
          <Input
            id="style"
            value={draft.style ?? ""}
            onChange={(e) => setDraft({ style: e.target.value })}
            placeholder="e.g. Traditional with modern touches"
          />
        </Field>

        <div className="space-y-2">
          <Label>What matters most? (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Pick a few priorities. The AI uses these to weight recommendations.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {priorityOptions.map((p) => {
              const selected = (draft.priorities ?? []).includes(p);
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

        <Field label="Special requirements (optional)" htmlFor="special">
          <Textarea
            id="special"
            value={draft.specialRequirements ?? ""}
            onChange={(e) => setDraft({ specialRequirements: e.target.value })}
            placeholder="e.g. Jain meals for 30 guests, wheelchair access"
            rows={3}
          />
        </Field>
      </Card>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Generate Plan" />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Generate step - animated progress
// ───────────────────────────────────────────────────────────────────────────
function GenerateStep({
  draft,
  onBack,
  onNext,
  onRegenerate,
}: {
  draft: any;
  onBack: () => void;
  onNext: () => void;
  onRegenerate: () => void;
}) {
  const stages = [
    { id: "understand", label: "Understanding your event" },
    { id: "preferences", label: "Reviewing preferences" },
    { id: "timeline", label: "Building timeline" },
    { id: "budget", label: "Preparing budget suggestions" },
    { id: "recommendations", label: "Creating recommendations" },
  ];
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    stages.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStage(i + 1), 700 * (i + 1)));
    });
    timers.push(window.setTimeout(() => setDone(true), 700 * (stages.length + 1)));
    return () => {
      timers.forEach((t) => clearTimeout(t));
      setStage(0);
      setDone(false);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Step 6 of 6
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
          Creating your event plan
        </h1>
        <p className="text-sm text-muted-foreground">
          UtsavAI is drafting a complete plan based on your inputs.
        </p>
      </div>

      <Card className="p-8 space-y-5 gap-0">
        <div className="flex items-center justify-center mb-2">
          <div className="h-14 w-14 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-3">
          {stages.map((s, i) => {
            const isDone = i < stage;
            const isCurrent = i === stage && !done;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3"
              >
                <span
                  className={cn(
                    "h-6 w-6 rounded-full inline-flex items-center justify-center text-xs border-2",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground/60"
                  )}
                >
                  {isDone ? (
                    <Check className="h-3 w-3" />
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isDone || isCurrent ? "text-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {done && (
          <div className="pt-4 border-t border-border space-y-3">
            <div
              className="rounded-md p-3 text-xs border"
              style={{
                backgroundColor: "oklch(0.55 0.12 150 / 0.08)",
                borderColor: "oklch(0.55 0.12 150 / 0.2)",
                color: "oklch(0.45 0.10 150)",
              }}
            >
              <p className="font-semibold">Plan ready for review.</p>
              <p className="mt-0.5 opacity-90">
                The next screen shows tasks, timeline, budget suggestions, and recommendations.
                You can edit any section, regenerate, or accept.
              </p>
            </div>
            <Button onClick={onNext} className="w-full" size="lg">
              Review plan
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        )}
      </Card>

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={!done}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Review step
// ───────────────────────────────────────────────────────────────────────────
function ReviewStep({
  draft,
  onBack,
  onAccept,
  onEdit,
  accepting,
}: {
  draft: any;
  onBack: () => void;
  onAccept: () => void;
  onEdit: () => void;
  accepting: boolean;
}) {
  // Generate a deterministic plan from draft
  const plan = useMemo(() => generatePlanFromDraft(draft), [draft]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Review your plan
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight font-display text-foreground">
              {draft.name || "Your event plan"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {draft.date && new Date(draft.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {draft.location ? ` - ${draft.location}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit details
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      <AiGeneratedBanner />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Tasks */}
        <Card className="p-5 gap-0 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold font-display text-foreground">
              Suggested tasks
            </h3>
            <span className="text-xs text-muted-foreground">{plan.tasks.length} tasks</span>
          </div>
          <ul className="space-y-2 max-h-80 overflow-y-auto scroll-area-thin pr-1">
            {plan.tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm py-1.5 border-b border-border/60 last:border-0">
                <span className="h-4 w-4 rounded border-2 border-border mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="capitalize">{task.category.replace("_", " ")}</span>
                    {" - "}
                    {task.priority} priority
                    {" - "}
                    due {formatDate(task.dueDate, "short")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Budget suggestions */}
        <Card className="p-5 gap-0">
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">
            Budget suggestions
          </h3>
          <ul className="space-y-2.5">
            {plan.budget.map((b, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">{b.label}</span>
                <span className="font-medium text-foreground">{formatINR(b.amount, { compact: true })}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-semibold text-foreground">{formatINR(draft.totalBudget ?? 0, { compact: true })}</span>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-5 gap-0 lg:col-span-2">
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">
            Timeline milestones
          </h3>
          <ol className="relative space-y-3 border-l-2 border-border pl-5">
            {plan.timeline.map((m, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-border bg-background" />
                <p className="text-sm font-medium text-foreground">{m.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(m.date, "medium")}</p>
              </li>
            ))}
          </ol>
        </Card>

        {/* Recommendations */}
        <Card className="p-5 gap-0">
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm">
            {plan.recommendations.map((r, i) => (
              <li key={i} className="text-foreground/80 leading-relaxed">{r}</li>
            ))}
          </ul>
        </Card>

        {/* Risks */}
        <Card className="p-5 gap-0 lg:col-span-3">
          <h3 className="text-sm font-semibold font-display text-foreground mb-3">
            Risks to watch
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.risks.map((r, i) => (
              <div key={i} className="rounded-md p-3 border border-border bg-secondary/40">
                <p className="text-sm font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit details
          </Button>
          <Button onClick={onAccept} size="lg" disabled={accepting}>
            {accepting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                Accept plan
                <Check className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AiGeneratedBanner() {
  return (
    <div
      className="rounded-md p-3 text-xs flex items-start gap-2 border"
      style={{
        backgroundColor: "oklch(0.65 0.13 70 / 0.08)",
        borderColor: "oklch(0.65 0.13 70 / 0.25)",
        color: "oklch(0.40 0.08 60)",
      }}
    >
      <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
      <span>
        <strong>AI-generated plan.</strong> This plan was drafted by UtsavAI based on
        your inputs. Review each section, edit anything that does not fit, and accept
        to add the event to your dashboard.
      </span>
    </div>
  );
}

function generatePlanFromDraft(draft: any) {
  const budget: { label: string; amount: number; category: BudgetCategory }[] = [];
  const total = draft.totalBudget ?? 100000;
  const splits: { label: string; pct: number; category: BudgetCategory }[] = [
    { label: "Venue", pct: 0.30, category: "venue" },
    { label: "Food", pct: 0.24, category: "food" },
    { label: "Decoration", pct: 0.10, category: "decoration" },
    { label: "Photography", pct: 0.12, category: "photography" },
    { label: "Entertainment", pct: 0.06, category: "entertainment" },
    { label: "Transportation", pct: 0.06, category: "transportation" },
    { label: "Contingency", pct: 0.12, category: "contingency" },
  ];
  splits.forEach((s) => budget.push({ label: s.label, amount: Math.round(total * s.pct), category: s.category }));

  // Compute real ISO dates relative to the event date
  const eventDate = draft.date ? new Date(draft.date) : new Date(Date.now() + 30 * 86400000);
  const daysBefore = (n: number) => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);
  const weeksFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n * 7);
    return d.toISOString().slice(0, 10);
  };

  const tasks: GeneratedTask[] = [
    { title: "Confirm venue booking", category: "venue", priority: "critical", dueDate: daysBefore(28), description: "Sign contract and pay advance for the venue." },
    { title: "Finalize caterer and menu", category: "food", priority: "critical", dueDate: daysBefore(21), description: "Lock menu and confirm dietary requirements." },
    { title: "Book photographer", category: "photography", priority: "high", dueDate: daysBefore(21), description: "Confirm coverage and pre-event shoot if applicable." },
    { title: "Complete guest list", category: "planning", priority: "high", dueDate: daysBefore(35), description: "Collect phone numbers and email addresses." },
    { title: "Send invitations", category: "planning", priority: "medium", dueDate: daysBefore(28), description: "Send save-the-date and RSVP-enabled invitations." },
    { title: "Order decoration", category: "decoration", priority: "high", dueDate: daysBefore(14), description: "Confirm floral arrangements and stage setup." },
    { title: "Confirm transportation", category: "transportation", priority: "medium", dueDate: daysBefore(14), description: "Arrange guest pickup and drop-off." },
    { title: "Final headcount to caterer", category: "food", priority: "critical", dueDate: daysBefore(5), description: "Lock final guest count with meal preference split." },
    { title: "Brief vendors on event-day", category: "logistics", priority: "medium", dueDate: daysBefore(3), description: "Share event-day schedule with all booked vendors." },
    { title: "Prepare emergency kit", category: "logistics", priority: "low", dueDate: daysBefore(1), description: "Pins, first aid, medicines, chargers, accessories." },
  ];

  const timeline: GeneratedMilestone[] = [
    { title: "Planning kickoff", date: isoToday, description: "Event created and plan generated." },
    { title: "Vendor shortlist ready", date: weeksFromNow(2), description: "Research and shortlist vendors across categories." },
    { title: "Venue confirmed", date: daysBefore(28), description: "Venue contract signed and advance paid." },
    { title: "Invitations sent", date: daysBefore(28), description: "Save-the-date and RSVP-enabled invitations delivered." },
    { title: "Final headcount locked", date: daysBefore(5), description: "Final guest count shared with caterer." },
    { title: "Event day", date: eventDate.toISOString().slice(0, 10), description: "Main celebration." },
  ];

  const recommendations = [
    "Reserve 10 to 12 percent of budget as contingency for unexpected costs.",
    "Send save-the-dates 6 weeks before the event for better RSVP response rates.",
    "Confirm vendor arrival times in writing one week before the event.",
    "Build a 30-minute buffer between major schedule items on event day.",
  ];

  const risks = [
    {
      title: "Vendor availability",
      description: "Popular vendors book 3 to 6 months ahead. Confirm early to avoid disappointment.",
    },
    {
      title: "Weather contingency",
      description: "If any part of the event is outdoors, plan an indoor fallback for the same date.",
    },
    {
      title: "Guest count drift",
      description: "Plan catering for 5 to 10 percent more than confirmed RSVPs to handle surprises.",
    },
  ];

  return { tasks, budget, timeline, recommendations, risks };
}

// Internal types for generated plan (kept private to this module)
type GeneratedTask = {
  title: string;
  category: BudgetCategory | "planning" | "logistics";
  priority: TaskPriority;
  dueDate: string;
  description: string;
};

type GeneratedMilestone = {
  title: string;
  date: string;
  description: string;
};

// ───────────────────────────────────────────────────────────────────────────
// Shared step components
// ───────────────────────────────────────────────────────────────────────────
function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back
      </Button>
      <Button onClick={onNext} disabled={nextDisabled} size="lg">
        {nextLabel}
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
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

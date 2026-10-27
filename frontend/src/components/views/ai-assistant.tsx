"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  AlertCircle,
  Trash2,
  Clock,
  Calendar,
  IndianRupee,
  ListChecks,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import {
  tasksForEvent,
  vendorsForEvent,
  guestsForEvent,
  expensesForEvent,
  eventTypeMeta,
} from "@/lib/mock-data";
import { formatINR, formatINRShort, formatDate, daysUntil } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "What should I prioritize this week?",
  "How can I reduce my budget?",
  "What tasks are overdue?",
  "What am I forgetting?",
  "Create a final 7-day checklist.",
];

export function AiAssistantView() {
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const tasks = useAppStore((s) => s.tasks);
  const vendors = useAppStore((s) => s.vendors);
  const guests = useAppStore((s) => s.guests);
  const expenses = useAppStore((s) => s.expenses);
  const chatMessages = useAppStore((s) => s.chatMessages);
  const sendChatMessage = useAppStore((s) => s.sendChatMessage);
  const retryLastMessage = useAppStore((s) => s.retryLastMessage);
  const clearChat = useAppStore((s) => s.clearChat);

  const event = events.find((e) => e.id === currentEventId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const eventTasks = event ? tasksForEvent(tasks, event.id) : [];
  const eventVendors = event ? vendorsForEvent(vendors, event.id) : [];
  const eventGuests = event ? guestsForEvent(guests, event.id) : [];
  const eventExpenses = event ? expensesForEvent(expenses, event.id) : [];
  const messages = event ? chatMessages[event.id] ?? [] : [];

  // Track "in-flight" messages to show typing indicator
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, pendingCount]);

  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);

  const send = async (text: string) => {
    if (!event || !text.trim() || sending) return;
    setError(false);
    setSending(true);
    setPendingCount((c) => c + 1);
    const trimmed = text.trim();
    setInput("");
    try {
      await sendChatMessage(event.id, trimmed);
      setLastFailedInput(null);
    } catch (err) {
      // The user message is already in chat (added synchronously by sendChatMessage).
      // Track the failed input so the retry button knows there is something to retry,
      // but do NOT restore it to the input field - that would create a duplicate
      // user message when retried.
      setLastFailedInput(trimmed);
      setError(true);
    } finally {
      setSending(false);
      setPendingCount((c) => Math.max(0, c - 1));
    }
  };

  const retry = async () => {
    if (!event || !lastFailedInput || sending) return;
    setError(false);
    setSending(true);
    setPendingCount((c) => c + 1);
    try {
      // retryLastMessage regenerates the AI response for the last user message
      // WITHOUT re-adding the user message, preventing duplicates.
      await retryLastMessage(event.id);
      setLastFailedInput(null);
    } catch (err) {
      setError(true);
    } finally {
      setSending(false);
      setPendingCount((c) => Math.max(0, c - 1));
    }
  };

  if (!event) {
    return (
      <div className="text-center py-20 text-muted-foreground">No event selected.</div>
    );
  }

  const days = daysUntil(event.date);
  const totalSpent = eventExpenses.reduce((s, e) => s + e.actualAmount, 0);
  const overdueCount = eventTasks.filter(
    (t) => t.status !== "completed" && new Date(t.dueDate).getTime() < Date.now()
  ).length;
  const pendingRsvp = eventGuests.filter((g) => g.rsvp === "pending").length;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="AI Assistant"
        title="Event-aware planning assistant"
        description={`Ask anything about ${event.name}. The assistant knows your tasks, budget, and timeline.`}
        actions={
          messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearChat(event.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear chat
            </Button>
          )
        }
      />

      {/* Event context strip */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: event.coverColor }}
            aria-hidden="true"
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assistant context
          </p>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <ContextItem icon={Calendar} label="Event date" value={formatDate(event.date, "short")} sub={days < 0 ? "Passed" : `${days} days to go`} />
          <ContextItem icon={IndianRupee} label="Budget" value={formatINRShort(totalSpent)} sub={`of ${formatINRShort(event.totalBudget)}`} />
          <ContextItem icon={ListChecks} label="Tasks" value={`${eventTasks.filter((t) => t.status === "completed").length}/${eventTasks.length}`} sub={`${overdueCount} overdue`} />
          <ContextItem icon={Sparkles} label="Guests" value={`${eventGuests.length}`} sub={`${pendingRsvp} pending RSVP`} />
        </div>
      </Card>

      {/* Chat interface */}
      <Card className="p-0 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 380px)", minHeight: "420px" }}>
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center gap-2 bg-secondary/40">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">UtsavAI Assistant</p>
            <p className="text-xs text-muted-foreground truncate">
              Context: {event.name}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "oklch(0.55 0.12 150)" }} />
            Online
          </Badge>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-area-thin p-4 space-y-3"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && pendingCount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">Ask me anything about {event.name}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Try one of the suggested prompts below to get started.
              </p>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground border border-border"
                    )}
                  >
                    {m.content}
                    {m.role === "assistant" && m.isAiGenerated && (
                      <p className="mt-2 text-[10px] opacity-70 border-t border-border pt-1.5">
                        AI-generated. Review and adjust as needed.
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {pendingCount > 0 && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-foreground border border-border rounded-md px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                      <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Suggested prompts */}
        {messages.length === 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground/80 hover:border-foreground/30 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-3 flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={`Ask about ${event.name}...`}
            disabled={sending}
            aria-label="Ask the assistant"
          />
          <Button
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {error && (
        <div
          className="rounded-md p-4 border flex items-start gap-3"
          style={{
            backgroundColor: "oklch(0.55 0.18 25 / 0.05)",
            borderColor: "oklch(0.55 0.18 25 / 0.2)",
            color: "oklch(0.50 0.18 25)",
          }}
          role="alert"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Could not reach the assistant</p>
            <p className="text-xs mt-1 opacity-90">
              A network or rate-limit issue occurred. Try again in a moment.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            disabled={sending || !lastFailedInput}
            style={{ color: "oklch(0.50 0.18 25)", borderColor: "oklch(0.50 0.18 25 / 0.3)" }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

function ContextItem({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  Clock,
  IndianRupee,
  Store,
  Users,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { AppNotification, eventTypeMeta } from "@/lib/mock-data";
import { relativeTime } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  AppNotification["type"],
  { icon: typeof Bell; color: string; label: string }
> = {
  task_overdue: { icon: AlertCircle, color: "oklch(0.55 0.18 25)", label: "Task overdue" },
  deadline_approaching: { icon: Clock, color: "oklch(0.55 0.10 70)", label: "Deadline" },
  budget_warning: { icon: IndianRupee, color: "oklch(0.55 0.10 70)", label: "Budget" },
  vendor_warning: { icon: Store, color: "oklch(0.55 0.10 70)", label: "Vendor" },
  guest_reminder: { icon: Users, color: "oklch(0.55 0.10 320)", label: "Guest" },
  ai_plan_generated: { icon: Sparkles, color: "oklch(0.55 0.14 35)", label: "AI plan" },
  task_completed: { icon: ListChecks, color: "oklch(0.55 0.12 150)", label: "Task completed" },
};

export function NotificationsView() {
  const navigate = useAppStore((s) => s.navigate);
  const notifications = useAppStore((s) => s.notifications);
  const events = useAppStore((s) => s.events);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = useMemo(() => {
    return filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Notifications"
        title="Notification center"
        description="Stay on top of deadlines, budget updates, and vendor follow-ups. Mark notifications as read once you have handled them."
        actions={
          <>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && (
                <span
                  className="ml-1.5 h-4 min-w-4 px-1 rounded text-[10px] font-semibold text-white flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.55 0.18 25)" }}
                >
                  {unreadCount}
                </span>
              )}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark all read
              </Button>
            )}
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No unread notifications" : "No notifications"}
          description={
            filter === "unread"
              ? "You are all caught up. New notifications will appear here as your event plan evolves."
              : "Notifications about deadlines, budget, vendors, and AI plan updates will appear here."
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((n) => {
              const meta = typeMeta[n.type];
              const Icon = meta.icon;
              const event = events.find((e) => e.id === n.eventId);
              return (
                <li
                  key={n.id}
                  className={cn(
                    "p-4 flex items-start gap-3 transition-colors",
                    !n.read && "bg-primary/[0.02]"
                  )}
                >
                  <div
                    className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {!n.read && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "oklch(0.55 0.14 35)" }}
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {relativeTime(n.timestamp)}
                      </span>
                      {event && (
                        <button
                          type="button"
                          onClick={() => {
                            useAppStore.getState().setCurrentEvent(event.id);
                            navigate({ kind: "app", view: "event_overview" });
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          {event.name}
                        </button>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => markRead(n.id)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">Mark read</span>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

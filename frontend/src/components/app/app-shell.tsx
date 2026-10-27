"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  IndianRupee,
  ListChecks,
  CalendarRange,
  Store,
  Users,
  Clock,
  Sparkles,
  Bell,
  Settings,
  FileDown,
  Menu,
  X,
  ChevronDown,
  Plus,
  Check,
  Search,
  LogOut,
  User as UserIcon,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { useAppStore, AppView, Route } from "@/lib/store";
import { EventType, eventTypeMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { relativeTime, formatDate } from "@/lib/format";
import {
  Heart,
  Cake,
  Building2,
  Gift,
  PartyPopper,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";

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

interface NavItem {
  label: string;
  view: AppView;
  icon: typeof LayoutDashboard;
}

const currentEventItems: NavItem[] = [
  { label: "Overview", view: "event_overview", icon: CalendarDays },
  { label: "Budget", view: "budget", icon: IndianRupee },
  { label: "Expenses", view: "expenses", icon: Receipt },
  { label: "Tasks", view: "tasks", icon: ListChecks },
  { label: "Timeline", view: "timeline", icon: CalendarRange },
  { label: "Vendors", view: "vendors", icon: Store },
  { label: "Guests", view: "guests", icon: Users },
  { label: "Event-Day Schedule", view: "event_day", icon: Clock },
  { label: "AI Assistant", view: "ai_assistant", icon: Sparkles },
];

const generalItems: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: LayoutDashboard },
  { label: "Notifications", view: "notifications", icon: Bell },
  { label: "Settings", view: "settings", icon: Settings },
  { label: "Export", view: "export", icon: FileDown },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const route = useAppStore((s) => s.route);
  const navigate = useAppStore((s) => s.navigate);
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const setCurrentEvent = useAppStore((s) => s.setCurrentEvent);
  const notifications = useAppStore((s) => s.notifications);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentView = route.kind === "app" ? route.view : "dashboard";
  const currentEvent = events.find((e) => e.id === currentEventId) ?? events[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const go = (view: AppView) => {
    navigate({ kind: "app", view });
    setMobileOpen(false);
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <button
          type="button"
          onClick={() => go("dashboard")}
          aria-label="UtsavAI dashboard"
        >
          <Logo size={28} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-3 space-y-5" aria-label="Application navigation">
          {/* General */}
          <div className="space-y-0.5">
            {generalItems.filter((i) => i.view !== "notifications").map((item) => (
              <SidebarButton
                key={item.view}
                item={item}
                active={currentView === item.view}
                onClick={() => go(item.view)}
              />
            ))}
          </div>

          {/* Current event */}
          {currentEvent && (
            <div className="space-y-1">
              <div className="px-2 mb-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/50">
                  Current event
                </p>
              </div>
              <EventSelectorButton />
              <div className="space-y-0.5 mt-1">
                {currentEventItems.map((item) => (
                  <SidebarButton
                    key={item.view}
                    item={item}
                    active={currentView === item.view}
                    onClick={() => go(item.view)}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notifications with badge */}
          <div className="space-y-0.5">
            <SidebarButton
              item={{ label: "Notifications", view: "notifications", icon: Bell }}
              active={currentView === "notifications"}
              onClick={() => go("notifications")}
              badge={unreadCount > 0 ? unreadCount : undefined}
            />
          </div>
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-left"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email ?? ""}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email ?? "Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => go("settings")}>
              <UserIcon className="h-4 w-4 mr-2" />
              Profile and settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => go("notifications")}>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive"
              style={{ color: "oklch(0.55 0.18 25)" }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar z-30"
        aria-label="Sidebar navigation"
      >
        {Sidebar}
      </aside>

      {/* Mobile sidebar (drawer) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {Sidebar}
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Skip to content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-md"
        >
          Skip to content
        </a>
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Logo size={24} withText />
            </div>

            {/* Event indicator (desktop) */}
            {currentEvent && (
              <div className="hidden lg:flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: currentEvent.coverColor }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-foreground">
                  {currentEvent.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(currentEvent.date, "short")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => go("create_event")}
                className="hidden sm:inline-flex"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New event
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => go("notifications")}
                aria-label="Notifications"
                className="relative h-9 w-9"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                    style={{ backgroundColor: "oklch(0.55 0.18 25)" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 outline-none" id="main-content" tabIndex={-1}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarButton({
  item,
  active,
  onClick,
  compact,
  badge,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors",
        compact ? "px-2.5 py-1.5 ml-2" : "px-3 py-2",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <item.icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden="true" />
      <span className="flex-1 text-left">{item.label}</span>
      {badge !== undefined && (
        <span
          className="h-4 min-w-4 px-1 rounded text-[10px] font-semibold text-white flex items-center justify-center"
          style={{ backgroundColor: "oklch(0.55 0.18 25)" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function EventSelectorButton() {
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const setCurrentEvent = useAppStore((s) => s.setCurrentEvent);
  const navigate = useAppStore((s) => s.navigate);
  const [open, setOpen] = useState(false);

  const current = events.find((e) => e.id === currentEventId) ?? events[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors text-left"
          aria-label="Switch event"
        >
          <span
            className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${current?.coverColor ?? "oklch(0.55 0.14 35)"}18`,
              color: current?.coverColor ?? "oklch(0.55 0.14 35)",
            }}
          >
            {(() => {
              const Icon = current ? eventTypeIcons[current.type] : CalendarDays;
              return <Icon className="h-4 w-4" aria-hidden="true" />;
            })()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-sidebar-foreground/60">Active event</p>
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {current?.name ?? "No event"}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch event</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {events.map((e) => {
          const Icon = eventTypeIcons[e.type];
          const active = e.id === currentEventId;
          return (
            <DropdownMenuItem
              key={e.id}
              onClick={() => {
                setCurrentEvent(e.id);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <span
                className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${e.coverColor}18`, color: e.coverColor }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatDate(e.date, "short")}
                </p>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ kind: "app", view: "create_event" })}>
          <Plus className="h-4 w-4 mr-2" />
          Create new event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

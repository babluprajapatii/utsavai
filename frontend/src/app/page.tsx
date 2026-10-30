"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app/app-shell";
import { HomeView } from "@/components/views/home";
import { AboutView } from "@/components/views/about";
import { FeaturesView } from "@/components/views/features";
import { FaqView } from "@/components/views/faq";
import { LoginView } from "@/components/views/login";
import { RegisterView } from "@/components/views/register";
import { PrivacyView } from "@/components/views/privacy";
import { TermsView } from "@/components/views/terms";

const ViewLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const OnboardingFlow = dynamic(() => import("@/components/onboarding/onboarding-flow").then((m) => m.OnboardingFlow), { loading: ViewLoading });
const DashboardView = dynamic(() => import("@/components/views/dashboard").then((m) => m.DashboardView), { loading: ViewLoading });
const EventOverviewView = dynamic(() => import("@/components/views/event-overview").then((m) => m.EventOverviewView), { loading: ViewLoading });
const CreateEditEventView = dynamic(() => import("@/components/views/create-edit-event").then((m) => m.CreateEditEventView), { loading: ViewLoading });
const BudgetView = dynamic(() => import("@/components/views/budget").then((m) => m.BudgetView), { loading: ViewLoading });
const ExpensesView = dynamic(() => import("@/components/views/expenses").then((m) => m.ExpensesView), { loading: ViewLoading });
const TasksView = dynamic(() => import("@/components/views/tasks").then((m) => m.TasksView), { loading: ViewLoading });
const TimelineView = dynamic(() => import("@/components/views/timeline").then((m) => m.TimelineView), { loading: ViewLoading });
const VendorsView = dynamic(() => import("@/components/views/vendors").then((m) => m.VendorsView), { loading: ViewLoading });
const GuestsView = dynamic(() => import("@/components/views/guests").then((m) => m.GuestsView), { loading: ViewLoading });
const EventDayView = dynamic(() => import("@/components/views/event-day").then((m) => m.EventDayView), { loading: ViewLoading });
const AiAssistantView = dynamic(() => import("@/components/views/ai-assistant").then((m) => m.AiAssistantView), { loading: ViewLoading });
const NotificationsView = dynamic(() => import("@/components/views/notifications").then((m) => m.NotificationsView), { loading: ViewLoading });
const SettingsView = dynamic(() => import("@/components/views/settings").then((m) => m.SettingsView), { loading: ViewLoading });
const ExportView = dynamic(() => import("@/components/views/export").then((m) => m.ExportView), { loading: ViewLoading });

export default function Home() {
  const route = useAppStore((s) => s.route);
  const isAuthed = useAppStore((s) => s.isAuthed);
  const authLoading = useAppStore((s) => s.authLoading);
  const navigate = useAppStore((s) => s.navigate);
  const initAuth = useAppStore((s) => s.initAuth);

  // Initialize auth session from Supabase on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Auth guard: unauthenticated users cannot access onboarding or app views
  useEffect(() => {
    if (!authLoading && !isAuthed && route.kind !== "public") {
      navigate({ kind: "public", view: "login" });
    }
  }, [authLoading, isAuthed, route.kind, navigate]);

  // Redirect authenticated users from public home to dashboard
  useEffect(() => {
    if (!authLoading && isAuthed && route.kind === "public" && route.view === "home") {
      navigate({ kind: "app", view: "dashboard" });
    }
  }, [authLoading, isAuthed, route.kind, route.view, navigate]);

  // Public views - always accessible immediately without waiting for auth session check
  if (route.kind === "public") {
    switch (route.view) {
      case "home":
        return <HomeView />;
      case "about":
        return <AboutView />;
      case "features":
        return <FeaturesView />;
      case "faq":
        return <FaqView />;
      case "login":
        return <LoginView />;
      case "register":
        return <RegisterView />;
      case "privacy":
        return <PrivacyView />;
      case "terms":
        return <TermsView />;
      default:
        return <HomeView />;
    }
  }

  // If restoring auth session for protected routes, show subtle loading indicator to prevent flash
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-sans">Checking session...</p>
        </div>
      </div>
    );
  }

  // If not authed and trying to access protected views, show login
  if (!isAuthed) {
    return <LoginView />;
  }

  // Onboarding flow - requires auth
  if (route.kind === "onboarding") {
    return <OnboardingFlow />;
  }

  // Application views - requires auth
  if (route.kind === "app") {
    const renderView = () => {
      switch (route.view) {
        case "dashboard":
          return <DashboardView />;
        case "event_overview":
          return <EventOverviewView />;
        case "create_event":
          return <CreateEditEventView mode="create" />;
        case "edit_event":
          return <CreateEditEventView mode="edit" />;
        case "budget":
          return <BudgetView />;
        case "expenses":
          return <ExpensesView />;
        case "tasks":
          return <TasksView />;
        case "timeline":
          return <TimelineView />;
        case "vendors":
          return <VendorsView />;
        case "guests":
          return <GuestsView />;
        case "event_day":
          return <EventDayView />;
        case "ai_assistant":
          return <AiAssistantView />;
        case "notifications":
          return <NotificationsView />;
        case "settings":
          return <SettingsView />;
        case "export":
          return <ExportView />;
        default:
          return <DashboardView />;
      }
    };

    return <AppShell>{renderView()}</AppShell>;
  }

  return <HomeView />;
}

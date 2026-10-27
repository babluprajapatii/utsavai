"use client";

import { useEffect } from "react";
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
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { DashboardView } from "@/components/views/dashboard";
import { EventOverviewView } from "@/components/views/event-overview";
import { CreateEditEventView } from "@/components/views/create-edit-event";
import { BudgetView } from "@/components/views/budget";
import { ExpensesView } from "@/components/views/expenses";
import { TasksView } from "@/components/views/tasks";
import { TimelineView } from "@/components/views/timeline";
import { VendorsView } from "@/components/views/vendors";
import { GuestsView } from "@/components/views/guests";
import { EventDayView } from "@/components/views/event-day";
import { AiAssistantView } from "@/components/views/ai-assistant";
import { NotificationsView } from "@/components/views/notifications";
import { SettingsView } from "@/components/views/settings";
import { ExportView } from "@/components/views/export";

export default function Home() {
  const route = useAppStore((s) => s.route);
  const isAuthed = useAppStore((s) => s.isAuthed);
  const navigate = useAppStore((s) => s.navigate);

  // Auth guard: unauthenticated users cannot access onboarding or app views.
  // This is a frontend-only guard for the demo. A real backend must re-verify
  // auth on every API call - this guard alone is NOT sufficient for security.
  useEffect(() => {
    if (!isAuthed && route.kind !== "public") {
      navigate({ kind: "public", view: "login" });
    }
  }, [isAuthed, route.kind, navigate]);

  // Public views - always accessible
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

  // If not authed and trying to access protected views, show login
  // (the useEffect above will redirect, but this prevents any flash)
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

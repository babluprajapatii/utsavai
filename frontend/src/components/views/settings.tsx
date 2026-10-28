"use client";
 

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { User, Bell, Sparkles, Palette, Shield, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { useAppStore } from "@/lib/store";
import { SectionHeading } from "@/components/shared/section-heading";
import { useToast } from "@/hooks/use-toast";

export function SettingsView() {
  const { toast } = useToast();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState("Planning our wedding and family celebrations.");

  const [notifPrefs, setNotifPrefs] = useState({
    taskOverdue: true,
    deadlineApproaching: true,
    budgetWarning: true,
    vendorWarning: true,
    guestReminder: true,
    aiPlanGenerated: false,
  });

  const [aiPrefs, setAiPrefs] = useState({
    suggestionsInDashboard: true,
    autoGeneratePlan: true,
    eventContextSharing: true,
    responseStyle: "concise" as "concise" | "detailed",
  });

  const [appearance, setAppearance] = useState({
    density: "comfortable" as "comfortable" | "compact",
    reduceMotion: false,
  });

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const save = (what: string) => {
    // In this demo, settings are not persisted to a backend. The toast
    // confirms the user's intent but the values are lost on refresh.
    toast({
      title: "Demo: changes not persisted",
      description: `${what}. Connect a backend to save settings across sessions.`,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Settings"
        title="Account settings"
        description="Manage your profile, preferences, notifications, and AI behavior."
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6 space-y-4 gap-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-semibold font-display">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Change avatar
                </Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => save("Profile updated")}>Save profile</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-4">
          <Card className="p-6 space-y-4 gap-0">
            <h3 className="text-base font-semibold font-display">Account information</h3>
            <div className="space-y-2">
              <Row label="Account email" value={user?.email ?? ""} />
              <Row label="Member since" value="October 2026" />
              <Row label="Plan" value={<Badge variant="outline">Demo</Badge>} />
              <Row label="Events tracked" value="3" />
            </div>
          </Card>
          <Card className="p-6 space-y-4 gap-0">
            <h3 className="text-base font-semibold font-display">Danger zone</h3>
            <p className="text-sm text-muted-foreground">
              These actions are permanent. Be careful.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30" style={{ color: "oklch(0.55 0.18 25)", borderColor: "oklch(0.55 0.18 25 / 0.3)" }}>
                    Delete account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your events, tasks, vendors, and guests.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      style={{ backgroundColor: "oklch(0.55 0.18 25)", color: "white" }}
                      onClick={() => logout()}
                    >
                      Delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6 space-y-1 gap-0">
            <h3 className="text-base font-semibold font-display mb-4">Notification preferences</h3>
            {[
              { key: "taskOverdue" as const, label: "Task overdue", desc: "When a task passes its due date without completion." },
              { key: "deadlineApproaching" as const, label: "Deadline approaching", desc: "When a task is due within 3 days." },
              { key: "budgetWarning" as const, label: "Budget warning", desc: "When spending exceeds planned amounts." },
              { key: "vendorWarning" as const, label: "Vendor follow-up needed", desc: "When a vendor has not confirmed booking." },
              { key: "guestReminder" as const, label: "Guest RSVP reminder", desc: "When many guests have not responded." },
              { key: "aiPlanGenerated" as const, label: "AI plan generated", desc: "When a new AI-generated plan is ready." },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
                </div>
                <Switch
                  checked={notifPrefs[row.key]}
                  onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, [row.key]: v }))}
                  aria-label={row.label}
                />
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <Button onClick={() => save("Notification preferences saved")}>
                Save preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* AI */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="p-6 space-y-1 gap-0">
            <h3 className="text-base font-semibold font-display mb-4">AI preferences</h3>
            {[
              { key: "suggestionsInDashboard" as const, label: "Show AI suggestions on dashboard", desc: "Surface recommendations and risks on the dashboard." },
              { key: "autoGeneratePlan" as const, label: "Auto-generate plan after onboarding", desc: "Trigger plan generation automatically when onboarding completes." },
              { key: "eventContextSharing" as const, label: "Share event context with assistant", desc: "Allow the assistant to use your event details in responses." },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
                </div>
                <Switch
                  checked={aiPrefs[row.key]}
                  onCheckedChange={(v) => setAiPrefs((p) => ({ ...p, [row.key]: v }))}
                  aria-label={row.label}
                />
              </div>
            ))}
            <div className="py-3 border-b border-border">
              <Label htmlFor="ai-style" className="block mb-2">Response style</Label>
              <Select
                value={aiPrefs.responseStyle}
                onValueChange={(v) => setAiPrefs((p) => ({ ...p, responseStyle: v as any }))}
              >
                <SelectTrigger id="ai-style" className="sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Concise responses are short and direct. Detailed responses include more context and explanation.
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => save("AI preferences saved")}>Save preferences</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="p-6 space-y-1 gap-0">
            <h3 className="text-base font-semibold font-display mb-4">Appearance</h3>
            <div className="py-3 border-b border-border">
              <Label className="block mb-2">Theme</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Choose between light, dark, or follow your system preference.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:max-w-md">
                <ThemeOptionCard
                  label="Light"
                  active={mounted && theme === "light"}
                  onClick={() => setTheme("light")}
                  preview="light"
                />
                <ThemeOptionCard
                  label="Dark"
                  active={mounted && theme === "dark"}
                  onClick={() => setTheme("dark")}
                  preview="dark"
                />
                <ThemeOptionCard
                  label="System"
                  active={mounted && (theme === "system" || !theme)}
                  onClick={() => setTheme("system")}
                  preview="system"
                />
              </div>
            </div>
            <div className="py-3 border-b border-border">
              <Label className="block mb-2">Density</Label>
              <Select
                value={appearance.density}
                onValueChange={(v) => setAppearance((p) => ({ ...p, density: v as any }))}
              >
                <SelectTrigger className="sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex-1 pr-3">
                <p className="text-sm font-medium text-foreground">Reduce motion</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Minimize transitions and animations across the interface.
                </p>
              </div>
              <Switch
                checked={appearance.reduceMotion}
                onCheckedChange={(v) => setAppearance((p) => ({ ...p, reduceMotion: v }))}
                aria-label="Reduce motion"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => save("Appearance saved")}>Save appearance</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-6 space-y-4 gap-0">
            <h3 className="text-base font-semibold font-display">Password</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cur-pw">Current password</Label>
                <Input id="cur-pw" type="password" placeholder="Enter current password" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input id="new-pw" type="password" placeholder="New password" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="conf-pw">Confirm new password</Label>
                  <Input id="conf-pw" type="password" placeholder="Confirm new password" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => save("Password updated")}>Update password</Button>
            </div>
          </Card>

          <Card className="p-6 space-y-3 gap-0">
            <h3 className="text-base font-semibold font-display">Sessions</h3>
            <p className="text-sm text-muted-foreground">
              You are currently signed in on this device.
            </p>
            <div className="flex items-center justify-between p-3 rounded-md border border-border bg-secondary/40">
              <div>
                <p className="text-sm font-medium text-foreground">This device</p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
              <Badge variant="outline" className="text-xs">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "oklch(0.55 0.12 150)" }} />
                Current
              </Badge>
            </div>
          </Card>

          <Card className="p-6 space-y-3 gap-0">
            <h3 className="text-base font-semibold font-display">Sign out</h3>
            <p className="text-sm text-muted-foreground">
              Sign out from this device. You will need to log in again to access your events.
            </p>
            <div>
              <Button
                variant="outline"
                onClick={() => logout()}
                className="text-destructive border-destructive/30"
                style={{ color: "oklch(0.55 0.18 25)", borderColor: "oklch(0.55 0.18 25 / 0.3)" }}
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign out
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ThemeOptionCard({
  label,
  active,
  onClick,
  preview,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  preview: "light" | "dark" | "system";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative text-left p-3 rounded-md border-2 transition-all ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-foreground/30"
      }`}
    >
      {/* Preview swatch */}
      <div className="flex h-16 rounded-sm overflow-hidden border border-border mb-2">
        {preview === "system" ? (
          <>
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-neutral-900" />
          </>
        ) : preview === "light" ? (
          <div className="flex-1 bg-[#faf8f3] relative">
            <div className="absolute inset-2 flex flex-col gap-1">
              <div className="h-1 w-3/4 bg-amber-700/30 rounded-sm" />
              <div className="h-1 w-1/2 bg-neutral-400/40 rounded-sm" />
              <div className="mt-auto h-2 bg-amber-700/20 rounded-sm" />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#1c1814] relative">
            <div className="absolute inset-2 flex flex-col gap-1">
              <div className="h-1 w-3/4 bg-amber-500/40 rounded-sm" />
              <div className="h-1 w-1/2 bg-neutral-500/40 rounded-sm" />
              <div className="mt-auto h-2 bg-amber-500/20 rounded-sm" />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {active && (
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
}

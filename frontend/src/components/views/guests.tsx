"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Filter,
  Phone,
  ChevronDown,
  Check,
  X,
  Clock,
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
  Guest,
  RsvpStatus,
  rsvpMeta,
  guestsForEvent,
} from "@/lib/mock-data";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const rsvpStatuses: RsvpStatus[] = ["pending", "accepted", "declined"];
const mealOptions = ["veg", "non-veg", "jain", "vegan"] as const;

export function GuestsView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const guests = useAppStore((s) => s.guests);
  const addGuest = useAppStore((s) => s.addGuest);
  const updateGuest = useAppStore((s) => s.updateGuest);
  const setRsvp = useAppStore((s) => s.setRsvp);
  const deleteGuest = useAppStore((s) => s.deleteGuest);

  const event = events.find((e) => e.id === currentEventId);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const eventGuests = useMemo(() => {
    if (!event) return [];
    let list = guestsForEvent(guests, event.id);
    if (search) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(search.toLowerCase()) ||
          (g.group ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (rsvpFilter !== "all") list = list.filter((g) => g.rsvp === rsvpFilter);
    if (groupFilter !== "all") list = list.filter((g) => g.group === groupFilter);
    return list;
  }, [guests, event, search, rsvpFilter, groupFilter]);

  const groups = useMemo(() => {
    if (!event) return [];
    const set = new Set<string>();
    guestsForEvent(guests, event.id).forEach((g) => g.group && set.add(g.group));
    return Array.from(set);
  }, [guests, event]);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const allEventGuests = guestsForEvent(guests, event.id);
  const total = allEventGuests.length;
  const acceptedCount = allEventGuests.filter((g) => g.rsvp === "accepted").length;
  const pendingCount = allEventGuests.filter((g) => g.rsvp === "pending").length;
  const declinedCount = allEventGuests.filter((g) => g.rsvp === "declined").length;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const changeRsvp = (guest: Guest, rsvp: RsvpStatus) => {
    setRsvp(guest.id, rsvp);
    toast({
      title: "RSVP updated",
      description: `${guest.name} - ${rsvpMeta[rsvp].label}`,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Guests"
        title="Guest management"
        description={`Manage RSVPs for ${event.name}. Update status, meal preferences, and special requirements.`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add guest
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total guests</p>
          <p className="text-2xl font-semibold font-display mt-1">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Accepted</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.45 0.10 150)" }}>
            {acceptedCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.55 0.10 70)" }}>
            {pendingCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Declined</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.50 0.18 25)" }}>
            {declinedCount}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search guests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search guests"
            />
          </div>
          <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
            <SelectTrigger className="sm:w-44">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All RSVP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RSVP</SelectItem>
              {rsvpStatuses.map((s) => (
                <SelectItem key={s} value={s}>{rsvpMeta[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {groups.length > 0 && (
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="sm:w-44">
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </Card>

      {/* List */}
      {eventGuests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Add guests to track RSVPs, meal preferences, and special requirements. Group them by family or relationship for easier organization."
          actionLabel="Add guest"
          onAction={openAdd}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {eventGuests.map((g) => {
            const statusM = rsvpMeta[g.rsvp];
            return (
              <Card key={g.id} className="p-4 gap-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{g.name}</p>
                    {g.group && (
                      <p className="text-xs text-muted-foreground mt-0.5">{g.group}</p>
                    )}
                  </div>
                  <RsvpDropdown guest={g} onChange={(s) => changeRsvp(g, s)} />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground">
                  {g.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {g.phone}
                    </span>
                  )}
                  {g.mealPreference && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {g.mealPreference}
                    </Badge>
                  )}
                  {g.plusOnes ? (
                    <span>+{g.plusOnes} guest{g.plusOnes > 1 ? "s" : ""}</span>
                  ) : null}
                </div>

                {g.specialRequirements && (
                  <p className="text-xs text-foreground/70 mt-2 pt-2 border-t border-border">
                    {g.specialRequirements}
                  </p>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => { setEditing(g); setDialogOpen(true); }}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setDeleteId(g.id)}
                    style={{ color: "oklch(0.55 0.18 25)" }}
                    aria-label={`Delete ${g.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <GuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        guest={editing}
        eventId={event.id}
        onSave={(data) => {
          if (editing) {
            updateGuest(editing.id, data);
            toast({ title: "Guest updated" });
          } else {
            addGuest({ ...data, eventId: event.id });
            toast({ title: "Guest added" });
          }
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this guest?</AlertDialogTitle>
            <AlertDialogDescription>
              The guest will be permanently removed from the list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteGuest(deleteId);
                  toast({ title: "Guest removed" });
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

function RsvpDropdown({ guest, onChange }: { guest: Guest; onChange: (s: RsvpStatus) => void }) {
  const statusM = rsvpMeta[guest.rsvp];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border border-border hover:border-foreground/30 transition-colors shrink-0"
          style={{
            backgroundColor: `${statusM.color}15`,
            color: statusM.color,
            borderColor: `${statusM.color}40`,
          }}
          aria-label={`RSVP: ${statusM.label}. Click to change.`}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusM.dot)} aria-hidden="true" />
          {statusM.label}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Set RSVP</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {rsvpStatuses.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onChange(s)}>
            <span className={cn("h-1.5 w-1.5 rounded-full mr-2", rsvpMeta[s].dot)} aria-hidden="true" />
            {rsvpMeta[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GuestDialog({
  open,
  onOpenChange,
  guest,
  eventId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  guest: Guest | null;
  eventId: string;
  onSave: (data: Omit<Guest, "id" | "eventId">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    group: "",
    phone: "",
    email: "",
    rsvp: "pending" as RsvpStatus,
    mealPreference: "veg" as "veg" | "non-veg" | "jain" | "vegan" | undefined,
    specialRequirements: "",
    notes: "",
    plusOnes: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (guest) {
        setForm({
          name: guest.name,
          group: guest.group ?? "",
          phone: guest.phone ?? "",
          email: guest.email ?? "",
          rsvp: guest.rsvp,
          mealPreference: guest.mealPreference,
          specialRequirements: guest.specialRequirements ?? "",
          notes: guest.notes ?? "",
          plusOnes: guest.plusOnes ?? 0,
        });
      } else {
        setForm({
          name: "",
          group: "",
          phone: "",
          email: "",
          rsvp: "pending",
          mealPreference: "veg",
          specialRequirements: "",
          notes: "",
          plusOnes: 0,
        });
      }
      setErrors({});
    }
  }, [open, guest]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    if (form.plusOnes < 0) e.plusOnes = "Cannot be negative.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      group: form.group.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      rsvp: form.rsvp,
      mealPreference: form.mealPreference,
      specialRequirements: form.specialRequirements.trim() || undefined,
      notes: form.notes.trim() || undefined,
      plusOnes: form.plusOnes > 0 ? form.plusOnes : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{guest ? "Edit guest" : "Add guest"}</DialogTitle>
          <DialogDescription>
            {guest ? "Update guest details." : "Add a guest to the list."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scroll-area-thin pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="g-name">Name</Label>
            <Input
              id="g-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Priya Sharma"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-group">Group / family (optional)</Label>
              <Input
                id="g-group"
                value={form.group}
                onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
                placeholder="e.g. Bride's family"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-rsvp">RSVP status</Label>
              <Select
                value={form.rsvp}
                onValueChange={(v) => setForm((p) => ({ ...p, rsvp: v as RsvpStatus }))}
              >
                <SelectTrigger id="g-rsvp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rsvpStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{rsvpMeta[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-phone">Phone (optional)</Label>
              <Input
                id="g-phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98450 12345"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-email">Email (optional)</Label>
              <Input
                id="g-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="g-meal">Meal preference</Label>
              <Select
                value={form.mealPreference ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, mealPreference: v as any }))}
              >
                <SelectTrigger id="g-meal">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {mealOptions.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-plus">Plus ones</Label>
              <Input
                id="g-plus"
                type="number"
                min={0}
                value={form.plusOnes}
                onChange={(e) => setForm((p) => ({ ...p, plusOnes: Number(e.target.value) }))}
                aria-invalid={!!errors.plusOnes}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-special">Special requirements (optional)</Label>
            <Input
              id="g-special"
              value={form.specialRequirements}
              onChange={(e) => setForm((p) => ({ ...p, specialRequirements: e.target.value }))}
              placeholder="e.g. Wheelchair access"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-notes">Notes (optional)</Label>
            <Textarea
              id="g-notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{guest ? "Save changes" : "Add guest"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";
 

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Store,
  Filter,
  Phone,
  Mail,
  IndianRupee,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Vendor,
  VendorStatus,
  vendorStatusMeta,
  BudgetCategory,
  categoryMeta,
} from "@/lib/mock-data";
import { formatINR, formatDate } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statuses: VendorStatus[] = [
  "researching", "shortlisted", "contacted", "negotiating", "booked", "completed", "cancelled",
];
const categories = Object.keys(categoryMeta) as BudgetCategory[];

export function VendorsView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const vendors = useAppStore((s) => s.vendors);
  const addVendor = useAppStore((s) => s.addVendor);
  const updateVendor = useAppStore((s) => s.updateVendor);
  const setVendorStatus = useAppStore((s) => s.setVendorStatus);
  const deleteVendor = useAppStore((s) => s.deleteVendor);

  const event = events.find((e) => e.id === currentEventId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const eventVendors = useMemo(() => {
    if (!event) return [];
    let list = vendors.filter((vendor) => vendor.eventId === event.id);
    if (search) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          (v.contactName ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") list = list.filter((v) => v.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((v) => v.category === categoryFilter);
    return list;
  }, [vendors, event, search, statusFilter, categoryFilter]);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const totalEstimated = eventVendors.reduce((s, v) => s + v.estimatedCost, 0);
  const totalActual = eventVendors.reduce((s, v) => s + (v.actualCost ?? 0), 0);
  const bookedCount = eventVendors.filter((v) => v.status === "booked").length;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const changeStatus = (vendor: Vendor, status: VendorStatus) => {
    setVendorStatus(vendor.id, status);
    toast({
      title: "Status updated",
      description: `${vendor.name} - ${vendorStatusMeta[status].label}`,
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Vendors"
        title="Vendor management"
        description={`Track vendors for ${event.name}. A workspace, not a marketplace. You research and book vendors on your own terms.`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add vendor
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total vendors</p>
          <p className="text-2xl font-semibold font-display mt-1">{eventVendors.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Booked</p>
          <p className="text-2xl font-semibold font-display mt-1" style={{ color: "oklch(0.45 0.10 150)" }}>
            {bookedCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated total</p>
          <p className="text-xl font-semibold font-display mt-1">{formatINR(totalEstimated)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Actual spent</p>
          <p className="text-xl font-semibold font-display mt-1">{formatINR(totalActual)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search vendors"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-44">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{categoryMeta[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{vendorStatusMeta[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {eventVendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors tracked"
          description="Add vendors as you research them. Track contacts, costs, and booking status in one workspace."
          actionLabel="Add vendor"
          onAction={openAdd}
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="p-0 overflow-hidden hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booking date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventVendors.map((v) => {
                  const catMeta = categoryMeta[v.category];
                  const statusM = vendorStatusMeta[v.status];
                  return (
                    <TableRow key={v.id} className="cursor-pointer" onClick={() => setDetailVendor(v)}>
                      <TableCell>
                        <p className="font-medium text-foreground">{v.name}</p>
                        {v.contactName && (
                          <p className="text-xs text-muted-foreground mt-0.5">{v.contactName}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ color: catMeta.color, borderColor: `${catMeta.color}40` }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: catMeta.color }} aria-hidden="true" />
                          {catMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatINR(v.estimatedCost)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {v.actualCost ? formatINR(v.actualCost) : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusDropdown vendor={v} onChange={(s) => changeStatus(v, s)} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {v.bookingDate ? formatDate(v.bookingDate, "short") : "-"}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditing(v); setDialogOpen(true); }}
                            aria-label={`Edit ${v.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteId(v.id)}
                            aria-label={`Delete ${v.name}`}
                            style={{ color: "oklch(0.55 0.18 25)" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {eventVendors.map((v) => {
              const catMeta = categoryMeta[v.category];
              return (
                <Card key={v.id} className="p-4 gap-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.contactName ?? catMeta.label}</p>
                    </div>
                    <StatusDropdown vendor={v} onChange={(s) => changeStatus(v, s)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated</p>
                      <p className="font-medium">{formatINR(v.estimatedCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actual</p>
                      <p className="font-medium">{v.actualCost ? formatINR(v.actualCost) : "-"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDetailVendor(v)}
                    >
                      View details
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditing(v); setDialogOpen(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteId(v.id)}
                      style={{ color: "oklch(0.55 0.18 25)" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit dialog */}
      <VendorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={editing}
        eventId={event.id}
        onSave={(data) => {
          if (editing) {
            updateVendor(editing.id, data);
            toast({ title: "Vendor updated" });
          } else {
            addVendor({ ...data, eventId: event.id });
            toast({ title: "Vendor added" });
          }
          setDialogOpen(false);
        }}
      />

      {/* Detail dialog */}
      <Dialog open={!!detailVendor} onOpenChange={(o) => !o && setDetailVendor(null)}>
        <DialogContent className="sm:max-w-lg">
          {detailVendor && (
            <>
              <DialogHeader>
                <DialogTitle>{detailVendor.name}</DialogTitle>
                <DialogDescription>
                  {categoryMeta[detailVendor.category].label} - {vendorStatusMeta[detailVendor.status].label}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {detailVendor.contactName && (
                  <DetailRow label="Contact name" value={detailVendor.contactName} />
                )}
                {detailVendor.phone && (
                  <DetailRow icon={Phone} label="Phone" value={detailVendor.phone} />
                )}
                {detailVendor.email && (
                  <DetailRow icon={Mail} label="Email" value={detailVendor.email} />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Estimated cost" value={formatINR(detailVendor.estimatedCost)} />
                  <DetailRow label="Actual cost" value={detailVendor.actualCost ? formatINR(detailVendor.actualCost) : "-"} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Status" value={vendorStatusMeta[detailVendor.status].label} />
                  <DetailRow label="Booking date" value={detailVendor.bookingDate ? formatDate(detailVendor.bookingDate, "short") : "-"} />
                </div>
                {detailVendor.notes && (
                  <DetailRow label="Notes" value={detailVendor.notes} />
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => { setEditing(detailVendor); setDetailVendor(null); setDialogOpen(true); }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button onClick={() => setDetailVendor(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              The vendor will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteVendor(deleteId);
                  toast({ title: "Vendor deleted" });
                  setDeleteId(null);
                }
              }}
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

function StatusDropdown({ vendor, onChange }: { vendor: Vendor; onChange: (s: VendorStatus) => void }) {
  const statusM = vendorStatusMeta[vendor.status];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:border-foreground/30 transition-colors"
          style={{
            backgroundColor: `${statusM.color}15`,
            color: statusM.color,
            borderColor: `${statusM.color}40`,
          }}
          aria-label={`Status: ${statusM.label}. Click to change.`}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusM.color }} aria-hidden="true" />
          {statusM.label}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statuses.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onChange(s)}>
            <span className="h-1.5 w-1.5 rounded-full mr-2" style={{ backgroundColor: vendorStatusMeta[s].color }} aria-hidden="true" />
            {vendorStatusMeta[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon?: typeof Phone; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function VendorDialog({
  open,
  onOpenChange,
  vendor,
  eventId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vendor: Vendor | null;
  eventId: string;
  onSave: (data: Omit<Vendor, "id" | "eventId">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    category: "venue" as BudgetCategory,
    contactName: "",
    phone: "",
    email: "",
    estimatedCost: 0,
    actualCost: 0,
    status: "researching" as VendorStatus,
    bookingDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (vendor) {
        setForm({
          name: vendor.name,
          category: vendor.category,
          contactName: vendor.contactName ?? "",
          phone: vendor.phone ?? "",
          email: vendor.email ?? "",
          estimatedCost: vendor.estimatedCost,
          actualCost: vendor.actualCost ?? 0,
          status: vendor.status,
          bookingDate: vendor.bookingDate ?? "",
          notes: vendor.notes ?? "",
        });
      } else {
        setForm({
          name: "",
          category: "venue",
          contactName: "",
          phone: "",
          email: "",
          estimatedCost: 0,
          actualCost: 0,
          status: "researching",
          bookingDate: "",
          notes: "",
        });
      }
      setErrors({});
    }
  }, [open, vendor]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vendor name is required.";
    if (form.estimatedCost < 0) e.estimatedCost = "Cannot be negative.";
    if (form.actualCost < 0) e.actualCost = "Cannot be negative.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      category: form.category,
      contactName: form.contactName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      estimatedCost: form.estimatedCost,
      actualCost: form.actualCost > 0 ? form.actualCost : undefined,
      status: form.status,
      bookingDate: form.bookingDate || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit vendor" : "Add vendor"}</DialogTitle>
          <DialogDescription>
            {vendor ? "Update vendor details." : "Add a vendor you are researching or have booked."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scroll-area-thin pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="v-name">Vendor name</Label>
            <Input
              id="v-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Saffron Caterers"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-cat">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v as BudgetCategory }))}
              >
                <SelectTrigger id="v-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{categoryMeta[c].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as VendorStatus }))}
              >
                <SelectTrigger id="v-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{vendorStatusMeta[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-contact">Contact name (optional)</Label>
            <Input
              id="v-contact"
              value={form.contactName}
              onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
              placeholder="e.g. Mrs. Lakshmi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-phone">Phone (optional)</Label>
              <Input
                id="v-phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98450 12345"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-email">Email (optional)</Label>
              <Input
                id="v-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="events@example.in"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-est">Estimated cost (₹)</Label>
              <Input
                id="v-est"
                type="number"
                min={0}
                value={form.estimatedCost}
                onChange={(e) => setForm((p) => ({ ...p, estimatedCost: Number(e.target.value) }))}
                aria-invalid={!!errors.estimatedCost}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-act">Actual cost (₹)</Label>
              <Input
                id="v-act"
                type="number"
                min={0}
                value={form.actualCost}
                onChange={(e) => setForm((p) => ({ ...p, actualCost: Number(e.target.value) }))}
                aria-invalid={!!errors.actualCost}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-booking">Booking date (optional)</Label>
            <Input
              id="v-booking"
              type="date"
              value={form.bookingDate}
              onChange={(e) => setForm((p) => ({ ...p, bookingDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-notes">Notes (optional)</Label>
            <Textarea
              id="v-notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Menu, deliverables, special arrangements"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{vendor ? "Save changes" : "Add vendor"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

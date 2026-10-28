"use client";
 

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, IndianRupee, Filter } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  BudgetCategory,
  categoryMeta,
  Expense,
} from "@/lib/mock-data";
import { formatINR, formatDate } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const categories = Object.keys(categoryMeta) as BudgetCategory[];

export function ExpensesView() {
  const { toast } = useToast();
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const expenses = useAppStore((s) => s.expenses);
  const addExpense = useAppStore((s) => s.addExpense);
  const updateExpense = useAppStore((s) => s.updateExpense);
  const deleteExpense = useAppStore((s) => s.deleteExpense);

  const event = events.find((e) => e.id === currentEventId);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const eventExpenses = useMemo(() => {
    if (!event) return [];
    let list = expenses.filter((expense) => expense.eventId === event.id);
    if (search) {
      list = list.filter((e) =>
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterCat !== "all") {
      list = list.filter((e) => e.category === filterCat);
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, event, search, filterCat]);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteExpense(deleteId);
      toast({ title: "Expense deleted" });
      setDeleteId(null);
    }
  };

  const totalActual = eventExpenses.reduce((s, e) => s + e.actualAmount, 0);
  const totalPlanned = eventExpenses.reduce((s, e) => s + e.plannedAmount, 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Expenses"
        title="Expense tracking"
        description={`All expenses for ${event.name}. Add, edit, and track actual versus planned amounts.`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add expense
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total planned</p>
          <p className="text-xl font-semibold font-display mt-1">{formatINR(totalPlanned)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total spent</p>
          <p className="text-xl font-semibold font-display mt-1">{formatINR(totalActual)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Variance</p>
          <p
            className="text-xl font-semibold font-display mt-1 tabular-nums"
            style={{
              color: totalActual - totalPlanned > 0 ? "oklch(0.55 0.18 25)" : "oklch(0.55 0.12 150)",
            }}
          >
            {totalActual - totalPlanned > 0 ? "+" : ""}
            {formatINR(totalActual - totalPlanned)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search expenses"
            />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="sm:w-48">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryMeta[c].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {eventExpenses.length === 0 ? (
        <EmptyState
          icon={IndianRupee}
          title="No expenses yet"
          description="Track planned and actual spending across categories. Add your first expense to get started."
          actionLabel="Add expense"
          onAction={openAdd}
        />
      ) : (
        <>
          <Card className="p-0 overflow-hidden hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventExpenses.map((e) => {
                  const meta = categoryMeta[e.category as BudgetCategory] ?? categoryMeta.contingency;
                  const variance = e.actualAmount - e.plannedAmount;
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{e.description}</p>
                        {e.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{e.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ color: meta.color, borderColor: `${meta.color}40` }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                            aria-hidden="true"
                          />
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatINR(e.plannedAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatINR(e.actualAmount)}
                        {variance !== 0 && (
                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color: variance > 0 ? "oklch(0.55 0.18 25)" : "oklch(0.55 0.12 150)",
                            }}
                          >
                            {variance > 0 ? "+" : ""}
                            {formatINR(variance)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(e.date, "short")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(e)}
                            aria-label={`Edit ${e.description}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => setDeleteId(e.id)}
                            aria-label={`Delete ${e.description}`}
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

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {eventExpenses.map((e) => {
              const meta = categoryMeta[e.category as BudgetCategory] ?? categoryMeta.contingency;
              const variance = e.actualAmount - e.plannedAmount;
              return (
                <Card key={e.id} className="p-4 gap-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{e.description}</p>
                      {e.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{e.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ color: meta.color, borderColor: `${meta.color}40` }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                            aria-hidden="true"
                          />
                          {meta.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(e.date, "short")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(e)}
                        aria-label={`Edit ${e.description}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteId(e.id)}
                        aria-label={`Delete ${e.description}`}
                        style={{ color: "oklch(0.55 0.18 25)" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Planned</p>
                      <p className="font-medium text-foreground tabular-nums">{formatINR(e.plannedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actual</p>
                      <p className="font-medium text-foreground tabular-nums">{formatINR(e.actualAmount)}</p>
                      {variance !== 0 && (
                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color: variance > 0 ? "oklch(0.55 0.18 25)" : "oklch(0.55 0.12 150)",
                          }}
                        >
                          {variance > 0 ? "+" : ""}
                          {formatINR(variance)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit dialog */}
      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editing}
        eventId={event.id}
        onSave={(data) => {
          if (editing) {
            updateExpense(editing.id, data);
            toast({ title: "Expense updated" });
          } else {
            addExpense({ ...data, eventId: event.id });
            toast({ title: "Expense added" });
          }
          setDialogOpen(false);
        }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This expense will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  eventId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  expense: Expense | null;
  eventId: string;
  onSave: (data: Omit<Expense, "id" | "eventId">) => void;
}) {
  const [form, setForm] = useState({
    category: "venue" as BudgetCategory,
    description: "",
    plannedAmount: 0,
    actualAmount: 0,
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (expense) {
        setForm({
          category: expense.category as BudgetCategory,
          description: expense.description,
          plannedAmount: expense.plannedAmount,
          actualAmount: expense.actualAmount,
          date: expense.date,
          notes: expense.notes ?? "",
        });
      } else {
        setForm({
          category: "venue",
          description: "",
          plannedAmount: 0,
          actualAmount: 0,
          date: new Date().toISOString().slice(0, 10),
          notes: "",
        });
      }
      setErrors({});
    }
  }, [open, expense]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.plannedAmount < 0) e.plannedAmount = "Cannot be negative.";
    if (form.actualAmount < 0) e.actualAmount = "Cannot be negative.";
    if (!form.date) e.date = "Date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      category: form.category,
      description: form.description.trim(),
      plannedAmount: form.plannedAmount,
      actualAmount: form.actualAmount,
      date: form.date,
      notes: form.notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            {expense ? "Update this expense record." : "Record a new expense for this event."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="exp-desc">Description</Label>
            <Input
              id="exp-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Catering advance"
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.description}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-cat">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v as BudgetCategory }))}
            >
              <SelectTrigger id="exp-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryMeta[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-planned">Planned (₹)</Label>
              <Input
                id="exp-planned"
                type="number"
                min={0}
                value={form.plannedAmount}
                onChange={(e) => setForm((p) => ({ ...p, plannedAmount: Number(e.target.value) }))}
                aria-invalid={!!errors.plannedAmount}
              />
              {errors.plannedAmount && (
                <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.plannedAmount}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-actual">Actual (₹)</Label>
              <Input
                id="exp-actual"
                type="number"
                min={0}
                value={form.actualAmount}
                onChange={(e) => setForm((p) => ({ ...p, actualAmount: Number(e.target.value) }))}
                aria-invalid={!!errors.actualAmount}
              />
              {errors.actualAmount && (
                <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.actualAmount}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-date">Date</Label>
            <Input
              id="exp-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              aria-invalid={!!errors.date}
            />
            {errors.date && (
              <p className="text-xs" style={{ color: "oklch(0.55 0.18 25)" }}>{errors.date}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exp-notes">Notes (optional)</Label>
            <Textarea
              id="exp-notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional context"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{expense ? "Save changes" : "Add expense"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

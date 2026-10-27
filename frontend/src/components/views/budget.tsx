"use client";

import { useMemo } from "react";
import { IndianRupee, TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/store";
import {
  BudgetCategory,
  categoryMeta,
  expensesForEvent,
} from "@/lib/mock-data";
import { formatINR, formatINRShort } from "@/lib/format";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatTile } from "@/components/shared/stat-tile";

export function BudgetView() {
  const navigate = useAppStore((s) => s.navigate);
  const events = useAppStore((s) => s.events);
  const currentEventId = useAppStore((s) => s.currentEventId);
  const expenses = useAppStore((s) => s.expenses);

  const event = events.find((e) => e.id === currentEventId);
  const eventExpenses = useMemo(
    () => (event ? expensesForEvent(expenses, event.id) : []),
    [expenses, event]
  );

  // Group expenses by category
  const categoryData = useMemo(() => {
    const map: Record<BudgetCategory, { planned: number; spent: number }> = {
      venue: { planned: 0, spent: 0 },
      food: { planned: 0, spent: 0 },
      decoration: { planned: 0, spent: 0 },
      photography: { planned: 0, spent: 0 },
      entertainment: { planned: 0, spent: 0 },
      transportation: { planned: 0, spent: 0 },
      contingency: { planned: 0, spent: 0 },
    };
    eventExpenses.forEach((e) => {
      const cat = e.category as BudgetCategory;
      if (map[cat]) {
        map[cat].planned += e.plannedAmount;
        map[cat].spent += e.actualAmount;
      }
    });
    return map;
  }, [eventExpenses]);

  if (!event) {
    return <div className="text-center py-20 text-muted-foreground">No event selected.</div>;
  }

  const totalPlanned = Object.values(categoryData).reduce((s, c) => s + c.planned, 0);
  const totalSpent = Object.values(categoryData).reduce((s, c) => s + c.spent, 0);
  const remaining = event.totalBudget - totalSpent;
  const utilization = event.totalBudget > 0 ? (totalSpent / event.totalBudget) * 100 : 0;
  const overBudget = totalSpent > event.totalBudget;

  // Sort categories by spent desc for chart
  const sortedCategories = (Object.keys(categoryData) as BudgetCategory[])
    .map((cat) => ({ cat, ...categoryData[cat] }))
    .filter((c) => c.planned > 0 || c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Build chart data with proportions
  const maxSpent = Math.max(...sortedCategories.map((c) => c.spent), 1);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Budget"
        title="Budget overview"
        description={`Spending for ${event.name}. Track planned versus actual across categories.`}
      />

      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total budget"
          value={formatINRShort(event.totalBudget)}
          hint="Total allocated"
          icon={Wallet}
          accent="oklch(0.55 0.14 35)"
        />
        <StatTile
          label="Planned"
          value={formatINRShort(totalPlanned)}
          hint={`${Math.round((totalPlanned / event.totalBudget) * 100)}% of total`}
          icon={IndianRupee}
          accent="oklch(0.55 0.08 220)"
        />
        <StatTile
          label="Spent"
          value={formatINRShort(totalSpent)}
          hint={`${Math.round(utilization)}% used`}
          icon={overBudget ? TrendingUp : TrendingDown}
          accent={overBudget ? "oklch(0.55 0.18 25)" : "oklch(0.55 0.12 150)"}
        />
        <StatTile
          label="Remaining"
          value={formatINRShort(remaining)}
          hint={overBudget ? "Over budget" : `${Math.round(((event.totalBudget - totalSpent) / event.totalBudget) * 100)}% left`}
          icon={Wallet}
          accent={overBudget ? "oklch(0.55 0.18 25)" : "oklch(0.65 0.13 70)"}
        />
      </div>

      {overBudget && (
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
          <div>
            <p className="font-semibold text-sm">Spending exceeds total budget</p>
            <p className="text-xs mt-1 opacity-90">
              Total spent ({formatINR(totalSpent)}) is over the planned budget of {formatINR(event.totalBudget)}.
              Review categories below and adjust before committing to new expenses.
            </p>
          </div>
        </div>
      )}

      {!overBudget && utilization >= 90 && (
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
          <div>
            <p className="font-semibold text-sm">Budget is critically high</p>
            <p className="text-xs mt-1 opacity-90">
              You have used {Math.round(utilization)}% of the total budget ({formatINR(totalSpent)} of {formatINR(event.totalBudget)}).
              Only {formatINR(event.totalBudget - totalSpent)} remains. Review planned expenses before committing to new ones.
            </p>
          </div>
        </div>
      )}

      {/* Progress overview */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold font-display text-foreground">
            Budget utilization
          </h2>
          <span className="text-sm font-medium text-foreground">
            {formatINRShort(totalSpent)} of {formatINRShort(event.totalBudget)}
          </span>
        </div>
        <Progress
          value={utilization}
          className="h-3"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{Math.round(utilization)}% used</span>
          <span>{Math.round(100 - utilization)}% remaining</span>
        </div>
      </Card>

      {/* Category breakdown */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold font-display text-foreground mb-4">
            Spending by category
          </h2>
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No expenses recorded yet. Add expenses to see the breakdown.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map((c) => {
                const meta = categoryMeta[c.cat];
                const pct = c.planned > 0 ? (c.spent / c.planned) * 100 : 0;
                return (
                  <div key={c.cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: meta.color }}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-foreground">{meta.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatINR(c.spent)} / {formatINR(c.planned)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: pct > 100 ? "oklch(0.55 0.18 25)" : meta.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(pct)}% of planned spent
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Bar chart visual */}
        <Card className="p-5 sm:p-6">
          <h2 className="text-base font-semibold font-display text-foreground mb-4">
            Planned vs actual
          </h2>
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No data to chart yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map((c) => {
                const meta = categoryMeta[c.cat];
                const plannedHeight = (c.planned / maxSpent) * 100;
                const spentHeight = (c.spent / maxSpent) * 100;
                return (
                  <div key={c.cat} className="flex items-center gap-3">
                    <span className="text-xs text-foreground/70 w-20 shrink-0 truncate">
                      {meta.label}
                    </span>
                    <div className="flex-1 flex items-center gap-1 h-6">
                      <div className="flex-1 h-3 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.max(plannedHeight, 1)}%`,
                            backgroundColor: `${meta.color}50`,
                          }}
                          title={`Planned: ${formatINR(c.planned)}`}
                        />
                      </div>
                      <div className="flex-1 h-3 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.max(spentHeight, 1)}%`,
                            backgroundColor: meta.color,
                          }}
                          title={`Spent: ${formatINR(c.spent)}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm bg-secondary" />
                  <span>Planned</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm bg-primary" />
                  <span>Actual</span>
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed table - desktop */}
      <Card className="p-0 overflow-hidden hidden md:block">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold font-display text-foreground">
            Category breakdown
          </h2>
          <button
            type="button"
            onClick={() => navigate({ kind: "app", view: "expenses" })}
            className="text-xs text-primary hover:underline"
          >
            View expenses
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCategories.map((c) => {
              const meta = categoryMeta[c.cat];
              const remainingCat = c.planned - c.spent;
              const pct = c.planned > 0 ? (c.spent / c.planned) * 100 : 0;
              return (
                <TableRow key={c.cat}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{meta.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(c.planned)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(c.spent)}</TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${remainingCat < 0 ? "text-destructive" : ""}`}
                    style={remainingCat < 0 ? { color: "oklch(0.55 0.18 25)" } : undefined}
                  >
                    {formatINR(remainingCat)}
                  </TableCell>
                  <TableCell className="text-right">
                    {pct >= 100 ? (
                      <Badge variant="outline" className="text-xs" style={{ color: "oklch(0.55 0.18 25)", borderColor: "oklch(0.55 0.18 25 / 0.3)" }}>
                        Over budget
                      </Badge>
                    ) : pct >= 90 ? (
                      <Badge variant="outline" className="text-xs" style={{ color: "oklch(0.55 0.18 25)", borderColor: "oklch(0.55 0.18 25 / 0.3)" }}>
                        Critical
                      </Badge>
                    ) : pct >= 80 ? (
                      <Badge variant="outline" className="text-xs" style={{ color: "oklch(0.55 0.10 70)", borderColor: "oklch(0.55 0.10 70 / 0.3)" }}>
                        Near limit
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs" style={{ color: "oklch(0.55 0.12 150)", borderColor: "oklch(0.55 0.12 150 / 0.3)" }}>
                        On track
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold font-display text-foreground">
            Category breakdown
          </h2>
          <button
            type="button"
            onClick={() => navigate({ kind: "app", view: "expenses" })}
            className="text-xs text-primary hover:underline"
          >
            View expenses
          </button>
        </div>
        {sortedCategories.map((c) => {
          const meta = categoryMeta[c.cat];
          const remainingCat = c.planned - c.spent;
          const pct = c.planned > 0 ? (c.spent / c.planned) * 100 : 0;
          const statusLabel =
            pct >= 100 ? "Over budget" :
            pct >= 90 ? "Critical" :
            pct >= 80 ? "Near limit" :
            "On track";
          const statusColor =
            pct >= 90 ? "oklch(0.55 0.18 25)" :
            pct >= 80 ? "oklch(0.55 0.10 70)" :
            "oklch(0.55 0.12 150)";
          return (
            <Card key={c.cat} className="p-4 gap-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-sm shrink-0"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-foreground">{meta.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs shrink-0"
                  style={{ color: statusColor, borderColor: `${statusColor}40` }}
                >
                  {statusLabel}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Planned</p>
                  <p className="font-medium text-foreground tabular-nums">{formatINR(c.planned)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-medium text-foreground tabular-nums">{formatINR(c.spent)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p
                    className="font-medium tabular-nums"
                    style={remainingCat < 0 ? { color: "oklch(0.55 0.18 25)" } : undefined}
                  >
                    {formatINR(remainingCat)}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: pct >= 80 ? "oklch(0.55 0.18 25)" : meta.color,
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

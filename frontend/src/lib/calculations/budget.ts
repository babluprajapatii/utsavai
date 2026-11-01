/**
 * Pure Budget Calculation Utilities for UtsavAI
 * Source: docs/15-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md Section 4.1
 * 
 * Deterministic, pure arithmetic with zero database or framework dependencies.
 */

export type BudgetStatus = "normal" | "warning" | "critical" | "over_budget";

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilization: number; // Percentage: 0 to 100+
  status: BudgetStatus;
  isOverBudget: boolean;
}

export interface CategoryBudgetDetail {
  category: string;
  planned: number;
  spent: number;
  remaining: number;
  utilization: number;
  isOverBudget: boolean;
}

/**
 * Calculates overall budget health, utilization %, remaining balance, and warning status.
 *
 * Threshold rules:
 * - normal: utilization < 80%
 * - warning: 80% <= utilization < 90%
 * - critical: 90% <= utilization <= 100%
 * - over_budget: utilization > 100% (spent > budget)
 *
 * Zero-budget division guard:
 * - If totalBudget is 0 and spent is 0, utilization is 0% and status is 'normal'.
 * - If totalBudget is 0 and spent > 0, utilization is 100%, remaining is -spent, and status is 'over_budget'.
 */
export function calculateBudgetSummary(
  totalBudget: number,
  expenses: Array<{ actualAmount: number }> | number
): BudgetSummary {
  const budget = Math.max(0, Number(totalBudget) || 0);
  const totalSpent = typeof expenses === "number"
    ? Math.max(0, expenses)
    : expenses.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);

  const remaining = budget - totalSpent;
  const isOverBudget = totalSpent > budget;

  let utilization = 0;
  if (budget > 0) {
    utilization = (totalSpent / budget) * 100;
  } else if (totalSpent > 0) {
    utilization = 100;
  }

  let status: BudgetStatus = "normal";
  if (isOverBudget) {
    status = "over_budget";
  } else if (budget > 0) {
    if (utilization >= 90) {
      status = "critical";
    } else if (utilization >= 80) {
      status = "warning";
    }
  }

  return {
    totalBudget: budget,
    totalSpent,
    remaining,
    utilization: Math.round(utilization * 10) / 10,
    status,
    isOverBudget,
  };
}

/**
 * Calculates breakdown for a single budget category.
 */
export function calculateCategoryBudget(
  plannedAmount: number,
  categoryExpenses: Array<{ actualAmount: number }> | number
): CategoryBudgetDetail {
  const planned = Math.max(0, Number(plannedAmount) || 0);
  const spent = typeof categoryExpenses === "number"
    ? Math.max(0, categoryExpenses)
    : categoryExpenses.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);

  const remaining = planned - spent;
  const isOverBudget = spent > planned;
  const utilization = planned > 0 ? (spent / planned) * 100 : (spent > 0 ? 100 : 0);

  return {
    category: "",
    planned,
    spent,
    remaining,
    utilization: Math.round(utilization * 10) / 10,
    isOverBudget,
  };
}


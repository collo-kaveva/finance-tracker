"use client";
import * as React from "react";
import { Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthPicker } from "@/components/dashboard/month-picker";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { useBudgets } from "@/hooks/use-budgets";
import { useUserCurrency } from "@/hooks/use-user-currency";
import type { BudgetDTO } from "@/lib/api-client";

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const currency = useUserCurrency();

  const { data: budgets, isLoading } = useBudgets(month, year);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BudgetDTO | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(b: BudgetDTO) {
    setEditing(b);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">Set limits and keep spending in check</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <Button onClick={openCreate}><Plus className="size-4" /> New budget</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <PiggyBank className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No budgets for {new Date(year, month - 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
            <p className="text-sm text-muted-foreground">Create one to start tracking against a limit.</p>
          </div>
          <Button onClick={openCreate}><Plus className="size-4" /> Create your first budget</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} currency={currency} onEdit={() => openEdit(b)} />
          ))}
        </div>
      )}

      <BudgetFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} defaultMonth={month} defaultYear={year} />
    </div>
  );
}

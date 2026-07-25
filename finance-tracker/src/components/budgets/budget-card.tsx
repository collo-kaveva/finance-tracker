"use client";
import * as React from "react";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatMoney } from "@/lib/utils";
import type { BudgetDTO } from "@/lib/api-client";
import { useDeleteBudget } from "@/hooks/use-budgets";

function tone(pct: number) {
  if (pct >= 90) return { bar: "bg-danger", badge: "destructive" as const, label: "Over budget risk" };
  if (pct >= 70) return { bar: "bg-warning", badge: "warning" as const, label: "Nearing limit" };
  return { bar: "bg-primary", badge: "default" as const, label: "On track" };
}

export function BudgetCard({
  budget, currency, onEdit,
}: {
  budget: BudgetDTO;
  currency: string;
  onEdit: () => void;
}) {
  const deleteBudget = useDeleteBudget();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const pct = Math.min(100, budget.percentUsed);
  const t = tone(budget.percentUsed);
  const IconComp = (budget.categoryIcon && (Icons as unknown as Record<string, Icons.LucideIcon>)[budget.categoryIcon]) || Icons.PiggyBank;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ background: `${budget.categoryColor ?? "#1f6f5c"}22`, color: budget.categoryColor ?? "#1f6f5c" }}
          >
            <IconComp className="size-4.5" />
          </span>
          <div>
            <p className="font-medium">{budget.name}</p>
            <p className="text-xs text-muted-foreground">{budget.categoryName ?? "All categories"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Budget actions">
              <Icons.MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Icons.Pencil /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-danger focus:text-danger">
              <Icons.Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-mono-num text-lg font-semibold">{formatMoney(budget.spent, currency)}</span>
          <span className="text-xs text-muted-foreground">of {formatMoney(budget.amount, currency)}</span>
        </div>
        <Progress value={pct} indicatorClassName={t.bar} />
        <div className="mt-2 flex items-center justify-between">
          <Badge variant={t.badge}>{t.label}</Badge>
          <span className="text-xs text-muted-foreground">
            {budget.remaining >= 0
              ? `${formatMoney(budget.remaining, currency)} left`
              : `${formatMoney(Math.abs(budget.remaining), currency)} over`}
          </span>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{budget.name}&rdquo; will be removed. Your transactions won&apos;t be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteBudget.mutate(budget.id); setConfirmDelete(false); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

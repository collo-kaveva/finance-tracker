import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import type { BudgetDTO } from "@/lib/api-client";

function progressTone(pct: number) {
  if (pct >= 90) return { bar: "bg-danger", text: "text-danger" };
  if (pct >= 70) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-primary", text: "text-primary" };
}

export function BudgetProgressList({ budgets, currency }: { budgets: BudgetDTO[]; currency: string }) {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <PiggyBank className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No budgets set for this month</p>
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href="/dashboard/budgets">Create a budget</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {budgets.map((b) => {
        const pct = Math.min(100, b.percentUsed);
        const tone = progressTone(b.percentUsed);
        return (
          <li key={b.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{b.name}</span>
              <span className="font-mono-num text-xs text-muted-foreground">
                {formatMoney(b.spent, currency)} / {formatMoney(b.amount, currency)}
              </span>
            </div>
            <Progress value={pct} indicatorClassName={tone.bar} />
            <p className={`mt-1 text-xs ${tone.text}`}>
              {b.percentUsed >= 100
                ? `Over budget by ${formatMoney(Math.abs(b.remaining), currency)}`
                : `${Math.round(b.percentUsed)}% used · ${formatMoney(b.remaining, currency)} left`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

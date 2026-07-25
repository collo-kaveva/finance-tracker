"use client";
import { formatMoney } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export function BudgetUtilizationList({
  data, currency,
}: {
  data: { name: string; budget: number; spent: number; percentUsed: number }[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Target className="size-7" />
        <p className="text-sm">No budgets set for this month</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {data.map((b) => {
        const tone = b.percentUsed >= 90 ? "bg-danger" : b.percentUsed >= 70 ? "bg-warning" : "bg-primary";
        return (
          <div key={b.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{b.name}</span>
              <span className="font-mono-num text-xs text-muted-foreground">
                {formatMoney(b.spent, currency)} / {formatMoney(b.budget, currency)}
              </span>
            </div>
            <Progress value={Math.min(100, b.percentUsed)} indicatorClassName={tone} />
          </div>
        );
      })}
    </div>
  );
}

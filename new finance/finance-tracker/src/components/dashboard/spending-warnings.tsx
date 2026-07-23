"use client";
import { AlertTriangle, TrendingDown, Receipt, Info, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";
import type { NotificationDTO } from "@/lib/api-client";

const WARNING_TYPES: NotificationDTO["type"][] = ["budget_exceeded", "budget_nearing", "large_expense"];

const ICONS: Record<NotificationDTO["type"], React.ElementType> = {
  budget_exceeded: AlertTriangle,
  budget_nearing: TrendingDown,
  large_expense: Receipt,
  monthly_summary: Info,
  upcoming_bill: Info,
};

export function SpendingWarningsPanel({ limit = 5 }: { limit?: number }) {
  const { data: notifications, isLoading } = useNotifications();
  const warnings = (notifications ?? [])
    .filter((n) => WARNING_TYPES.includes(n.type))
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-foreground">Spending warnings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : warnings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ShieldCheck className="size-7 text-primary" />
            <p className="text-sm text-muted-foreground">No spending warnings right now</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {warnings.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md border px-3 py-2.5",
                    n.type === "budget_exceeded" ? "border-danger/30 bg-danger-soft" : "border-warning/30 bg-warning-soft"
                  )}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", n.type === "budget_exceeded" ? "text-danger" : "text-warning")} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message.replace(/\s*\[.*?\]$/, "")}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

"use client";
import { Sparkles, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsights } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

export function SpendingInsightsPanel() {
  const { data, isLoading } = useInsights();
  const insights = data?.insights ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Sparkles className="size-4 text-accent" />
        <CardTitle className="text-base font-medium text-foreground">Spending insights</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
        ) : insights.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Add a few transactions and set some budgets to start seeing insights here.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {insights.map((insight, i) => {
              const Icon = insight.tone === "warning" ? TrendingUp : insight.tone === "positive" ? TrendingDown : Info;
              return (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      insight.tone === "warning" ? "text-warning" : insight.tone === "positive" ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{insight.text}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

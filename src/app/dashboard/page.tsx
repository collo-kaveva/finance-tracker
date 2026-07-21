"use client";
import * as React from "react";
import Link from "next/link";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Flame, CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthPicker } from "@/components/dashboard/month-picker";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions";
import { BudgetProgressList } from "@/components/dashboard/budget-progress-list";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { useDashboard, useReports } from "@/hooks/use-app-data";
import { useBudgets } from "@/hooks/use-budgets";
import { useUserCurrency } from "@/hooks/use-user-currency";
import { formatMoney } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const currency = useUserCurrency();

  const { data: summary, isLoading } = useDashboard(month, year);
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(month, year);
  const { data: reports } = useReports({ year, month: null });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">Your financial summary at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <Button asChild size="sm">
            <Link href="/dashboard/transactions">Add transaction</Link>
          </Button>
        </div>
      </div>

      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total balance" value={formatMoney(summary.totalBalance, currency)} icon={Wallet} tone="primary" />
          <StatCard label="Monthly income" value={formatMoney(summary.income, currency)} icon={TrendingUp} tone="primary" />
          <StatCard label="Monthly expenses" value={formatMoney(summary.expenses, currency)} icon={TrendingDown} tone="danger" />
          <StatCard
            label="Savings"
            value={formatMoney(summary.savings, currency)}
            icon={PiggyBank}
            tone={summary.savings >= 0 ? "primary" : "danger"}
            hint={summary.income > 0 ? `${Math.round((summary.savings / summary.income) * 100)}% of income` : undefined}
          />
        </div>
      )}

      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Remaining budget"
            value={formatMoney(summary.remainingBudget, currency)}
            icon={Target}
            tone={summary.remainingBudget >= 0 ? "primary" : "danger"}
            hint={summary.budgetCount > 0 ? `${summary.budgetCount} active budget${summary.budgetCount > 1 ? "s" : ""}` : "No budgets set"}
          />
          <StatCard
            label="Highest expense category"
            value={summary.highestCategory ? formatMoney(summary.highestCategory.total, currency) : "—"}
            icon={Flame}
            tone="accent"
            hint={summary.highestCategory?.name}
          />
          <StatCard
            label="Upcoming bills"
            value={String(summary.upcomingBills.length)}
            icon={CalendarClock}
            hint="Due in the next 30 days"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-medium text-foreground">Income vs. expenses</CardTitle>
            <Badge variant="secondary">Last 6 months</Badge>
          </CardHeader>
          <CardContent>
            {reports ? (
              <IncomeExpenseChart data={reports.monthlyTrend} currency={currency} />
            ) : (
              <Skeleton className="h-72" />
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground">Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !summary ? (
              <Skeleton className="h-56" />
            ) : (
              <CategoryPieChart data={summary.spendingByCategory} currency={currency} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-medium text-foreground">Recent transactions</CardTitle>
            <Link href="/dashboard/transactions" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading || !summary ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : (
              <RecentTransactionsList transactions={summary.recentTransactions} currency={currency} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-medium text-foreground">Budget progress</CardTitle>
            <Link href="/dashboard/budgets" className="text-xs font-medium text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            {budgetsLoading || !budgets ? (
              <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : (
              <BudgetProgressList budgets={budgets} currency={currency} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

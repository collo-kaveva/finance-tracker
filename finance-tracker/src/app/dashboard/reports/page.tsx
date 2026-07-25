"use client";
import * as React from "react";
import { Download, FileText, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthPicker } from "@/components/dashboard/month-picker";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { SpendingCalendar } from "@/components/charts/spending-calendar";
import { BudgetUtilizationList } from "@/components/charts/budget-utilization-list";
import { useReports } from "@/hooks/use-app-data";
import { useUserCurrency } from "@/hooks/use-user-currency";
import { formatMoney } from "@/lib/utils";

type RangeMode = "month" | "year" | "custom";

export default function ReportsPage() {
  const now = new Date();
  const currency = useUserCurrency();
  const [mode, setMode] = React.useState<RangeMode>("month");
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const params = React.useMemo(() => {
    if (mode === "month") return { year, month };
    if (mode === "year") return { year, month: null };
    return { year, month: null, dateFrom, dateTo };
  }, [mode, year, month, dateFrom, dateTo]);

  const { data: report, isLoading } = useReports(params);

  function exportCsv() {
    const search = new URLSearchParams();
    if (report) {
      search.set("dateFrom", report.range.from);
      search.set("dateTo", report.range.to);
    }
    window.open(`/api/reports/export?${search.toString()}`, "_blank");
  }

  function exportPdf() {
    window.print();
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Understand your money over time</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="size-3.5" /> Export CSV</Button>
          <Button variant="outline" size="sm" onClick={exportPdf}><FileText className="size-3.5" /> Export PDF</Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="flex flex-wrap items-center gap-3 pt-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as RangeMode)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="custom">Custom range</TabsTrigger>
            </TabsList>
          </Tabs>

          {mode === "month" && (
            <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          )}
          {mode === "year" && (
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = now.getFullYear() - i;
                  return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          )}
          {mode === "custom" && (
            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading || !report ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Total income</p>
            <p className="font-mono-num mt-1 flex items-center gap-2 text-xl font-semibold text-primary">
              <TrendingUp className="size-4" /> {formatMoney(report.totalIncome, currency)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Total expenses</p>
            <p className="font-mono-num mt-1 flex items-center gap-2 text-xl font-semibold text-danger">
              <TrendingDown className="size-4" /> {formatMoney(report.totalExpense, currency)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Net</p>
            <p className={`font-mono-num mt-1 flex items-center gap-2 text-xl font-semibold ${report.net >= 0 ? "text-primary" : "text-danger"}`}>
              <Receipt className="size-4" /> {formatMoney(report.net, currency)}
            </p>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Monthly spending trend</CardTitle></CardHeader>
          <CardContent>{report ? <IncomeExpenseChart data={report.monthlyTrend} currency={currency} /> : <Skeleton className="h-64" />}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Spending by category</CardTitle></CardHeader>
          <CardContent>{report ? <CategoryPieChart data={report.spendingByCategory} currency={currency} /> : <Skeleton className="h-56" />}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Spending over the range</CardTitle></CardHeader>
          <CardContent>{report ? <SpendingTrendChart data={report.dailySpending} currency={currency} /> : <Skeleton className="h-64" />}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Budget utilization</CardTitle></CardHeader>
          <CardContent>{report ? <BudgetUtilizationList data={report.budgetUtilization} currency={currency} /> : <Skeleton className="h-40" />}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Top spending categories</CardTitle></CardHeader>
          <CardContent>
            {report && report.topCategories.length > 0 ? (
              <ol className="space-y-3">
                {report.topCategories.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-medium">{i + 1}</span>
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1 truncate text-sm">{c.name}</span>
                    <span className="font-mono-num text-sm text-muted-foreground">{formatMoney(c.total, currency)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No expenses recorded</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Daily spending calendar</CardTitle></CardHeader>
          <CardContent>
            {report ? (
              <SpendingCalendar
                year={mode === "month" ? year : now.getFullYear()}
                month={mode === "month" ? month : now.getMonth() + 1}
                dailySpending={report.dailySpending}
                currency={currency}
              />
            ) : <Skeleton className="h-48" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-medium text-foreground">{report?.yearlySummary.year} yearly summary</CardTitle></CardHeader>
        <CardContent>
          {report ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Total income</p>
                <p className="font-mono-num text-lg font-semibold text-primary">{formatMoney(report.yearlySummary.totalIncome, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total expenses</p>
                <p className="font-mono-num text-lg font-semibold text-danger">{formatMoney(report.yearlySummary.totalExpense, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions logged</p>
                <p className="font-mono-num text-lg font-semibold">{report.yearlySummary.transactionCount}</p>
              </div>
            </div>
          ) : <Skeleton className="h-16" />}
        </CardContent>
      </Card>
    </div>
  );
}

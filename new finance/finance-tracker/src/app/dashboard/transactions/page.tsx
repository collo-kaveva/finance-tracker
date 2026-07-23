"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, List, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionFiltersBar } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { TransactionsGroupedByAccount } from "@/components/transactions/transactions-grouped-view";
import { PaymentMethodAnalyticsSection } from "@/components/transactions/payment-method-analytics-section";
import { useTransactions, type TransactionFilters } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useUserCurrency } from "@/hooks/use-user-currency";
import type { TransactionDTO } from "@/lib/api-client";

type ViewMode = "list" | "grouped";

export default function TransactionsPage() {
  return (
    <React.Suspense fallback={null}>
      <TransactionsPageInner />
    </React.Suspense>
  );
}

function TransactionsPageInner() {
  const searchParams = useSearchParams();
  const currency = useUserCurrency();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const [view, setView] = React.useState<ViewMode>("grouped");
  const [filters, setFilters] = React.useState<TransactionFilters>({
    q: searchParams.get("q") ?? "",
    sortBy: "date",
    sortDir: "desc",
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useTransactions(filters);
  // Grouped view needs the full filtered set, not one page at a time.
  const { data: groupedData, isLoading: groupedLoading } = useTransactions({ ...filters, page: 1, pageSize: 500 });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TransactionDTO | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(t: TransactionDTO) {
    setEditing(t);
    setFormOpen(true);
  }

  const analyticsFilters = {
    accountId: filters.accountId,
    categoryId: filters.categoryId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    amountMin: filters.amountMin,
    amountMax: filters.amountMax,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every income and expense, grouped by where it happened</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grouped"><LayoutGrid className="size-3.5" /> Grouped</TabsTrigger>
              <TabsTrigger value="list"><List className="size-3.5" /> List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <TransactionFiltersBar filters={filters} onChange={setFilters} categories={categories ?? []} accounts={accounts ?? []} />
          <div className="mt-5">
            {view === "list" ? (
              <TransactionTable
                transactions={data?.data ?? []}
                isLoading={isLoading}
                currency={currency}
                onEdit={openEdit}
                page={filters.page ?? 1}
                pageSize={filters.pageSize ?? 10}
                total={data?.total ?? 0}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            ) : (
              <TransactionsGroupedByAccount
                transactions={groupedData?.data ?? []}
                isLoading={groupedLoading}
                currency={currency}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">Payment method analytics</h2>
        <PaymentMethodAnalyticsSection filters={analyticsFilters} currency={currency} />
      </div>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </div>
  );
}

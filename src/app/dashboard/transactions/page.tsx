"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionFiltersBar } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { useTransactions, type TransactionFilters } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useUserCurrency } from "@/hooks/use-user-currency";
import type { TransactionDTO } from "@/lib/api-client";

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

  const [filters, setFilters] = React.useState<TransactionFilters>({
    q: searchParams.get("q") ?? "",
    sortBy: "date",
    sortDir: "desc",
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useTransactions(filters);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Every income and expense, in one place</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add transaction
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <TransactionFiltersBar filters={filters} onChange={setFilters} categories={categories ?? []} />
          <div className="mt-5">
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
          </div>
        </CardContent>
      </Card>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </div>
  );
}

"use client";
import * as React from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatMoney } from "@/lib/utils";
import type { TransactionDTO } from "@/lib/api-client";
import { useDeleteTransaction } from "@/hooks/use-transactions";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash", card: "Card", bank_transfer: "Bank transfer", upi: "UPI", other: "Other",
};

function CategoryIcon({ name, color }: { name?: string | null; color?: string | null }) {
  const IconComp = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Tag;
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${color ?? "#7a7a6e"}22`, color: color ?? "#7a7a6e" }}
    >
      <IconComp className="size-4" />
    </span>
  );
}

export function TransactionTable({
  transactions,
  isLoading,
  currency,
  onEdit,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  transactions: TransactionDTO[];
  isLoading: boolean;
  currency: string;
  onEdit: (t: TransactionDTO) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const deleteTxn = useDeleteTransaction();
  const [deleteTarget, setDeleteTarget] = React.useState<TransactionDTO | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Icons.SearchX className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters, or add a new transaction.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pl-2 font-medium">Transaction</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Payment</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 text-right font-medium">Amount</th>
              <th className="pb-2 pr-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr key={t.id} className="group">
                <td className="py-2.5 pl-2">
                  <div className="flex items-center gap-3">
                    <CategoryIcon name={t.categoryIcon} color={t.categoryColor} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      {t.notes && <p className="truncate text-xs text-muted-foreground">{t.notes}</p>}
                    </div>
                    {t.isRecurring && (
                      <Icons.Repeat className="size-3.5 shrink-0 text-muted-foreground" aria-label="Recurring" />
                    )}
                  </div>
                </td>
                <td className="py-2.5">
                  <Badge variant="secondary">{t.categoryName ?? "Uncategorized"}</Badge>
                </td>
                <td className="py-2.5 text-muted-foreground">{PAYMENT_LABELS[t.paymentMethod]}</td>
                <td className="py-2.5 text-muted-foreground">
                  {new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className={`font-mono-num py-2.5 text-right font-medium ${t.type === "income" ? "text-primary" : "text-danger"}`}>
                  {t.type === "income" ? "+" : "-"}{formatMoney(t.amount, currency)}
                </td>
                <td className="py-2.5 pr-2">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(t)} aria-label="Edit">
                      <Icons.Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 hover:text-danger" onClick={() => setDeleteTarget(t)} aria-label="Delete">
                      <Icons.Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="px-2 text-xs">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{deleteTarget?.title}&rdquo;. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteTxn.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

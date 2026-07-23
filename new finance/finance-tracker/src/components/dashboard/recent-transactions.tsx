import Link from "next/link";
import * as Icons from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { TransactionDTO } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

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

export function RecentTransactionsList({
  transactions,
  currency,
}: {
  transactions: TransactionDTO[];
  currency: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Icons.Receipt className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No transactions yet</p>
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href="/dashboard/transactions">Add your first transaction</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center gap-3 py-3">
          <CategoryIcon name={t.categoryIcon} color={t.categoryColor} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t.categoryName ?? "Uncategorized"} · {new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </div>
          <span className={`font-mono-num shrink-0 text-sm font-medium ${t.type === "income" ? "text-primary" : "text-danger"}`}>
            {t.type === "income" ? "+" : "-"}{formatMoney(t.amount, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}

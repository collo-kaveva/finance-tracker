"use client";
import * as React from "react";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils";
import { ACCOUNT_TYPE_META, type AccountType } from "@/lib/account-meta";
import type { TransactionDTO } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function CategoryIcon({ name, color }: { name?: string | null; color?: string | null }) {
  const IconComp = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Tag;
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${color ?? "#7a7a6e"}22`, color: color ?? "#7a7a6e" }}
    >
      <IconComp className="size-3.5" />
    </span>
  );
}

function GroupSection({
  groupKey, label, emoji, color, transactions, currency, defaultOpen,
}: {
  groupKey: string;
  label: string;
  emoji: string;
  color: string;
  transactions: TransactionDTO[];
  currency: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const avg = transactions.length > 0 ? (income + expenses) / transactions.length : 0;
  const largest = transactions.reduce((max, t) => (t.amount > max ? t.amount : max), 0);

  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-muted"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg text-lg" style={{ background: `${color}22` }}>
            {emoji}
          </span>
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{transactions.length} transaction{transactions.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden gap-4 text-right sm:flex">
            <div>
              <p className="text-[11px] text-muted-foreground">Income</p>
              <p className="font-mono-num text-sm font-medium text-primary">{formatMoney(income, currency)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Expenses</p>
              <p className="font-mono-num text-sm font-medium text-danger">{formatMoney(expenses, currency)}</p>
            </div>
          </div>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border">
          <div className="grid grid-cols-2 gap-3 border-b border-border bg-surface-muted/50 px-5 py-3 sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Total income</p>
              <p className="font-mono-num text-sm font-semibold text-primary">{formatMoney(income, currency)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total expenses</p>
              <p className="font-mono-num text-sm font-semibold text-danger">{formatMoney(expenses, currency)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Average transaction</p>
              <p className="font-mono-num text-sm font-semibold">{formatMoney(avg, currency)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Largest transaction</p>
              <p className="font-mono-num text-sm font-semibold">{formatMoney(largest, currency)}</p>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-2.5">
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
        </div>
      )}
    </Card>
  );
}

export function TransactionsGroupedByAccount({
  transactions, isLoading, currency,
}: {
  transactions: TransactionDTO[];
  isLoading: boolean;
  currency: string;
}) {
  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Icons.Wallet className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">No transactions to group</p>
        <p className="text-sm text-muted-foreground">Adjust your filters or add a transaction.</p>
      </div>
    );
  }

  const groups = new Map<string, TransactionDTO[]>();
  for (const t of transactions) {
    const key = t.accountType ?? "unassigned";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const order: (AccountType | "unassigned")[] = ["bank", "paypal", "mpesa", "unassigned"];
  const sortedKeys = order.filter((k) => groups.has(k));

  return (
    <div className="space-y-3">
      {sortedKeys.map((key, i) => {
        const meta = key === "unassigned" ? { label: "No connected account", emoji: "❔", color: "#7a7a6e" } : ACCOUNT_TYPE_META[key];
        return (
          <GroupSection
            key={key}
            groupKey={key}
            label={meta.label}
            emoji={meta.emoji}
            color={meta.color}
            transactions={groups.get(key)!}
            currency={currency}
            defaultOpen={i === 0}
          />
        );
      })}
    </div>
  );
}

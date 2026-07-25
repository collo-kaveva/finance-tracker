import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { ACCOUNT_TYPE_META, type AccountType } from "@/lib/account-meta";

export function TopPaymentMethodCard({
  method, currency,
}: {
  method: { accountType: string; label: string; total: number; count: number; percent: number } | null;
  currency: string;
}) {
  if (!method) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Trophy className="size-7 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No expenses yet to determine a top payment method</p>
      </Card>
    );
  }

  const meta = ACCOUNT_TYPE_META[method.accountType as AccountType];

  return (
    <Card className="p-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Most used payment method</p>
      <div className="my-3 flex items-center justify-center gap-2">
        <span className="flex size-12 items-center justify-center rounded-full text-2xl" style={{ background: `${meta?.color ?? "#7a7a6e"}22` }}>
          {meta?.emoji ?? "💳"}
        </span>
      </div>
      <p className="font-display text-xl font-semibold">{method.label}</p>
      <p className="font-mono-num mt-1 text-sm text-muted-foreground">{method.count} transactions</p>
      <p className="font-mono-num mt-2 text-2xl font-semibold text-primary">{formatMoney(method.total, currency)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{Math.round(method.percent)}% of all expenses</p>
    </Card>
  );
}

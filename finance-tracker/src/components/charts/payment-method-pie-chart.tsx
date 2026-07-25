"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatMoney } from "@/lib/utils";
import { ACCOUNT_TYPE_META, type AccountType } from "@/lib/account-meta";
import { Wallet } from "lucide-react";

interface Slice {
  accountType: string;
  label: string;
  total: number;
  percent: number;
}

export function PaymentMethodPieChart({ data, currency }: { data: Slice[]; currency: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Wallet className="size-7" />
        <p className="text-sm">No expenses to analyze yet</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={3} strokeWidth={0}>
            {data.map((d) => (
              <Cell key={d.accountType} fill={ACCOUNT_TYPE_META[d.accountType as AccountType]?.color ?? "#7a7a6e"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, props) => [
              `${formatMoney(Number(value), currency)} (${props.payload.percent.toFixed(0)}%)`,
              props.payload.label,
            ]}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          <Legend formatter={(_v, entry) => (entry.payload as unknown as Slice)?.label} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

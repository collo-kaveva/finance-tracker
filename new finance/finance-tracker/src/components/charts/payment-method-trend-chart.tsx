"use client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { formatCompactMoney, formatMoney } from "@/lib/utils";
import { ACCOUNT_TYPE_META } from "@/lib/account-meta";

interface Point {
  label: string;
  bank: number;
  paypal: number;
  mpesa: number;
}

export function PaymentMethodTrendChart({ data, currency }: { data: Point[]; currency: string }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -12, right: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCompactMoney(v, currency)}
          />
          <Tooltip
            formatter={(value, name) => [formatMoney(Number(value), currency), ACCOUNT_TYPE_META[name as "bank" | "paypal" | "mpesa"]?.label ?? String(name)]}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          <Legend formatter={(v) => ACCOUNT_TYPE_META[v as "bank" | "paypal" | "mpesa"]?.label ?? v} wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="bank" stroke={ACCOUNT_TYPE_META.bank.color} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="mpesa" stroke={ACCOUNT_TYPE_META.mpesa.color} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="paypal" stroke={ACCOUNT_TYPE_META.paypal.color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

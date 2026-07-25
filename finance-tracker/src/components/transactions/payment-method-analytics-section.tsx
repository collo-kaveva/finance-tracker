"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentMethodPieChart } from "@/components/charts/payment-method-pie-chart";
import { PaymentMethodSpendingBar, PaymentMethodCountBar } from "@/components/charts/payment-method-bar-charts";
import { PaymentMethodTrendChart } from "@/components/charts/payment-method-trend-chart";
import { TopPaymentMethodCard } from "@/components/charts/top-payment-method-card";
import { usePaymentAnalytics, type PaymentAnalyticsFilters } from "@/hooks/use-app-data";

export function PaymentMethodAnalyticsSection({
  filters, currency,
}: {
  filters: PaymentAnalyticsFilters;
  currency: string;
}) {
  const { data, isLoading } = usePaymentAnalytics(filters);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Payment method distribution</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-64" /> : <PaymentMethodPieChart data={data.distribution} currency={currency} />}
          </CardContent>
        </Card>
        {isLoading || !data ? <Skeleton className="h-64" /> : <TopPaymentMethodCard method={data.topMethod} currency={currency} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Spending by payment method</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-64" /> : <PaymentMethodSpendingBar data={data.distribution} currency={currency} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium text-foreground">Transaction count by method</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-56" /> : <PaymentMethodCountBar data={data.distribution} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-medium text-foreground">Monthly spending trend by payment method</CardTitle></CardHeader>
        <CardContent>
          {isLoading || !data ? <Skeleton className="h-72" /> : <PaymentMethodTrendChart data={data.monthlyTrend} currency={currency} />}
        </CardContent>
      </Card>
    </div>
  );
}

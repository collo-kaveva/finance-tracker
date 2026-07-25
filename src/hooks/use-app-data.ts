"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type GoalDTO, type BillDTO, type NotificationDTO, type DashboardSummaryDTO, type ReportsResponseDTO } from "@/lib/api-client";
import { toast } from "sonner";

// Accounts now live in @/hooks/use-accounts (richer connected-accounts model)

// ---- Goals ----
export function useGoals() {
  return useQuery({ queryKey: ["goals"], queryFn: () => apiFetch<GoalDTO[]>("/api/goals") });
}
export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<GoalDTO, "id">) =>
      apiFetch<GoalDTO>("/api/goals", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Goal created");
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create goal"),
  });
}
export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Omit<GoalDTO, "id">> }) =>
      apiFetch<GoalDTO>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Goal updated");
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Goal removed");
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

// ---- Bills ----
export function useBills() {
  return useQuery({ queryKey: ["bills"], queryFn: () => apiFetch<BillDTO[]>("/api/bills") });
}
export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<BillDTO, "id">) =>
      apiFetch<BillDTO>("/api/bills", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Bill added");
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to add bill"),
  });
}
export function useUpdateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Omit<BillDTO, "id">> }) =>
      apiFetch<BillDTO>(`/api/bills/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
export function useDeleteBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/bills/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Bill removed");
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

// ---- Notifications ----
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<NotificationDTO[]>("/api/notifications"),
    refetchInterval: 60_000,
  });
}
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<NotificationDTO>(`/api/notifications/${id}`, { method: "PATCH", body: JSON.stringify({ isRead: true }) }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const previous = qc.getQueryData<NotificationDTO[]>(["notifications"]);
      qc.setQueryData<NotificationDTO[]>(["notifications"], (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(["notifications"], ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ ok: true }>("/api/notifications", { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ---- Dashboard & Reports ----
export function useDashboard(month: number, year: number) {
  return useQuery({
    queryKey: ["dashboard", { month, year }],
    queryFn: () => apiFetch<DashboardSummaryDTO>(`/api/dashboard?month=${month}&year=${year}`),
  });
}

export interface ReportsParams {
  year: number;
  month?: number | null;
  dateFrom?: string;
  dateTo?: string;
}

export function useReports(params: ReportsParams) {
  const search = new URLSearchParams();
  search.set("year", String(params.year));
  if (params.month) search.set("month", String(params.month));
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);

  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => apiFetch<ReportsResponseDTO>(`/api/reports?${search.toString()}`),
  });
}

// ---- Insights & payment-method analytics ----
export interface InsightDTO {
  text: string;
  tone: "info" | "warning" | "positive";
}

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: () => apiFetch<{ insights: InsightDTO[] }>("/api/insights"),
  });
}

export interface PaymentAnalyticsFilters {
  accountId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
}

export interface PaymentAnalyticsDTO {
  distribution: { accountType: string; label: string; total: number; count: number; percent: number }[];
  monthlyTrend: { label: string; bank: number; paypal: number; mpesa: number }[];
  totalExpense: number;
  topMethod: { accountType: string; label: string; total: number; count: number; percent: number } | null;
}

export function usePaymentAnalytics(filters: PaymentAnalyticsFilters) {
  const search = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && search.set(k, v));
  return useQuery({
    queryKey: ["payment-analytics", filters],
    queryFn: () => apiFetch<PaymentAnalyticsDTO>(`/api/payment-analytics?${search.toString()}`),
  });
}

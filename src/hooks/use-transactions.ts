"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type TransactionDTO } from "@/lib/api-client";
import type { TransactionInput } from "@/lib/validation";
import { toast } from "sonner";

export interface TransactionFilters {
  q?: string;
  type?: "income" | "expense" | "";
  categoryId?: string;
  accountId?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  sortBy?: "date" | "amount" | "title";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface TransactionListResponse {
  data: TransactionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

function buildQuery(filters: TransactionFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

function keyFor(filters: TransactionFilters) {
  return ["transactions", filters] as const;
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: keyFor(filters),
    queryFn: () => apiFetch<TransactionListResponse>(`/api/transactions?${buildQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) =>
      apiFetch<TransactionDTO>("/api/transactions", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Transaction added");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to add transaction"),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) =>
      apiFetch<TransactionDTO>(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Transaction updated");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update transaction"),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/transactions/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["transactions"] });
      const snapshots = qc.getQueriesData<TransactionListResponse>({ queryKey: ["transactions"] });
      snapshots.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData<TransactionListResponse>(key, {
          ...value,
          data: value.data.filter((t) => t.id !== id),
          total: value.total - 1,
        });
      });
      return { snapshots };
    },
    onError: (err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error(err instanceof Error ? err.message : "Failed to delete transaction");
    },
    onSuccess: () => {
      toast.success("Transaction deleted");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

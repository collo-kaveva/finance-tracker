"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type BudgetDTO } from "@/lib/api-client";
import type { BudgetInput } from "@/lib/validation";
import { toast } from "sonner";

function keyFor(month: number, year: number) {
  return ["budgets", { month, year }] as const;
}

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: keyFor(month, year),
    queryFn: () => apiFetch<BudgetDTO[]>(`/api/budgets?month=${month}&year=${year}`),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetInput) =>
      apiFetch<BudgetDTO>("/api/budgets", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Budget created");
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create budget"),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BudgetInput> }) =>
      apiFetch<BudgetDTO>(`/api/budgets/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Budget updated");
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update budget"),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/budgets/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["budgets"] });
      const snapshots = qc.getQueriesData<BudgetDTO[]>({ queryKey: ["budgets"] });
      snapshots.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData<BudgetDTO[]>(key, value.filter((b) => b.id !== id));
      });
      return { snapshots };
    },
    onError: (err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key, value));
      toast.error(err instanceof Error ? err.message : "Failed to delete budget");
    },
    onSuccess: () => toast.success("Budget deleted"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

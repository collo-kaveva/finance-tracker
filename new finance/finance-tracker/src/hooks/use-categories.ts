"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type CategoryDTO } from "@/lib/api-client";
import type { CategoryInput } from "@/lib/validation";
import { toast } from "sonner";

const KEY = ["categories"];

export function useCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiFetch<CategoryDTO[]>("/api/categories"),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      apiFetch<CategoryDTO>("/api/categories", { method: "POST", body: JSON.stringify(input) }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<CategoryDTO[]>(KEY);
      const optimistic: CategoryDTO = { id: `optimistic-${Date.now()}`, ...input };
      qc.setQueryData<CategoryDTO[]>(KEY, (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (err, _input, ctx) => {
      qc.setQueryData(KEY, ctx?.previous);
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    },
    onSuccess: () => toast.success("Category created"),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      apiFetch<CategoryDTO>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Category updated");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update category"),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/categories/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<CategoryDTO[]>(KEY);
      qc.setQueryData<CategoryDTO[]>(KEY, (old) => old?.filter((c) => c.id !== id));
      return { previous };
    },
    onError: (err, _id, ctx) => {
      qc.setQueryData(KEY, ctx?.previous);
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    },
    onSuccess: () => toast.success("Category deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

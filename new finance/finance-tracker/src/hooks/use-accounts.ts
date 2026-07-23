"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, type AccountDTO } from "@/lib/api-client";
import type { AccountInput } from "@/lib/validation";

const KEY = ["accounts"];

export function useAccounts() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiFetch<AccountDTO[]>("/api/accounts"),
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["transactions"] });
  qc.invalidateQueries({ queryKey: ["payment-analytics"] });
}

export function useConnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountInput) =>
      apiFetch<AccountDTO>("/api/accounts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (row) => {
      toast.success(`${row.accountName} connected`);
      invalidateAll(qc);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to connect account"),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AccountInput> }) =>
      apiFetch<AccountDTO>(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success("Account updated");
      invalidateAll(qc);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update account"),
  });
}

export function useSetDefaultAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<AccountDTO>(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify({ action: "setDefault" }) }),
    onSuccess: () => {
      toast.success("Default account updated");
      invalidateAll(qc);
    },
  });
}

export function useToggleAccountTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isTrackingEnabled }: { id: string; isTrackingEnabled: boolean }) =>
      apiFetch<AccountDTO>(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify({ isTrackingEnabled }) }),
    onMutate: async ({ id, isTrackingEnabled }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<AccountDTO[]>(KEY);
      qc.setQueryData<AccountDTO[]>(KEY, (old) =>
        old?.map((a) => (a.id === id ? { ...a, isTrackingEnabled } : a))
      );
      return { previous };
    },
    onError: (_err, _v, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSettled: () => invalidateAll(qc),
  });
}

export function useSyncAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<AccountDTO>(`/api/accounts/${id}`, { method: "PATCH", body: JSON.stringify({ action: "sync" }) }),
    onSuccess: (row) => {
      toast.success(`${row.accountName} synced`);
      invalidateAll(qc);
    },
  });
}

export function useToggleAccountConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, connect }: { id: string; connect: boolean }) =>
      apiFetch<AccountDTO>(`/api/accounts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: connect ? "reconnect" : "disconnect" }),
      }),
    onSuccess: (row) => {
      toast.success(`${row.accountName} ${row.status === "connected" ? "reconnected" : "disconnected"}`);
      invalidateAll(qc);
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/accounts/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<AccountDTO[]>(KEY);
      qc.setQueryData<AccountDTO[]>(KEY, (old) => old?.filter((a) => a.id !== id));
      return { previous };
    },
    onError: (err, _id, ctx) => {
      qc.setQueryData(KEY, ctx?.previous);
      toast.error(err instanceof Error ? err.message : "Failed to remove account");
    },
    onSuccess: () => toast.success("Account removed"),
    onSettled: () => invalidateAll(qc),
  });
}

"use client";
import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transactionSchema, type TransactionInput } from "@/lib/validation";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { ACCOUNT_TYPE_META, type AccountType } from "@/lib/account-meta";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import type { TransactionDTO } from "@/lib/api-client";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
] as const;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: TransactionDTO | null;
}) {
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createTxn = useCreateTransaction();
  const updateTxn = useUpdateTransaction();
  const [uploading, setUploading] = React.useState(false);

  const {
    register, handleSubmit, control, watch, setValue, reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionInput>,
    defaultValues: {
      title: "", amount: 0, type: "expense", categoryId: "", paymentMethod: "card",
      notes: "", date: todayStr(), receiptUrl: "", isRecurring: false, recurrenceInterval: null,
      accountId: null,
    },
  });

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const receiptUrl = watch("receiptUrl");
  const filteredCategories = categories?.filter((c) => c.type === type) ?? [];

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        title: editing.title,
        amount: editing.amount,
        type: editing.type,
        categoryId: editing.categoryId,
        paymentMethod: editing.paymentMethod,
        notes: editing.notes ?? "",
        date: editing.date,
        receiptUrl: editing.receiptUrl ?? "",
        isRecurring: editing.isRecurring,
        recurrenceInterval: editing.recurrenceInterval,
        accountId: editing.accountId,
      });
    } else {
      const defaultAccount = accounts?.find((a) => a.isDefault) ?? accounts?.[0];
      reset({
        title: "", amount: 0, type: "expense", categoryId: "", paymentMethod: "card",
        notes: "", date: todayStr(), receiptUrl: "", isRecurring: false, recurrenceInterval: null,
        accountId: defaultAccount?.id ?? null,
      });
    }
  }, [open, editing, reset, accounts]);

  async function onSubmit(values: TransactionInput) {
    if (editing) {
      await updateTxn.mutateAsync({ id: editing.id, input: values });
    } else {
      await createTxn.mutateAsync(values);
    }
    onOpenChange(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setValue("receiptUrl", dataUrl);
    } finally {
      setUploading(false);
    }
  }

  const saving = createTxn.isPending || updateTxn.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the details of this transaction." : "Log a new income or expense."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={(v) => { field.onChange(v); setValue("categoryId", ""); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Grocery run" {...register("title")} />
              {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
              {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Connected account (optional)</Label>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="No account" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No connected account</SelectItem>
                      {accounts?.map((a) => {
                        const meta = ACCOUNT_TYPE_META[a.type as AccountType];
                        return (
                          <SelectItem key={a.id} value={a.id}>
                            {meta.emoji} {a.accountName} {a.isDefault ? "(default)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Optional notes…" {...register("notes")} />
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Recurring transaction</p>
                <p className="text-xs text-muted-foreground">Repeats automatically for planning purposes</p>
              </div>
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={(v) => { field.onChange(v); if (!v) setValue("recurrenceInterval", null); }} />
                )}
              />
            </div>
            {isRecurring && (
              <div className="col-span-2 space-y-1.5">
                <Label>Repeats</Label>
                <Controller
                  control={control}
                  name="recurrenceInterval"
                  render={({ field }) => (
                    <Select value={field.value ?? "monthly"} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label>Receipt (optional)</Label>
              {receiptUrl ? (
                <div className="flex items-center gap-3">
                  <img src={receiptUrl} alt="Receipt" className="size-16 rounded-md border border-border object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => setValue("receiptUrl", "")}>
                    <X className="size-3.5" /> Remove
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border-strong px-3 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                  <Upload className="size-4" />
                  {uploading ? "Uploading…" : "Attach a receipt image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

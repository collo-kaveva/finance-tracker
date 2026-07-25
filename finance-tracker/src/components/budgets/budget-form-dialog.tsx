"use client";
import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { budgetSchema, type BudgetInput } from "@/lib/validation";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import type { BudgetDTO } from "@/lib/api-client";
import { MONTH_NAMES } from "@/lib/utils";

export function BudgetFormDialog({
  open,
  onOpenChange,
  editing,
  defaultMonth,
  defaultYear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: BudgetDTO | null;
  defaultMonth: number;
  defaultYear: number;
}) {
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const {
    register, handleSubmit, control, reset,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema) as Resolver<BudgetInput>,
    defaultValues: { name: "", amount: 0, month: defaultMonth, year: defaultYear, categoryId: null },
  });

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        name: editing.name, amount: editing.amount, month: editing.month, year: editing.year,
        categoryId: editing.categoryId,
      });
    } else {
      reset({ name: "", amount: 0, month: defaultMonth, year: defaultYear, categoryId: null });
    }
  }, [open, editing, defaultMonth, defaultYear, reset]);

  async function onSubmit(values: BudgetInput) {
    if (editing) {
      await updateBudget.mutateAsync({ id: editing.id, input: values });
    } else {
      await createBudget.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const saving = createBudget.isPending || updateBudget.isPending;
  const expenseCategories = categories?.filter((c) => c.type === "expense") ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit budget" : "Create budget"}</DialogTitle>
          <DialogDescription>
            Set an overall monthly limit, or scope it to a single category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Budget name</Label>
            <Input id="name" placeholder="e.g. Monthly groceries" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Category (optional — leave blank for overall budget)</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Overall (all categories)</SelectItem>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Budget amount</Label>
            <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Controller
                control={control}
                name="month"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((m, i) => (
                        <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" {...register("year")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Create budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

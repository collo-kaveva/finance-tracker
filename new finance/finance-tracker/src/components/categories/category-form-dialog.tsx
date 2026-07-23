"use client";
import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";
import { Loader2, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categorySchema, type CategoryInput } from "@/lib/validation";
import { CATEGORY_ICON_OPTIONS, CATEGORY_COLOR_OPTIONS } from "@/lib/default-categories";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import type { CategoryDTO } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function CategoryFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: CategoryDTO | null;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register, handleSubmit, control, watch, setValue, reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryInput>,
    defaultValues: { name: "", color: CATEGORY_COLOR_OPTIONS[0], icon: "Tag", type: "expense" },
  });

  const color = watch("color");
  const icon = watch("icon");

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({ name: editing.name, color: editing.color, icon: editing.icon, type: editing.type });
    } else {
      reset({ name: "", color: CATEGORY_COLOR_OPTIONS[0], icon: "Tag", type: "expense" });
    }
  }, [open, editing, reset]);

  async function onSubmit(values: CategoryInput) {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, input: values });
    } else {
      await createCategory.mutateAsync(values);
    }
    onOpenChange(false);
  }

  const saving = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>Categories help group your transactions and budgets.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Subscriptions" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  className="flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-all"
                  style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                >
                  {color === c && <Check className="size-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-1.5 rounded-md border border-border p-2">
              {CATEGORY_ICON_OPTIONS.map((name) => {
                const IconComp = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Tag;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setValue("icon", name)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md hover:bg-surface-muted",
                      icon === name && "bg-primary-soft text-primary"
                    )}
                  >
                    <IconComp className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import * as React from "react";
import * as Icons from "lucide-react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import type { CategoryDTO } from "@/lib/api-client";

function CategoryCard({ category, onEdit }: { category: CategoryDTO; onEdit: () => void }) {
  const deleteCategory = useDeleteCategory();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const IconComp = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Tag;

  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${category.color}22`, color: category.color }}
      >
        <IconComp className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{category.name}</p>
        <Badge variant="secondary" className="mt-0.5">{category.type}</Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Category actions">
            <Icons.MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}><Icons.Pencil /> Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-danger focus:text-danger">
            <Icons.Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{category.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Categories with existing transactions can&apos;t be deleted — reassign those transactions first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteCategory.mutate(category.id); setConfirmDelete(false); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryDTO | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(c: CategoryDTO) {
    setEditing(c);
    setFormOpen(true);
  }

  const expense = categories?.filter((c) => c.type === "expense") ?? [];
  const income = categories?.filter((c) => c.type === "income") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize how income and spending get grouped</p>
        </div>
        <Button onClick={openCreate}><Plus className="size-4" /> New category</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Expense categories</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {expense.map((c) => <CategoryCard key={c.id} category={c} onEdit={() => openEdit(c)} />)}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Income categories</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {income.map((c) => <CategoryCard key={c.id} category={c} onEdit={() => openEdit(c)} />)}
            </div>
          </section>
        </div>
      )}

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </div>
  );
}

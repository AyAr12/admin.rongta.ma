"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  FolderTree,
  Pencil,
  Trash2,
  ChevronRight,
  FolderOpen,
  Folder,
  FileText,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import { useRouter } from "next/navigation";
import CategoryImage from "./category-image";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  productCount: number;
  childrenCount: number;
};

type FormMode =
  | { type: "idle" }
  | { type: "create"; parentId: string | null }
  | { type: "edit"; category: Category };

// ──────────────────────────────────────────
// Tree Node
// ──────────────────────────────────────────
function TreeNode({
  category,
  allCategories,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: {
  category: Category;
  allCategories: Category[];
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const children = allCategories.filter((c) => c.parentId === category.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedId === category.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer transition-colors text-sm",
          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/60",
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect(category.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(category.id);
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-muted"
        >
          {hasChildren ? (
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-90",
              )}
            />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-[#FF6400]" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <span className="flex-1 truncate font-medium">{category.name}</span>

        {category.productCount > 0 && (
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] shrink-0"
          >
            {category.productCount}
          </Badge>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(category.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            title="Ajouter sous-catégorie"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            title="Modifier"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted hover:text-red-600"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isExpanded &&
        children.map((child) => (
          <TreeNode
            key={child.id}
            category={child}
            allCategories={allCategories}
            depth={depth + 1}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={onSelect}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}

// ──────────────────────────────────────────
// Main Manager
// ──────────────────────────────────────────
export default function CategoryTreeManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const roots = initialCategories.filter((c) => !c.parentId);
    return new Set(roots.map((r) => r.id));
  });

  const [formMode, setFormMode] = useState<FormMode>({ type: "idle" });
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ★ Sync state when server re-renders with new props
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedId) || null,
    [categories, selectedId],
  );

  function handleToggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleStartCreate(parentId: string | null) {
    setFormMode({ type: "create", parentId });
    setFormName("");
    setFormError(null);
    if (parentId) {
      setExpandedIds((prev) => new Set(prev).add(parentId));
    }
  }

  function handleStartEdit(cat: Category) {
    setFormMode({ type: "edit", category: cat });
    setFormName(cat.name);
    setFormError(null);
    setSelectedId(cat.id);
  }

  function handleCancelForm() {
    setFormMode({ type: "idle" });
    setFormName("");
    setFormError(null);
  }

  function handleSubmitForm() {
    if (!formName.trim()) {
      setFormError("Le nom est requis.");
      return;
    }

    setFormError(null);
    const fd = new FormData();
    fd.set("name", formName.trim());

    if (formMode.type === "create") {
      fd.set("parentId", formMode.parentId || "");
      startTransition(async () => {
        const result = await createCategory(fd);
        if (result?.error) {
          setFormError(result.error);
        } else {
          handleCancelForm();
          router.refresh();
        }
      });
    } else if (formMode.type === "edit") {
      fd.set("parentId", formMode.category.parentId || "");
      startTransition(async () => {
        const result = await updateCategory(formMode.category.id, fd);
        if (result?.error) {
          setFormError(result.error);
        } else {
          handleCancelForm();
          router.refresh();
        }
      });
    }
  }

  function handleDeleteRequest(cat: Category) {
    setDeleteError(null);
    setDeleteTarget(cat);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (result?.error) {
        setDeleteError(result.error);
        setDeleteTarget(null);
      } else {
        if (selectedId === deleteTarget.id) setSelectedId(null);
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  const parentName = useMemo(() => {
    if (formMode.type === "create" && formMode.parentId) {
      return categories.find((c) => c.id === formMode.parentId)?.name || "";
    }
    if (formMode.type === "edit" && formMode.category.parentId) {
      return (
        categories.find((c) => c.id === formMode.category.parentId)?.name || ""
      );
    }
    return null;
  }, [formMode, categories]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Catégories</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} catégorie{categories.length !== 1 && "s"} ·
            Organisez votre catalogue en arborescence.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => handleStartCreate(null)}
          disabled={formMode.type !== "idle"}
        >
          <Plus className="h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Tree */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Arborescence</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    setExpandedIds(new Set(categories.map((c) => c.id)))
                  }
                >
                  Tout ouvrir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setExpandedIds(new Set())}
                >
                  Tout fermer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {rootCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <FolderTree className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Aucune catégorie</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliquez sur &ldquo;Nouvelle catégorie&rdquo; pour commencer.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {rootCategories.map((cat) => (
                  <TreeNode
                    key={cat.id}
                    category={cat}
                    allCategories={categories}
                    depth={0}
                    selectedId={selectedId}
                    expandedIds={expandedIds}
                    onSelect={setSelectedId}
                    onToggle={handleToggle}
                    onAddChild={handleStartCreate}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {formMode.type !== "idle" && (
            <Card className="border-[#FF6400]/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {formMode.type === "create"
                      ? "Nouvelle catégorie"
                      : "Modifier la catégorie"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCancelForm}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {parentName && (
                  <CardDescription>
                    {formMode.type === "create" ? "Sous" : "Dans"} :{" "}
                    <span className="font-medium text-foreground">
                      {parentName}
                    </span>
                  </CardDescription>
                )}
                {formMode.type === "create" && !parentName && (
                  <CardDescription>
                    Catégorie racine (niveau principal)
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nom *</Label>
                  <Input
                    id="cat-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ex: Imprimantes 80mm"
                    className="h-10"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmitForm();
                      }
                      if (e.key === "Escape") handleCancelForm();
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Le slug sera généré automatiquement.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitForm}
                    disabled={isPending}
                    className="gap-2 flex-1"
                    size="sm"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {formMode.type === "create" ? "Créer" : "Enregistrer"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelForm}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedCategory && formMode.type === "idle" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Folder className="h-4 w-4 text-[#FF6400]" />
                  {selectedCategory.name}
                </CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="font-mono text-xs mt-1">
                    {selectedCategory.slug}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* ★ Image */}
                <CategoryImage
                  key={selectedCategory.id}
                  categoryId={selectedCategory.id}
                  image={selectedCategory.image}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-lg font-semibold">
                      {selectedCategory.productCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Produits</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-lg font-semibold">
                      {selectedCategory.childrenCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sous-catégories
                    </p>
                  </div>
                </div>

                {selectedCategory.parentId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Parent : </span>
                    <span className="font-medium">
                      {categories.find(
                        (c) => c.id === selectedCategory.parentId,
                      )?.name || "—"}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => handleStartEdit(selectedCategory)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 flex-1"
                    onClick={() => handleStartCreate(selectedCategory.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Sous-catégorie
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedCategory && formMode.type === "idle" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FolderTree className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Sélectionnez une catégorie pour voir ses détails.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &ldquo;{deleteTarget?.name}
              &rdquo; ? Cette action est irréversible.
              {deleteTarget &&
                (deleteTarget.productCount > 0 ||
                  deleteTarget.childrenCount > 0) && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Cette catégorie contient{" "}
                    {deleteTarget.productCount > 0 &&
                      `${deleteTarget.productCount} produit(s)`}
                    {deleteTarget.productCount > 0 &&
                      deleteTarget.childrenCount > 0 &&
                      " et "}
                    {deleteTarget.childrenCount > 0 &&
                      `${deleteTarget.childrenCount} sous-catégorie(s)`}
                    . Suppression impossible.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={
                isPending ||
                !!(
                  deleteTarget &&
                  (deleteTarget.productCount > 0 ||
                    deleteTarget.childrenCount > 0)
                )
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

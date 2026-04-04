"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type CategoryOption = { id: string; name: string };

export default function CategoryForm({
  action,
  categories,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  categories: CategoryOption[];
  defaultValues?: { name: string; parentId: string | null };
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href="/categories">
          <ArrowLeft className="h-4 w-4" />
          Retour aux catégories
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {defaultValues ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="ex: Imprimantes 80mm"
                defaultValue={defaultValues?.name || ""}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Le slug sera généré automatiquement à partir du nom.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Catégorie parente (optionnel)</Label>
              <select
                id="parentId"
                name="parentId"
                defaultValue={defaultValues?.parentId || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Aucune (catégorie racine)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {defaultValues ? "Enregistrer" : "Créer la catégorie"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/categories">Annuler</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft, Save, Globe, FileEdit } from "lucide-react";
import Link from "next/link";
import SpecsEditor from "./specs-editor";
import WysiwygEditor from "@/components/wysiwyg-editor";

type CategoryOption = { id: string; name: string };

type ProductDefaults = {
  modelCode: string;
  name: string;
  categoryId: string;
  features: string;
  specs: Record<string, string>;
  downloads: any;
  isAvailable: boolean;
  status: string;
};

export default function ProductForm({
  action,
  categories,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  categories: CategoryOption[];
  defaultValues?: ProductDefaults;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(defaultValues?.status || "draft");

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("status", status);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {status === "draft" ? (
            <span className="flex items-center gap-1.5">
              <FileEdit className="h-4 w-4" />
              Brouillon
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Globe className="h-4 w-4" />
              Publié
            </span>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* General info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations générales</CardTitle>
            <CardDescription>
              Identité du produit dans le catalogue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modelCode">Code modèle *</Label>
                <Input
                  id="modelCode"
                  name="modelCode"
                  required
                  placeholder="ex: RP80USE"
                  defaultValue={defaultValues?.modelCode || ""}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom commercial *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="ex: Imprimante POS 80mm"
                  defaultValue={defaultValues?.name || ""}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Catégorie *</Label>
              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={defaultValues?.categoryId || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                defaultChecked={defaultValues?.isAvailable ?? true}
                className="h-4 w-4 rounded border-input accent-[#FF6400]"
              />
              <Label htmlFor="isAvailable" className="text-sm font-normal">
                Produit disponible
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Features — WYSIWYG */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Description et points forts
            </CardTitle>
            <CardDescription>
              Contenu marketing affiché sur la fiche produit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WysiwygEditor
              name="features"
              defaultValue={defaultValues?.features || ""}
              placeholder="Décrivez les points forts du produit..."
            />
          </CardContent>
        </Card>

        {/* Specs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Spécifications techniques
            </CardTitle>
            <CardDescription>
              Caractéristiques techniques ligne par ligne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpecsEditor defaultValue={defaultValues?.specs} />
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Ressources et téléchargements
            </CardTitle>
            <CardDescription>
              Liens vers pilotes, manuels (optionnel, format JSON).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              id="downloads"
              name="downloads"
              rows={4}
              placeholder={
                '[{"title": "Pilote Windows", "url": "/downloads/driver.zip", "type": "driver"}]'
              }
              defaultValue={
                defaultValues?.downloads
                  ? JSON.stringify(defaultValues.downloads, null, 2)
                  : ""
              }
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        {/* Submit actions — draft vs publish */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="outline"
                disabled={isPending}
                className="gap-2 flex-1"
                onClick={() => setStatus("draft")}
              >
                {isPending && status === "draft" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileEdit className="h-4 w-4" />
                )}
                {defaultValues
                  ? "Enregistrer en brouillon"
                  : "Sauvegarder brouillon"}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 flex-1"
                onClick={() => setStatus("published")}
              >
                {isPending && status === "published" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                {defaultValues
                  ? "Enregistrer et publier"
                  : "Créer et publier"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Les brouillons ne sont pas visibles sur le site public.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  Package,
  CheckCircle2,
  XCircle,
  Tag,
  Cpu,
  Download,
} from "lucide-react";
import ImageManager from "./image-manager";
import StatusBadge from "@/components/status-badge";
import PublishButton from "./publish-button";
import CoverImage from "../cover-image";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  const specs = (product.specs as Record<string, string>) || {};
  const downloads = (product.downloads as any[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/products/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <PublishButton id={product.id} status={product.status} />
        </div>
      </div>

      {/* Product header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <Package className="h-7 w-7 text-[#FF6400]" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                {product.isAvailable ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Indisponible
                  </Badge>
                )}
                <StatusBadge status={product.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.modelCode}
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="secondary">{product.category.name}</Badge>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  Slug:{" "}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {product.slug}
                  </code>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column: images + features */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cover image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Image de couverture</CardTitle>
              <CardDescription>
                Image principale affichée dans les listes et le hero produit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoverImage
                key={product.id}
                productId={product.id}
                image={product.coverImage}
              />
            </CardContent>
          </Card>

          {/* Gallery images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Galerie</CardTitle>
              <CardDescription>
                Images supplémentaires du produit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageManager productId={product.id} images={product.images} />
            </CardContent>
          </Card>

          {/* Features */}
          {product.features &&
            product.features.trim() !== "" &&
            product.features !== "<p></p>" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Description et points forts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-0.5 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:my-1"
                    dangerouslySetInnerHTML={{ __html: product.features }}
                  />
                </CardContent>
              </Card>
            )}
        </div>

        {/* Right column: specs + downloads */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specs */}
          {(() => {
            const specsData = product.specs as any;
            const groups: {
              group: string;
              items: { key: string; value: string }[];
            }[] = Array.isArray(specsData)
              ? specsData
              : specsData && typeof specsData === "object"
                ? [
                    {
                      group: "",
                      items: Object.entries(specsData).map(([key, value]) => ({
                        key,
                        value: String(value),
                      })),
                    },
                  ]
                : [];

            if (
              groups.length === 0 ||
              groups.every((g) => g.items.length === 0)
            )
              return null;

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    Spécifications techniques
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {groups.map((group, gi) => (
                    <div key={gi}>
                      {group.group && (
                        <div className="px-6 py-2 bg-muted/30 border-y border-border">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.group}
                          </span>
                        </div>
                      )}
                      <div className="divide-y divide-border">
                        {group.items.map((item, ii) => (
                          <div
                            key={ii}
                            className="flex items-start justify-between gap-4 px-6 py-3 text-sm"
                          >
                            <span className="text-muted-foreground shrink-0 min-w-[140px]">
                              {item.key}
                            </span>
                            <span className="font-medium text-left whitespace-pre-line">
                              {/* On remplace les caractères littéraux "\n" par de vrais sauts de ligne */}
                              {item.value.replace(/\\n/g, "\n")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })()}

          {/* Downloads */}
          {downloads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  Téléchargements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {downloads.map((dl: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="font-medium">{dl.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {dl.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span>
                  {new Date(product.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span>
                  {new Date(product.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {product.id}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

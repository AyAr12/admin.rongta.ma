import prisma from "@/lib/prisma";
import {
  Package,
  FolderTree,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Globe,
  FileEdit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getStats() {
  const [totalProducts, totalCategories, availableProducts, publishedProducts, draftProducts, recentProducts] =
  await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isAvailable: true } }),
    prisma.product.count({ where: { status: "published" } }),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  return {
    totalProducts,
    totalCategories,
    availableProducts,
    unavailableProducts: totalProducts - availableProducts,
    recentProducts,
    publishedProducts,
    draftProducts,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
  {
    label: "Total Produits",
    value: stats.totalProducts,
    icon: Package,
    color: "text-[#FF6400]",
    bg: "bg-orange-50",
  },
  {
    label: "Publiés",
    value: stats.publishedProducts,
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Brouillons",
    value: stats.draftProducts,
    icon: FileEdit,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Catégories",
    value: stats.totalCategories,
    icon: FolderTree,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start gap-2" size="sm">
              <Link href="/products/new">
                <Package className="h-4 w-4" />
                Ajouter un produit
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Link href="/categories/nouveau">
                <FolderTree className="h-4 w-4" />
                Ajouter une catégorie
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Link href="/products">
                <TrendingUp className="h-4 w-4" />
                Voir tous les produits
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Produits récents</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/products">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun produit pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.modelCode} · {product.category.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${
                          product.isAvailable
                            ? "bg-emerald-500"
                            : "bg-slate-300"
                        }`}
                      />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(product.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

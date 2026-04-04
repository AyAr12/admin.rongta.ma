import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Pencil, Eye, ImageIcon } from "lucide-react";
import DeleteProductButton from "./delete-button";
import ToggleAvailability from "./toggle-availability";
import StatusBadge from "@/components/status-badge";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Produits</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} produit{products.length !== 1 && "s"} au total
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Aucun produit</p>
              <p className="text-sm text-muted-foreground mt-1">
                Commencez par en créer un.
              </p>
              <Button asChild className="mt-4 gap-2" size="sm">
                <Link href="/products/new">
                  <Plus className="h-4 w-4" />
                  Créer un produit
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="hidden md:table-cell">Code</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Catégorie
                  </TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center hidden md:table-cell">
                    Dispo.
                  </TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    Images
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {product.modelCode}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-mono text-xs">
                        {product.modelCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {product.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <ToggleAvailability
                        id={product.id}
                        isAvailable={product.isAvailable}
                      />
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span className="text-xs">{product.images.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link href={`/products/${product.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link href={`/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton
                          id={product.id}
                          name={product.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

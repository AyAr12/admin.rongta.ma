import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "../../product-form";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  const boundAction = updateProduct.bind(null, id);

  return (
    <ProductForm
      action={boundAction}
      categories={categories}
      defaultValues={{
        modelCode: product.modelCode,
        name: product.name,
        categoryId: product.categoryId,
        features: product.features,
        specs: product.specs as Record<string, string>,
        downloads: product.downloads,
        isAvailable: product.isAvailable,
        status: product.status,
      }}
    />
  );
}

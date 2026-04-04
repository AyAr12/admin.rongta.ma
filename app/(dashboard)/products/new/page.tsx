import prisma from "@/lib/prisma";
import ProductForm from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ProductForm action={createProduct} categories={categories} />;
}

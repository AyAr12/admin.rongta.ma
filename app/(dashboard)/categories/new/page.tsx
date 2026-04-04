import prisma from "@/lib/prisma";
import CategoryForm from "../category-form";
import { createCategory } from "../actions";

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <CategoryForm action={createCategory} categories={categories} />;
}

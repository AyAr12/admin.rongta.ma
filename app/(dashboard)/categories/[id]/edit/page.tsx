import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryForm from "../../category-form";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!category) notFound();

  const boundAction = updateCategory.bind(null, id);

  return (
    <CategoryForm
      action={boundAction}
      categories={allCategories}
      defaultValues={{
        name: category.name,
        parentId: category.parentId,
      }}
    />
  );
}

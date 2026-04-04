import prisma from "@/lib/prisma";
import CategoryTreeManager from "./category-tree-manager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });

  const serialized = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    parentId: cat.parentId,
    productCount: cat._count.products,
    childrenCount: cat._count.children,
  }));

  return <CategoryTreeManager initialCategories={serialized} />;
}

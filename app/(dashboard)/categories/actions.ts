"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import slugify from "slugify";

const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  parentId: z.string().optional().nullable(),
});

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const slug = slugify(parsed.data.name, { lower: true, strict: true });

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Une catégorie avec ce nom existe déjà." };
  }

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      parentId: parsed.data.parentId || undefined,
    },
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const slug = slugify(parsed.data.name, { lower: true, strict: true });

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: "Une catégorie avec ce nom existe déjà." };
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      parentId: parsed.data.parentId || null,
    },
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    return {
      error: `Impossible : ${productCount} produit(s) lié(s).`,
    };
  }

  const childCount = await prisma.category.count({
    where: { parentId: id },
  });

  if (childCount > 0) {
    return {
      error: `Impossible : ${childCount} sous-catégorie(s) liée(s).`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  return { success: true };
}
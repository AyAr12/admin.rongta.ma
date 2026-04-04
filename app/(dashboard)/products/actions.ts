"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import slugify from "slugify";

const productSchema = z.object({
  modelCode: z.string().min(1, "Le code modèle est requis"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  features: z.string().optional(),
  specs: z.string().optional(),
  downloads: z.string().optional(),
  isAvailable: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
});

function parseJsonField(raw: string | undefined, fallback: any) {
  if (!raw || raw.trim() === "") return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    modelCode: formData.get("modelCode"),
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    features: formData.get("features"),
    specs: formData.get("specs"),
    downloads: formData.get("downloads"),
    isAvailable: formData.get("isAvailable") === "on",
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = slugify(`${parsed.data.modelCode}-${parsed.data.name}`, {
    lower: true,
    strict: true,
  });

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Un produit avec ce slug existe déjà." };
  }

  const specs = parseJsonField(parsed.data.specs, {});
  const downloads = parseJsonField(parsed.data.downloads, null);

  await prisma.product.create({
    data: {
      modelCode: parsed.data.modelCode,
      name: parsed.data.name,
      slug,
      categoryId: parsed.data.categoryId,
      features: parsed.data.features || "",
      images: [],
      specs,
      downloads,
      isAvailable: parsed.data.isAvailable,
      status: parsed.data.status,
    },
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = productSchema.safeParse({
    modelCode: formData.get("modelCode"),
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    features: formData.get("features"),
    specs: formData.get("specs"),
    downloads: formData.get("downloads"),
    isAvailable: formData.get("isAvailable") === "on",
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = slugify(`${parsed.data.modelCode}-${parsed.data.name}`, {
    lower: true,
    strict: true,
  });

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: "Un produit avec ce slug existe déjà." };
  }

  const specs = parseJsonField(parsed.data.specs, {});
  const downloads = parseJsonField(parsed.data.downloads, null);

  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: { images: true },
  });

  await prisma.product.update({
    where: { id },
    data: {
      modelCode: parsed.data.modelCode,
      name: parsed.data.name,
      slug,
      categoryId: parsed.data.categoryId,
      features: parsed.data.features || "",
      images: currentProduct?.images || [],
      specs,
      downloads,
      isAvailable: parsed.data.isAvailable,
      status: parsed.data.status,
    },
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  return { success: true };
}

export async function toggleProductAvailability(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { isAvailable: true },
  });
  if (!product) return { error: "Produit introuvable." };

  await prisma.product.update({
    where: { id },
    data: { isAvailable: !product.isAvailable },
  });

  revalidatePath("/products");
  return { success: true };
}

export async function publishProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { status: "published" },
  });
  revalidatePath("/products");
  return { success: true };
}

export async function unpublishProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { status: "draft" },
  });
  revalidatePath("/products");
  return { success: true };
}
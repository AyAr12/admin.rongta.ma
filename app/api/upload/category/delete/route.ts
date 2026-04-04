import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { categoryId } = await req.json();

  if (!categoryId) {
    return NextResponse.json({ error: "categoryId requis" }, { status: 400 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { image: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 },
      );
    }

    if (category.image) {
      const filePath = path.join(process.cwd(), "public", category.image);
      try {
        await unlink(filePath);
      } catch {}
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category image error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}

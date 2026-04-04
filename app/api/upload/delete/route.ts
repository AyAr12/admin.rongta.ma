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

  const { productId, imageUrl, type } = await req.json();

  if (!productId || !imageUrl) {
    return NextResponse.json(
      { error: "productId et imageUrl requis" },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true, coverImage: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 },
      );
    }

    if (type === "cover") {
      await prisma.product.update({
        where: { id: productId },
        data: { coverImage: null },
      });
    } else {
      const updatedImages = product.images.filter((img) => img !== imageUrl);
      await prisma.product.update({
        where: { id: productId },
        data: { images: updatedImages },
      });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), "public", imageUrl);
    try {
      await unlink(filePath);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
      _count: {
        select: {
          products: { where: { status: "published" } },
        },
      },
    },
  });

  return NextResponse.json({ data: categories });
}
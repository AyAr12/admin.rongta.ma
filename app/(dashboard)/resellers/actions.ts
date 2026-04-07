"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateResellerStatus(id: string, status: string) {
  const validStatuses = ["pending", "contacted", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return { error: "Statut invalide" };
  }

  await prisma.resellerRequest.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/resellers");
  return { success: true };
}

"use server";

import { signIn } from "next-auth/react";

// En NextAuth v4, le signIn côté serveur n'existe pas directement.
// On gère l'auth côté client dans le formulaire login.
// Ce fichier fournit une action serveur qui valide les credentials manuellement.

import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return { error: "Email ou mot de passe incorrect." };
    }

    const isValid = await compare(password, user.hashedPassword);

    if (!isValid) {
      return { error: "Email ou mot de passe incorrect." };
    }

    // Credentials sont valides — le signIn se fera côté client
    return { success: true };
  } catch (error) {
    return { error: "Une erreur est survenue." };
  }
}
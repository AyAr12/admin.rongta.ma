import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withCors, corsPreflightResponse } from "@/lib/cors";

const schema = z.object({
  companyName: z.string().min(2, "Le nom de la société est requis"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return withCors(
        req,
        NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        )
      );
    }

    const request = await prisma.resellerRequest.create({
      data: {
        companyName: parsed.data.companyName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
      },
    });

    return withCors(
      req,
      NextResponse.json({ success: true, id: request.id })
    );
  } catch (error) {
    console.error("Reseller request error:", error);
    return withCors(
      req,
      NextResponse.json(
        { error: "Erreur serveur. Réessayez plus tard." },
        { status: 500 }
      )
    );
  }
}
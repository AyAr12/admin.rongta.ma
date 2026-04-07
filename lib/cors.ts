import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://rongtama.netlify.app",
  "https://www.rongtama.netlify.app",
  "https://rongta.ma",
  "https://www.rongta.ma",
  "http://localhost:3000",
];

export function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get("origin");

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  res.headers.set("Access-Control-Max-Age", "86400");

  return res;
}

export function corsPreflightResponse(req: NextRequest): NextResponse {
  return withCors(req, new NextResponse(null, { status: 204 }));
}

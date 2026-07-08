import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site");

export async function POST(req: Request) {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const res = await fetch(`${CONVEX_SITE_URL}/http/career-chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: body.content }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

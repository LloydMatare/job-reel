import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const payload = await req.text();
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  const { type, data } = event;

  switch (type) {
    case "user.created":
    case "user.updated": {
      const userData = data as Record<string, unknown>;
      const id: string = userData.id as string;
      const emailAddresses = userData.email_addresses as
        | Array<Record<string, unknown>>
        | undefined;
      const email: string =
        (emailAddresses?.[0]?.email_address as string) ?? "";
      const name: string =
        `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim() ||
        email;
      const avatarUrl = (userData.image_url as string) || undefined;

      await fetchMutation(api.users.syncUser, {
        tokenIdentifier: id,
        name,
        email,
        avatarUrl,
        webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
      });
      break;
    }
    case "user.deleted": {
      const userData = data as Record<string, unknown>;
      const id = userData.id as string;
      await fetchMutation(api.users.markUserDeleted, {
        tokenIdentifier: id,
        webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
      });
      break;
    }
  }

  return NextResponse.json({ ok: true });
}

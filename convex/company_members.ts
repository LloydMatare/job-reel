import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./permissions";

function getOrgId(
  identity: Record<string, unknown>,
): string | undefined {
  const nested = identity.o as Record<string, unknown> | undefined;
  const candidates = [identity.orgId, identity.org_id, nested?.id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
}

export const listCompanyMembers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) return [];

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();
    if (!company) return [];

    const members = await ctx.db
      .query("company_members")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();

    return await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get("users", m.userId);
        return {
          ...m,
          user: user
            ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl }
            : null,
        };
      }),
    );
  },
});

export const updateMemberRole = mutation({
  args: {
    memberId: v.id("company_members"),
    role: v.union(
      v.literal("admin"),
      v.literal("recruiter"),
      v.literal("member"),
    ),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get("company_members", args.memberId);
    if (!member) throw new Error("Member not found");

    const company = await ctx.db.get("companies", member.companyId);
    if (!company) throw new Error("Company not found");

    await requireAdmin(ctx, company._id);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (currentUser && currentUser._id === member.userId) {
      throw new Error("Cannot change your own role");
    }

    await ctx.db.patch(args.memberId, { role: args.role });
  },
});

export const removeMember = mutation({
  args: {
    memberId: v.id("company_members"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get("company_members", args.memberId);
    if (!member) throw new Error("Member not found");

    const company = await ctx.db.get("companies", member.companyId);
    if (!company) throw new Error("Company not found");

    await requireAdmin(ctx, company._id);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (currentUser && currentUser._id === member.userId) {
      throw new Error("Cannot remove yourself");
    }

    if (member.role === "admin") {
      const adminCount = await ctx.db
        .query("company_members")
        .withIndex("by_company", (q) => q.eq("companyId", company._id))
        .collect()
        .then((ms) => ms.filter((m) => m.role === "admin").length);

      if (adminCount <= 1) {
        throw new Error("Cannot remove the last admin");
      }
    }

    await ctx.db.delete(args.memberId);
  },
});

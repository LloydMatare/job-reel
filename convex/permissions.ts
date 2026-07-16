import { query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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

async function getAuthedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  return user ? { identity, user } : null;
}

async function findMember(
  ctx: QueryCtx | MutationCtx,
  companyId: Id<"companies">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("company_members")
    .withIndex("by_company_and_user", (q) =>
      q.eq("companyId", companyId).eq("userId", userId),
    )
    .unique();
}

export async function getMemberRole(
  ctx: QueryCtx | MutationCtx,
  companyId: Id<"companies">,
): Promise<"admin" | "recruiter" | "member" | null> {
  const authed = await getAuthedUser(ctx);
  if (!authed) return null;

  const member = await findMember(ctx, companyId, authed.user._id);
  return member?.role ?? null;
}

export async function ensureMember(
  ctx: MutationCtx,
  companyId: Id<"companies">,
): Promise<"admin" | "recruiter" | "member"> {
  const authed = await getAuthedUser(ctx);
  if (!authed) throw new Error("Not authenticated");

  const existing = await findMember(ctx, companyId, authed.user._id);
  if (existing) return existing.role;

  const company = await ctx.db.get("companies", companyId);
  if (!company) throw new Error("Company not found");

  const claims = authed.identity as Record<string, unknown>;
  const orgId = getOrgId(claims);
  if (typeof orgId !== "string" || orgId !== company.clerkOrgId) {
    throw new Error("Not a member of this organization");
  }

  const orgRole = claims.orgRole;
  const role = orgRole === "org:admin" || company.ownerId === authed.user._id
    ? "admin"
    : "recruiter";

  await ctx.db.insert("company_members", {
    companyId,
    userId: authed.user._id,
    role,
  });

  return role;
}

export async function requireAdmin(
  ctx: MutationCtx,
  companyId: Id<"companies">,
): Promise<void> {
  const role = await ensureMember(ctx, companyId);
  if (role !== "admin") throw new Error("Admin access required");
}

export async function requireRecruiterOrAbove(
  ctx: MutationCtx,
  companyId: Id<"companies">,
): Promise<void> {
  const role = await ensureMember(ctx, companyId);
  if (role === "member") throw new Error("Recruiter or admin access required");
}

export const getMyCompanyRole = query({
  args: {},
  handler: async (ctx) => {
    const authed = await getAuthedUser(ctx);
    if (!authed) return null;

    const orgId = getOrgId(authed.identity as Record<string, unknown>);
    if (!orgId) return null;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();
    if (!company) return null;

    const role = await getMemberRole(ctx, company._id);
    return role;
  },
});

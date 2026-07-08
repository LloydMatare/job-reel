import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function getOrgId(
  identity: Record<string, unknown>,
): string | undefined {
  // Clerk can surface the active organization under different claim names,
  // depending on how the "convex" JWT template is configured: "orgId", the
  // Clerk default "org_id", or a nested organization object "o".
  const nested = identity.o as Record<string, unknown> | undefined;
  const candidates = [identity.orgId, identity.org_id, nested?.id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const getMyCompany = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (orgId) {
      return await ctx.db
        .query("companies")
        .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
        .unique();
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user?.companyId) return null;

    return await ctx.db.get("companies", user.companyId);
  },
});

export const getCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get("companies", args.companyId);
  },
});

export const getCompanyBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getCompanyByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();
  },
});

export const createOrgCompany = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    size: v.optional(v.string()),
    industry: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const claims = identity as Record<string, unknown>;
    const orgId = getOrgId(claims);
    if (!orgId) {
      // TEMP debug: reveals exactly which claims Convex received so we can tell
      // whether the "convex" JWT template emits the org id at all, and under
      // what name. Remove once the root cause is confirmed.
      console.log(
        "[org-debug] createOrgCompany: no org claim; identity keys =",
        Object.keys(claims),
      );
      throw new Error("No organization selected");
    }
    if (orgId !== args.clerkOrgId)
      throw new Error("Organization mismatch");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "employer" || !user.onboarded) {
      await ctx.db.patch(user._id, { role: "employer", onboarded: true });
    }

    const existing = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    if (existing) throw new Error("Company already exists for this organization");

    let slug = slugify(args.name);
    const slugExists = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      slug,
      clerkOrgId: args.clerkOrgId,
      description: args.description,
      website: args.website,
      location: args.location,
      size: args.size,
      industry: args.industry,
      logoStorageId: args.logoStorageId,
      ownerId: user._id,
      plan: "free",
    });

    await ctx.db.patch(user._id, { companyId });

    return companyId;
  },
});

export const updateCompany = mutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    size: v.optional(v.string()),
    industry: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) throw new Error("No organization selected");

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();

    if (!company) throw new Error("Company not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) {
      patch.name = args.name;
      const newSlug = slugify(args.name);
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      patch.slug =
        existing && existing._id !== company._id
          ? `${newSlug}-${Date.now()}`
          : newSlug;
    }
    if (args.description !== undefined) patch.description = args.description;
    if (args.website !== undefined) patch.website = args.website;
    if (args.location !== undefined) patch.location = args.location;
    if (args.size !== undefined) patch.size = args.size;
    if (args.industry !== undefined) patch.industry = args.industry;
    if (args.logoStorageId !== undefined)
      patch.logoStorageId = args.logoStorageId;

    await ctx.db.patch(company._id, patch);

    return company._id;
  },
});

export const uploadCompanyLogo = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) throw new Error("No organization selected");

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();

    if (!company) throw new Error("Company not found");

    await ctx.db.patch(company._id, { logoStorageId: args.storageId });
  },
});

export const listCompanies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").take(50);
  },
});

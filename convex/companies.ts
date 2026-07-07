import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

export const createCompany = mutation({
  args: {
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");
    if (user.role !== "employer")
      throw new Error("Only employers can create companies");
    if (user.companyId) throw new Error("User already has a company");

    let slug = slugify(args.name);
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      slug,
      description: args.description,
      website: args.website,
      location: args.location,
      size: args.size,
      industry: args.industry,
      logoStorageId: args.logoStorageId,
      ownerId: user._id,
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user?.companyId) throw new Error("No company found");

    const company = await ctx.db.get("companies", user.companyId);
    if (!company) throw new Error("Company not found");
    if (company.ownerId !== user._id)
      throw new Error("Not authorized to edit this company");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) {
      patch.name = args.name;
      const newSlug = slugify(args.name);
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      patch.slug = existing && existing._id !== company._id
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user?.companyId) throw new Error("No company found");

    const company = await ctx.db.get("companies", user.companyId);
    if (!company) throw new Error("Company not found");
    if (company.ownerId !== user._id)
      throw new Error("Not authorized");

    await ctx.db.patch(company._id, { logoStorageId: args.storageId });
  },
});

export const listCompanies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").take(50);
  },
});

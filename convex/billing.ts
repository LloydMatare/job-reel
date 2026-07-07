import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export type Plan = "free" | "pro" | "enterprise";

export type PlanLimits = {
  activeJobs: number;
  teamSeats: number;
  featuredJobs: boolean;
  analytics: boolean;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { activeJobs: 1, teamSeats: 2, featuredJobs: false, analytics: false },
  pro: { activeJobs: 10, teamSeats: 10, featuredJobs: true, analytics: true },
  enterprise: {
    activeJobs: 999,
    teamSeats: 999,
    featuredJobs: true,
    analytics: true,
  },
};

export const PLAN_PRICES: Record<Plan, string> = {
  free: "$0",
  pro: "$29/mo",
  enterprise: "Custom",
};

export const getOrgPlan = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const orgId =
      typeof (identity as Record<string, unknown>).orgId === "string"
        ? ((identity as Record<string, unknown>).orgId as string)
        : undefined;

    if (!orgId) return null;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();

    if (!company) return null;

    return {
      plan: company.plan as Plan,
      limits: PLAN_LIMITS[company.plan as Plan] ?? PLAN_LIMITS.free,
    };
  },
});

export const checkBillingLimit = query({
  args: {
    resource: v.union(v.literal("activeJobs"), v.literal("teamSeats")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId =
      typeof (identity as Record<string, unknown>).orgId === "string"
        ? ((identity as Record<string, unknown>).orgId as string)
        : undefined;

    if (!orgId) throw new Error("No organization selected");

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();

    if (!company) throw new Error("Company not found");

    const plan = company.plan as Plan;
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    const max = limit[args.resource];

    let current = 0;
    if (args.resource === "activeJobs") {
      current = await ctx.db
        .query("jobs")
        .withIndex("by_company_and_status", (q) =>
          q.eq("companyId", company._id).eq("status", "active"),
        )
        .collect()
        .then((r) => r.length);
    }

    return {
      allowed: current < max,
      current,
      max,
      plan,
    };
  },
});

export const updateOrgPlan = mutation({
  args: {
    clerkOrgId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    webhookSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.webhookSecret !== process.env.CLERK_WEBHOOK_SECRET) {
      throw new Error("Unauthorized");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    if (!company) return;

    await ctx.db.patch(company._id, { plan: args.plan });
  },
});

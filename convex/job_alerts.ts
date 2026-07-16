import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createJobAlert = mutation({
  args: {
    keywords: v.optional(v.string()),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    employmentType: v.optional(
      v.union(
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("temporary"),
        v.literal("internship"),
      ),
    ),
    salaryMin: v.optional(v.number()),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = await ctx.runMutation(api.users.ensureUser, {});
    await ctx.db.insert("job_alerts", {
      userId,
      keywords: args.keywords,
      category: args.category,
      location: args.location,
      employmentType: args.employmentType,
      salaryMin: args.salaryMin,
      frequency: args.frequency,
    });
  },
});

export const deleteJobAlert = mutation({
  args: { alertId: v.id("job_alerts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = await ctx.runMutation(api.users.ensureUser, {});
    const alert = await ctx.db.get(args.alertId);
    if (!alert || alert.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.alertId);
  },
});

export const getMyAlerts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) return [];
    return ctx.db
      .query("job_alerts")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

export const getAlertsByFrequency = query({
  args: { frequency: v.union(v.literal("daily"), v.literal("weekly")) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("job_alerts")
      .withIndex("by_frequency", (q: any) => q.eq("frequency", args.frequency))
      .collect();
  },
});

export const updateLastSent = mutation({
  args: { alertId: v.id("job_alerts"), lastSent: v.number() },
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

    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");
    if (alert.userId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.alertId, { lastSent: args.lastSent });
  },
});

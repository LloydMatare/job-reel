import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getSensitiveStats = internalQuery({
  handler: async (ctx) => {
    const [users, companies, jobs, applications] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("companies").collect(),
      ctx.db.query("jobs").collect(),
      ctx.db.query("applications").collect(),
    ]);
    return {
      totalUsers: users.length,
      totalCompanies: companies.length,
      totalJobs: jobs.length,
      totalApplications: applications.length,
    };
  },
});

export const forceMakeAdmin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: "admin" });
  },
});

export const deleteUserRecord = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

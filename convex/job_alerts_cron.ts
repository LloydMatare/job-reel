import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const internalGetAlertsByFrequency = internalQuery({
  args: { frequency: v.union(v.literal("daily"), v.literal("weekly")) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("job_alerts")
      .withIndex("by_frequency", (q: any) => q.eq("frequency", args.frequency))
      .collect();
  },
});

export const internalUpdateLastSent = internalMutation({
  args: { alertId: v.id("job_alerts"), lastSent: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { lastSent: args.lastSent });
  },
});

export const internalGetUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

export const internalListJobsForAlert = internalQuery({
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
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db.query("jobs").withIndex("by_status", (q: any) => q.eq("status", "active")).collect();
    if (args.keywords) {
      const kw = args.keywords.toLowerCase();
      jobs = jobs.filter((j) => j.title.toLowerCase().includes(kw) || j.description.toLowerCase().includes(kw));
    }
    if (args.category) jobs = jobs.filter((j) => j.category === args.category);
    if (args.employmentType) jobs = jobs.filter((j) => j.employmentType === args.employmentType);
    if (args.salaryMin) jobs = jobs.filter((j) => (j.salaryMax ?? 0) >= args.salaryMin!);
    const companyIds = [...new Set(jobs.map((j) => j.companyId))];
    const companies = new Map(
      (await Promise.all(companyIds.map((id) => ctx.db.get(id)))).filter(Boolean).map((c) => [c!._id, c]),
    );
    return jobs.map((j) => ({
      _id: j._id,
      title: j.title,
      companyName: companies.get(j.companyId)?.name ?? null,
    }));
  },
});

export const sendJobAlertsCron = internalAction({
  args: { frequency: v.union(v.literal("daily"), v.literal("weekly")) },
  handler: async (ctx, args) => {
    const alerts = await ctx.runQuery(internal.job_alerts_cron.internalGetAlertsByFrequency, {
      frequency: args.frequency,
    });
    for (const alert of alerts) {
      const user = await ctx.runQuery(internal.job_alerts_cron.internalGetUserById, { userId: alert.userId });
      if (!user?.email) continue;
      const jobs = await ctx.runQuery(internal.job_alerts_cron.internalListJobsForAlert, {
        keywords: alert.keywords ?? undefined,
        category: alert.category ?? undefined,
        location: alert.location ?? undefined,
        employmentType: alert.employmentType ?? undefined,
        salaryMin: alert.salaryMin ?? undefined,
      });
      if (jobs.length === 0) continue;
      const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";
      await ctx.runAction(api.notifications.sendJobAlert, {
        email: user.email,
        jobs: jobs.map((j: any) => ({
          title: j.title,
          companyName: j.companyName,
          url: `${baseUrl}/jobs/${j._id}`,
        })),
      });
      await ctx.runMutation(internal.job_alerts_cron.internalUpdateLastSent, {
        alertId: alert._id,
        lastSent: Date.now(),
      });
    }
  },
});

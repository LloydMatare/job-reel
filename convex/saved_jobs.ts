import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const isJobSaved = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return false;

    const saved = await ctx.db
      .query("saved_jobs")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", user._id).eq("jobId", args.jobId),
      )
      .unique();

    return saved !== null;
  },
});

export const saveJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      const id = await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        name: identity.name ?? identity.email ?? "",
        email: identity.email ?? identity.tokenIdentifier,
        avatarUrl: identity.pictureUrl ?? undefined,
        role: "seeker",
        onboarded: false,
      });
      return ctx.db.insert("saved_jobs", {
        userId: id,
        jobId: args.jobId,
      });
    }

    const existing = await ctx.db
      .query("saved_jobs")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", user._id).eq("jobId", args.jobId),
      )
      .unique();

    if (existing) return;

    await ctx.db.insert("saved_jobs", {
      userId: user._id,
      jobId: args.jobId,
    });
  },
});

export const unsaveJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return;

    const saved = await ctx.db
      .query("saved_jobs")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", user._id).eq("jobId", args.jobId),
      )
      .unique();

    if (saved) {
      await ctx.db.delete("saved_jobs", saved._id);
    }
  },
});

export const getSavedJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    const saved = await ctx.db
      .query("saved_jobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    const jobs = await Promise.all(
      saved.map(async (s) => {
        const job = await ctx.db.get("jobs", s.jobId);
        if (!job) return null;
        const company = await ctx.db.get("companies", job.companyId);
        return { ...job, company, savedAt: s._creationTime };
      }),
    );

    return jobs.filter(Boolean);
  },
});

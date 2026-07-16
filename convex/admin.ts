import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ensureUser } from "./users";

export async function checkAdmin(ctx: any, tokenIdentifier: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q: any) =>
      q.eq("tokenIdentifier", tokenIdentifier),
    )
    .unique();
  if (!user || user.role !== "admin") throw new Error("Not authorized");
  return user;
}

export const getAllUsers = query({
  args: { paginationOpts: v.any() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);
    return ctx.db.query("users").order("desc").paginate(args.paginationOpts);
  },
});

export const getAllCompanies = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);
    const companies = await ctx.db.query("companies").collect();
    return Promise.all(
      companies.map(async (c) => {
        const owner = await ctx.db.get(c.ownerId);
        const jobs = await ctx.db
          .query("jobs")
          .withIndex("by_company", (q: any) => q.eq("companyId", c._id))
          .collect();
        const jobCount = jobs.length;
        const activeJobs = jobs.filter((j) => j.status === "active").length;
        return {
          ...c,
          ownerName: owner?.name ?? "Unknown",
          jobCount,
          activeJobs,
        };
      }),
    );
  },
});

export const getAllJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);

    const companies = await ctx.db.query("companies").collect();
    const companyMap = new Map(companies.map((c) => [c._id, c.name]));

    const jobs = await ctx.db.query("jobs").order("desc").take(500);
    return jobs.map((j) => ({
      ...j,
      companyName: companyMap.get(j.companyId) ?? "Unknown",
    }));
  },
});

export const getSiteStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);
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
      seekers: users.filter((u) => u.role === "seeker").length,
      employers: users.filter((u) => u.role === "employer").length,
      activeJobs: jobs.filter((j) => j.status === "active").length,
    };
  },
});

export const deleteJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q: any) => q.eq("jobId", args.jobId))
      .collect();
    for (const a of applications) {
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(args.jobId);
  },
});

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);
    await ctx.db.delete(args.userId);
  },
});

export const makeAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await checkAdmin(ctx, identity.tokenIdentifier);
    await ctx.db.patch(args.userId, { role: "admin" });
  },
});

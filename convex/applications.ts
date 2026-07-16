import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireRecruiterOrAbove } from "./permissions";

function getOrgId(
  identity: Record<string, unknown>,
): string | undefined {
  const id = identity.orgId;
  return typeof id === "string" ? id : undefined;
}

export const applyToJob = mutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
    resumeStorageId: v.optional(v.id("_storage")),
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

    const job = await ctx.db.get("jobs", args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== "active")
      throw new Error("This job is no longer accepting applications");

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", user._id).eq("jobId", args.jobId),
      )
      .unique();

    if (existing) throw new Error("You have already applied to this job");

    await ctx.db.insert("applications", {
      jobId: args.jobId,
      userId: user._id,
      resumeStorageId: args.resumeStorageId,
      coverLetter: args.coverLetter,
      status: "pending",
    });

    await ctx.db.patch(args.jobId, {
      applicationCount: (job.applicationCount ?? 0) + 1,
    });

    const company = await ctx.db.get("companies", job.companyId);
    let employerEmail: string | undefined;
    if (company) {
      const owner = await ctx.db.get("users", company.ownerId);
      if (owner?.email) employerEmail = owner.email;
    }
    return { employerEmail, jobTitle: job.title };
  },
});

export const withdrawApplication = mutation({
  args: { applicationId: v.id("applications") },
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

    const app = await ctx.db.get("applications", args.applicationId);
    if (!app) throw new Error("Application not found");
    if (app.userId !== user._id) throw new Error("Not authorized");
    if (app.status !== "pending" && app.status !== "reviewing")
      throw new Error("Can only withdraw pending or reviewing applications");

    const job = await ctx.db.get("jobs", app.jobId);

    await ctx.db.delete("applications", args.applicationId);

    if (job) {
      await ctx.db.patch(app.jobId, {
        applicationCount: Math.max(0, (job.applicationCount ?? 1) - 1),
      });
    }
  },
});

export const getJobApplications = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) throw new Error("No organization selected");

    const job = await ctx.db.get("jobs", args.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get("companies", job.companyId);
    if (!company || company.clerkOrgId !== orgId)
      throw new Error("Not authorized");

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .order("desc")
      .take(100);

    return await Promise.all(
      applications.map(async (app) => {
        const applicant = await ctx.db.get("users", app.userId);
        return { ...app, applicant };
      }),
    );
  },
});

export const getApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const app = await ctx.db.get("applications", args.applicationId);
    if (!app) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return null;

    const job = await ctx.db.get("jobs", app.jobId);
    if (!job) return null;

    const company = await ctx.db.get("companies", job.companyId);

    const isOwner = user._id === app.userId;
    const isEmployer =
      company && (await ctx.auth.getUserIdentity()) &&
      getOrgId(identity as Record<string, unknown>) === company.clerkOrgId;

    if (!isOwner && !isEmployer) throw new Error("Not authorized");

    const applicant = await ctx.db.get("users", app.userId);

    return {
      ...app,
      applicant,
      job: { ...job, company },
    };
  },
});

export const getApplicationStats = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) throw new Error("No organization selected");

    const job = await ctx.db.get("jobs", args.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get("companies", job.companyId);
    if (!company || company.clerkOrgId !== orgId)
      throw new Error("Not authorized");

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    const stats: Record<string, number> = {
      total: applications.length,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };

    for (const app of applications) {
      stats[app.status] = (stats[app.status] ?? 0) + 1;
    }

    return stats;
  },
});

export const getMyApplications = query({
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

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    return await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get("jobs", app.jobId);
        if (!job) return null;
        const company = await ctx.db.get("companies", job.companyId);
        return { ...app, job: { ...job, company } };
      }),
    ).then((results) => results.filter(Boolean));
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("shortlisted"),
      v.literal("rejected"),
      v.literal("hired"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) throw new Error("No organization selected");

    const app = await ctx.db.get("applications", args.applicationId);
    if (!app) throw new Error("Application not found");

    const job = await ctx.db.get("jobs", app.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get("companies", job.companyId);
    if (!company || company.clerkOrgId !== orgId)
      throw new Error("Not authorized");

    await requireRecruiterOrAbove(ctx, company._id);

    await ctx.db.patch(args.applicationId, { status: args.status });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addEmployerNotes = mutation({
  args: {
    applicationId: v.id("applications"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) throw new Error("No organization selected");

    const app = await ctx.db.get("applications", args.applicationId);
    if (!app) throw new Error("Application not found");

    const job = await ctx.db.get("jobs", app.jobId);
    if (!job) throw new Error("Job not found");

    const company = await ctx.db.get("companies", job.companyId);
    if (!company || company.clerkOrgId !== orgId)
      throw new Error("Not authorized");

    await ctx.db.patch(args.applicationId, { employerNotes: args.notes });
  },
});

export const getCompanyAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) return null;

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();
    if (!company) return null;

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();

    const statusBreakdown: Record<string, number> = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };

    const dailyCounts: Record<string, number> = {};
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    for (const job of jobs) {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_job", (q) => q.eq("jobId", job._id))
        .collect();

      for (const app of apps) {
        const status = app.status as keyof typeof statusBreakdown;
        if (status in statusBreakdown) statusBreakdown[status]++;

        if (app._creationTime >= thirtyDaysAgo) {
          const day = new Date(app._creationTime).toISOString().slice(0, 10);
          dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
        }
      }
    }

    const timeSeries = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      statusBreakdown,
      timeSeries,
      totalApplications: Object.values(statusBreakdown).reduce((a, b) => a + b, 0),
    };
  },
});

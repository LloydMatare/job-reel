import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireRecruiterOrAbove } from "./permissions";

function getOrgId(
  identity: Record<string, unknown>,
): string | undefined {
  const id = identity.orgId;
  return typeof id === "string" ? id : undefined;
}

export const listJobs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    employmentType: v.optional(
      v.union(
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("temporary"),
        v.literal("internship"),
      ),
    ),
    locationType: v.optional(
      v.union(v.literal("on-site"), v.literal("remote"), v.literal("hybrid")),
    ),
    category: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    location: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "active"));

    if (args.category) {
      queryBuilder = ctx.db
        .query("jobs")
        .withIndex("by_category_and_status", (q) =>
          q.eq("category", args.category!).eq("status", "active"),
        );
    }

    let results = await queryBuilder.order("desc").paginate(args.paginationOpts);

    if (args.employmentType) {
      results.page = results.page.filter(
        (j) => j.employmentType === args.employmentType,
      );
    }

    if (args.locationType) {
      results.page = results.page.filter(
        (j) => j.locationType === args.locationType,
      );
    }

    if (args.salaryMin !== undefined) {
      results.page = results.page.filter(
        (j) => (j.salaryMax ?? Infinity) >= args.salaryMin!,
      );
    }

    if (args.salaryMax !== undefined) {
      results.page = results.page.filter(
        (j) => (j.salaryMin ?? 0) <= args.salaryMax!,
      );
    }

    return results;
  },
});

export const searchJobs = query({
  args: {
    query: v.string(),
    paginationOpts: paginationOptsValidator,
    employmentType: v.optional(
      v.union(
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("temporary"),
        v.literal("internship"),
      ),
    ),
    locationType: v.optional(
      v.union(v.literal("on-site"), v.literal("remote"), v.literal("hybrid")),
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("status", "active"),
      )
      .paginate(args.paginationOpts);
  },
});

export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get("jobs", args.jobId);
    if (!job) return null;

    const company = await ctx.db.get("companies", job.companyId);
    return { ...job, company };
  },
});

export const getFeaturedJobs = query({
  args: {},
  handler: async (ctx) => {
    const featured = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(50);

    const sorted = featured.sort(
      (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b._creationTime - a._creationTime,
    );

    const withCompanies = await Promise.all(
      sorted.slice(0, 6).map(async (job) => {
        const company = await ctx.db.get("companies", job.companyId);
        return { ...job, company };
      }),
    );

    return withCompanies;
  },
});

export const getJobsByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company_and_status", (q) =>
        q.eq("companyId", args.companyId).eq("status", "active"),
      )
      .order("desc")
      .take(50);
  },
});

export const createJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    requirements: v.optional(v.string()),
    responsibilities: v.optional(v.string()),
    location: v.string(),
    locationType: v.union(
      v.literal("on-site"),
      v.literal("remote"),
      v.literal("hybrid"),
    ),
    employmentType: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("temporary"),
      v.literal("internship"),
    ),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    category: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    status: v.union(v.literal("active"), v.literal("draft")),
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

    await requireRecruiterOrAbove(ctx, company._id);

    const jobId = await ctx.db.insert("jobs", {
      companyId: company._id,
      title: args.title,
      description: args.description,
      requirements: args.requirements,
      responsibilities: args.responsibilities,
      location: args.location,
      locationType: args.locationType,
      employmentType: args.employmentType,
      salaryMin: args.salaryMin,
      salaryMax: args.salaryMax,
      salaryCurrency: args.salaryCurrency,
      category: args.category,
      skills: args.skills,
      status: args.status,
      applicationCount: 0,
    });

    const owner = await ctx.db.get("users", company.ownerId);
    const employerEmail = owner?.email;
    return { jobId, employerEmail, jobTitle: args.title };
  },
});

export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requirements: v.optional(v.string()),
    responsibilities: v.optional(v.string()),
    location: v.optional(v.string()),
    locationType: v.optional(
      v.union(
        v.literal("on-site"),
        v.literal("remote"),
        v.literal("hybrid"),
      ),
    ),
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
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    category: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("active"), v.literal("closed"), v.literal("draft")),
    ),
  },
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

    await requireRecruiterOrAbove(ctx, company._id);

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.requirements !== undefined)
      patch.requirements = args.requirements;
    if (args.responsibilities !== undefined)
      patch.responsibilities = args.responsibilities;
    if (args.location !== undefined) patch.location = args.location;
    if (args.locationType !== undefined) patch.locationType = args.locationType;
    if (args.employmentType !== undefined)
      patch.employmentType = args.employmentType;
    if (args.salaryMin !== undefined) patch.salaryMin = args.salaryMin;
    if (args.salaryMax !== undefined) patch.salaryMax = args.salaryMax;
    if (args.salaryCurrency !== undefined)
      patch.salaryCurrency = args.salaryCurrency;
    if (args.category !== undefined) patch.category = args.category;
    if (args.skills !== undefined) patch.skills = args.skills;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.jobId, patch);
    return args.jobId;
  },
});

export const closeJob = mutation({
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

    await requireRecruiterOrAbove(ctx, company._id);

    await ctx.db.patch(args.jobId, { status: "closed" });
  },
});

export const reopenJob = mutation({
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

    await requireRecruiterOrAbove(ctx, company._id);

    await ctx.db.patch(args.jobId, { status: "active" });
  },
});

export const deleteJob = mutation({
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

    await requireRecruiterOrAbove(ctx, company._id);

    if (job.status !== "draft") {
      await ctx.db.patch(args.jobId, { status: "closed" });
    } else {
      await ctx.db.delete("jobs", args.jobId);
    }
  },
});

export const getEmployerJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const orgId = getOrgId(identity as Record<string, unknown>);
    if (!orgId) return [];

    const company = await ctx.db
      .query("companies")
      .withIndex("by_clerk_org", (q) => q.eq("clerkOrgId", orgId))
      .unique();

    if (!company) return [];

    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .order("desc")
      .take(100);
  },
});

export const getRecommendedJobs = query({
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
    if (!user || user.role !== "seeker") return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    const saved = await ctx.db
      .query("saved_jobs")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const jobIds = [
      ...new Set([
        ...applications.map((a) => a.jobId),
        ...saved.map((s) => s.jobId),
      ]),
    ];
    if (jobIds.length === 0) return [];

    const userJobs = (await Promise.all(jobIds.map((id) => ctx.db.get(id)))).filter(Boolean) as any[];
    const categories = [...new Set(userJobs.filter((j: any) => j.category).map((j: any) => j.category))];
    if (categories.length === 0) return [];

    const recommended = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .order("desc")
      .take(50);

    const filtered = recommended
      .filter((j: any) => j.category && categories.includes(j.category))
      .slice(0, 6);

    const withCompanies = await Promise.all(
      filtered.map(async (job: any) => {
        const company = await ctx.db.get("companies", job.companyId);
        return { ...job, company };
      }),
    );

    return withCompanies;
  },
});

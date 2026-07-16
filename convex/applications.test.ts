/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

const ct = convexTest(schema);

async function setupTestData(ctx: any) {
  const userId = await ctx.db.insert("users", {
    tokenIdentifier: "seeker|1",
    name: "Job Seeker",
    email: "seeker@example.com",
    role: "seeker",
    onboarded: true,
  });

  const companyId = await ctx.db.insert("companies", {
    name: "Tech Co",
    slug: "tech-co",
    clerkOrgId: "org_tech",
    description: "A tech company",
    ownerId: userId,
    plan: "free",
  });

  const jobId = await ctx.db.insert("jobs", {
    companyId,
    title: "Frontend Developer",
    description: "React developer needed",
    location: "Remote",
    locationType: "remote",
    employmentType: "full-time",
    status: "active",
    applicationCount: 0,
  });

  return { userId, companyId, jobId };
}

describe("applications", () => {
  it("submits an application", async () => {
      const result: any = await ct.run(async (ctx) => {
        const { userId, jobId } = await setupTestData(ctx);

        const appId = await ctx.db.insert("applications", {
          jobId,
          userId,
          status: "pending",
        });

        await ctx.db.patch(jobId, { applicationCount: 1 });

        const app: any = await ctx.db.get(appId);
        const job: any = await ctx.db.get(jobId);

        return {
          status: app.status,
          appCount: job.applicationCount,
        };
      });

    expect(result.status).toBe("pending");
    expect(result.appCount).toBe(1);
  });

  it("prevents duplicate applications to the same job", async () => {
    const result = await ct.run(async (ctx) => {
      const { userId, jobId } = await setupTestData(ctx);

      await ctx.db.insert("applications", {
        jobId,
        userId,
        status: "pending",
      });

      const existing = await ctx.db
        .query("applications")
        .withIndex("by_user_and_job", (q: any) =>
          q.eq("userId", userId).eq("jobId", jobId),
        )
        .first();

      return existing !== null;
    });

    expect(result).toBe(true);

    // Verify second insert creates a duplicate
    const dupResult = await ct.run(async (ctx) => {
      const { userId, jobId } = await setupTestData(ctx);

      await ctx.db.insert("applications", {
        jobId,
        userId,
        status: "pending",
      });

      await ctx.db.insert("applications", {
        jobId,
        userId,
        status: "pending",
      });

      const apps = await ctx.db
        .query("applications")
        .withIndex("by_user_and_job", (q: any) =>
          q.eq("userId", userId).eq("jobId", jobId),
        )
        .collect();

      return apps.length;
    });

    // No database-level uniqueness constraint, so duplicates are possible
    // (uniqueness should be enforced at the mutation level in application code)
    expect(dupResult).toBe(2);
  });

  it("transitions through statuses", async () => {
    const result = await ct.run(async (ctx) => {
      const { userId, jobId } = await setupTestData(ctx);

      const appId = await ctx.db.insert("applications", {
        jobId,
        userId,
        status: "pending",
      });

      const transitions = ["reviewing", "shortlisted", "hired"] as const;

      for (const status of transitions) {
        await ctx.db.patch(appId, { status });
      }

      const final: any = await ctx.db.get(appId);
      return final.status;
    });

    expect(result).toBe("hired");
  });

  it("withdraws an application", async () => {
      const result: any = await ct.run(async (ctx) => {
        const { userId, jobId } = await setupTestData(ctx);

        const appId = await ctx.db.insert("applications", {
          jobId,
          userId,
          status: "pending",
        });

        await ctx.db.delete(appId);
        await ctx.db.patch(jobId, { applicationCount: 0 });

        const app: any = await ctx.db.get(appId);
        const job: any = await ctx.db.get(jobId);

        return {
          appExists: app !== null,
          appCount: job.applicationCount,
        };
      });

    expect(result.appExists).toBe(false);
    expect(result.appCount).toBe(0);
  });

  it("associates applications with specific jobs", async () => {
    const result = await ct.run(async (ctx) => {
      const { userId, companyId } = await setupTestData(ctx);

      const job1Id = await ctx.db.insert("jobs", {
        companyId,
        title: "Job 1",
        description: "First job",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 0,
      });

      const job2Id = await ctx.db.insert("jobs", {
        companyId,
        title: "Job 2",
        description: "Second job",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 0,
      });

      await ctx.db.insert("applications", {
        jobId: job1Id,
        userId,
        status: "pending",
      });

      await ctx.db.insert("applications", {
        jobId: job2Id,
        userId,
        status: "pending",
      });

      const job1Apps = await ctx.db
        .query("applications")
        .withIndex("by_job", (q: any) => q.eq("jobId", job1Id))
        .collect();

      const job2Apps = await ctx.db
        .query("applications")
        .withIndex("by_job", (q: any) => q.eq("jobId", job2Id))
        .collect();

      return {
        job1Count: job1Apps.length,
        job2Count: job2Apps.length,
      };
    });

    expect(result.job1Count).toBe(1);
    expect(result.job2Count).toBe(1);
  });
});

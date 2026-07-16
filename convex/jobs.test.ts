/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

const ct = convexTest(schema);

async function setupTestData(ctx: any) {
  const companyId = await ctx.db.insert("companies", {
    name: "Test Corp",
    slug: "test-corp",
    clerkOrgId: "org_test",
    description: "A test company",
    ownerId: "" as any,
    plan: "free",
  });

  const jobId = await ctx.db.insert("jobs", {
    companyId,
    title: "Software Engineer",
    description: "Build awesome things",
    location: "San Francisco, CA",
    locationType: "hybrid",
    employmentType: "full-time",
    status: "active",
    applicationCount: 0,
    salaryMin: 100000,
    salaryMax: 150000,
    salaryCurrency: "$",
    category: "engineering",
    skills: ["TypeScript", "React", "Node.js"],
  });

  return { companyId, jobId };
}

describe("jobs", () => {
  it("creates a job listing", async () => {
      const result = await ct.run(async (ctx) => {
        const { jobId } = await setupTestData(ctx);
        const job: any = await ctx.db.get(jobId);
        return job;
      });

      expect(result).not.toBeNull();
      expect(result.title).toBe("Software Engineer");
      expect(result.status).toBe("active");
      expect(result.applicationCount).toBe(0);
    });

    it("updates job details", async () => {
      const result: any = await ct.run(async (ctx) => {
        const { jobId } = await setupTestData(ctx);

        await ctx.db.patch(jobId, {
          title: "Senior Software Engineer",
          salaryMax: 200000,
          status: "closed",
        });

        return await ctx.db.get(jobId);
      });

      expect(result.title).toBe("Senior Software Engineer");
      expect(result.salaryMax).toBe(200000);
      expect(result.status).toBe("closed");
    });

    it("reopens a closed job", async () => {
      const result: any = await ct.run(async (ctx) => {
        const { jobId } = await setupTestData(ctx);

        await ctx.db.patch(jobId, { status: "closed" });
        await ctx.db.patch(jobId, { status: "active" });

        return await ctx.db.get(jobId);
      });

      expect(result.status).toBe("active");
    });

    it("filters jobs by status", async () => {
      const result = await ct.run(async (ctx) => {
      const { companyId } = await setupTestData(ctx);

      await ctx.db.insert("jobs", {
        companyId,
        title: "Intern",
        description: "Intern role",
        location: "Remote",
        locationType: "remote",
        employmentType: "internship",
        status: "active",
        applicationCount: 0,
      });

      await ctx.db.insert("jobs", {
        companyId,
        title: "Closed Role",
        description: "Old role",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "closed",
        applicationCount: 0,
      });

      const activeJobs = await ctx.db
        .query("jobs")
        .withIndex("by_status", (q: any) => q.eq("status", "active"))
        .collect();

      return activeJobs.map((j: any) => j.title);
    });

    expect(result).toContain("Software Engineer");
    expect(result).toContain("Intern");
    expect(result).not.toContain("Closed Role");
  });

  it("tracks application count", async () => {
      const result: any = await ct.run(async (ctx) => {
        const { jobId } = await setupTestData(ctx);

        await ctx.db.patch(jobId, { applicationCount: 1 });
        await ctx.db.patch(jobId, { applicationCount: 2 });

        return await ctx.db.get(jobId);
      });

      expect(result.applicationCount).toBe(2);
  });
});

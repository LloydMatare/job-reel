/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

const ct = convexTest(schema);

describe("saved_jobs", () => {
  it("saves a job for a user", async () => {
    const result = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "saved|1",
        name: "Saver",
        email: "saver@example.com",
        role: "seeker",
        onboarded: true,
      });

      const companyId = await ctx.db.insert("companies", {
        name: "Co",
        slug: "co",
        clerkOrgId: "org_co",
        description: "A company",
        ownerId: userId,
        plan: "free",
      });

      const jobId = await ctx.db.insert("jobs", {
        companyId,
        title: "Engineer",
        description: "Engineering role",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 0,
      });

      const savedId = await ctx.db.insert("saved_jobs", { userId, jobId });
      return await ctx.db.get(savedId);
    });

    expect(result).not.toBeNull();
    expect(result!.userId).toBeDefined();
    expect(result!.jobId).toBeDefined();
  });

  it("retrieves saved jobs for a user", async () => {
    const result = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "saved|2",
        name: "Saver Two",
        email: "saver2@example.com",
        role: "seeker",
        onboarded: true,
      });

      const companyId = await ctx.db.insert("companies", {
        name: "Co",
        slug: "co2",
        clerkOrgId: "org_co2",
        description: "A company",
        ownerId: userId,
        plan: "free",
      });

      const job1Id = await ctx.db.insert("jobs", {
        companyId,
        title: "Job 1",
        description: "Role 1",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 0,
      });

      const job2Id = await ctx.db.insert("jobs", {
        companyId,
        title: "Job 2",
        description: "Role 2",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 0,
      });

      await ctx.db.insert("saved_jobs", { userId, jobId: job1Id });
      await ctx.db.insert("saved_jobs", { userId, jobId: job2Id });

      const savedJobs = await ctx.db
        .query("saved_jobs")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();

      return savedJobs.length;
    });

    expect(result).toBe(2);
  });

  it("unsaves a job", async () => {
    const result = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "saved|3",
        name: "Unsavable",
        email: "unsave@example.com",
        role: "seeker",
        onboarded: true,
      });

      const companyId = await ctx.db.insert("companies", {
        name: "Co",
        slug: "co3",
        clerkOrgId: "org_co3",
        description: "A company",
        ownerId: userId,
        plan: "free",
      });

      const jobId = await ctx.db.insert("jobs", {
        companyId,
        title: "Temp Role",
        description: "To be unsaved",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 0,
      });

      const savedId = await ctx.db.insert("saved_jobs", { userId, jobId });

      // Verify it exists
      const before = await ctx.db.get(savedId);
      expect(before).not.toBeNull();

      // Delete it
      await ctx.db.delete(savedId);

      // Verify it's gone
      const after = await ctx.db.get(savedId);
      const allSaved = await ctx.db
        .query("saved_jobs")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();

      return {
        existsBefore: before !== null,
        existsAfter: after === null,
        remainingCount: allSaved.length,
      };
    });

    expect(result.existsBefore).toBe(true);
    expect(result.existsAfter).toBe(true);
    expect(result.remainingCount).toBe(0);
  });
});

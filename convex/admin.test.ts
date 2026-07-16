/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";

const ct = convexTest(schema);

describe("admin operations", () => {
  it("creates users with different roles", async () => {
    const result = await ct.run(async (ctx) => {
      const adminId = await ctx.db.insert("users", {
        tokenIdentifier: "admin|1",
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
        onboarded: true,
      });

      const seekerId = await ctx.db.insert("users", {
        tokenIdentifier: "seeker|2",
        name: "Seeker",
        email: "seeker@example.com",
        role: "seeker",
        onboarded: true,
      });

      const employerId = await ctx.db.insert("users", {
        tokenIdentifier: "employer|3",
        name: "Employer",
        email: "employer@example.com",
        role: "employer",
        onboarded: true,
      });

      const admin = await ctx.db.get(adminId);
      const seeker = await ctx.db.get(seekerId);
      const employer = await ctx.db.get(employerId);

      return {
        adminRole: admin!.role,
        seekerRole: seeker!.role,
        employerRole: employer!.role,
      };
    });

    expect(result.adminRole).toBe("admin");
    expect(result.seekerRole).toBe("seeker");
    expect(result.employerRole).toBe("employer");
  });

  it("queries all companies", async () => {
    const result = await ct.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: "admin|2",
        name: "Admin User",
        email: "admin2@example.com",
        role: "admin",
        onboarded: true,
      });

      await ctx.db.insert("companies", {
        name: "Company A",
        slug: "company-a",
        clerkOrgId: "org_a",
        description: "First company",
        ownerId: userId,
        plan: "free",
      });

      await ctx.db.insert("companies", {
        name: "Company B",
        slug: "company-b",
        clerkOrgId: "org_b",
        description: "Second company",
        ownerId: userId,
        plan: "pro",
      });

      const companies = await ctx.db.query("companies").collect();
      return companies.map((c: any) => ({ name: c.name, plan: c.plan }));
    });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Company A");
    expect(result[1].plan).toBe("pro");
  });

  it("retrieves site statistics", async () => {
    const result = await ct.run(async (ctx) => {
      const adminId = await ctx.db.insert("users", {
        tokenIdentifier: "admin|3",
        name: "Stats Admin",
        email: "stats@example.com",
        role: "admin",
        onboarded: true,
      });

      // Add users
      await ctx.db.insert("users", {
        tokenIdentifier: "user|1",
        name: "User 1",
        email: "u1@example.com",
        role: "seeker",
        onboarded: true,
      });
      await ctx.db.insert("users", {
        tokenIdentifier: "user|2",
        name: "User 2",
        email: "u2@example.com",
        role: "employer",
        onboarded: true,
      });

      // Add companies
      const companyId = await ctx.db.insert("companies", {
        name: "Stats Co",
        slug: "stats-co",
        clerkOrgId: "org_stats",
        description: "For stats",
        ownerId: adminId,
        plan: "free",
      });

      // Add jobs
      await ctx.db.insert("jobs", {
        companyId,
        title: "Active Job",
        description: "An active job",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "active",
        applicationCount: 5,
      });

      await ctx.db.insert("jobs", {
        companyId,
        title: "Closed Job",
        description: "A closed job",
        location: "Remote",
        locationType: "remote",
        employmentType: "full-time",
        status: "closed",
        applicationCount: 0,
      });

      const users = await ctx.db.query("users").collect();
      const companies = await ctx.db.query("companies").collect();
      const jobs = await ctx.db.query("jobs").collect();

      return {
        totalUsers: users.length,
        totalCompanies: companies.length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j: any) => j.status === "active").length,
        seekers: users.filter((u: any) => u.role === "seeker").length,
        employers: users.filter((u: any) => u.role === "employer").length,
      };
    });

    expect(result.totalUsers).toBe(3); // admin + seeker + employer
    expect(result.totalCompanies).toBe(1);
    expect(result.totalJobs).toBe(2);
    expect(result.activeJobs).toBe(1);
    expect(result.seekers).toBe(1);
    expect(result.employers).toBe(1);
  });
});

import { query } from "./_generated/server";

export const getMarketInsights = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const totalJobs = jobs.length;

    // Salary ranges by category
    const categorySalary: Record<string, { min: number[]; max: number[] }> =
      {};
    const skillCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const locationTypeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const job of jobs) {
      const cat = job.category ?? "other";
      if (!categorySalary[cat]) categorySalary[cat] = { min: [], max: [] };
      if (job.salaryMin != null) categorySalary[cat].min.push(job.salaryMin);
      if (job.salaryMax != null) categorySalary[cat].max.push(job.salaryMax);
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;

      for (const skill of job.skills ?? []) {
        skillCounts[skill] = (skillCounts[skill] ?? 0) + 1;
      }

      const loc = job.location || "Remote";
      locationCounts[loc] = (locationCounts[loc] ?? 0) + 1;

      const empType = job.employmentType;
      typeCounts[empType] = (typeCounts[empType] ?? 0) + 1;

      const locType = job.locationType;
      locationTypeCounts[locType] = (locationTypeCounts[locType] ?? 0) + 1;
    }

    const salaryByCategory = Object.entries(categorySalary)
      .map(([category, vals]) => {
        const avgMin =
          vals.min.length > 0
            ? Math.round(
                vals.min.reduce((a, b) => a + b, 0) / vals.min.length,
              )
            : null;
        const avgMax =
          vals.max.length > 0
            ? Math.round(
                vals.max.reduce((a, b) => a + b, 0) / vals.max.length,
              )
            : null;
        return {
          category,
          avgMin,
          avgMax,
          count: categoryCounts[category] ?? 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const employmentTypeBreakdown = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const locationTypeBreakdown = Object.entries(locationTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const overallAvgMin =
      jobs.filter((j) => j.salaryMin != null).length > 0
        ? Math.round(
            jobs
              .filter((j) => j.salaryMin != null)
              .reduce((s, j) => s + (j.salaryMin ?? 0), 0) /
              jobs.filter((j) => j.salaryMin != null).length,
          )
        : null;

    const overallAvgMax =
      jobs.filter((j) => j.salaryMax != null).length > 0
        ? Math.round(
            jobs
              .filter((j) => j.salaryMax != null)
              .reduce((s, j) => s + (j.salaryMax ?? 0), 0) /
              jobs.filter((j) => j.salaryMax != null).length,
          )
        : null;

    return {
      totalJobs,
      salaryByCategory,
      topSkills,
      topLocations,
      employmentTypeBreakdown,
      locationTypeBreakdown,
      overallAvgMin,
      overallAvgMax,
    };
  },
});

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Briefcase,
  TrendingUp,
  MapPin,
  DollarSign,
  Wifi,
  Building2,
  Clock,
} from "lucide-react";

export default function InsightsPage() {
  const insights = useQuery(api.insights.getMarketInsights);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="size-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Market Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Job Market Insights
          </h1>
          <p className="text-base text-white/60 mt-2 max-w-xl">
            Real-time salary data, in-demand skills, and hiring trends across
            all active job listings.
          </p>
        </div>
      </div>

      {insights ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={Briefcase}
              label="Active Jobs"
              value={insights.totalJobs.toLocaleString()}
              gradient="from-blue-500 to-blue-600"
              bg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={DollarSign}
              label="Avg Salary Range"
              value={
                insights.overallAvgMin != null
                  ? `$${(insights.overallAvgMin / 1000).toFixed(0)}k-$${(insights.overallAvgMax! / 1000).toFixed(0)}k`
                  : "N/A"
              }
              gradient="from-emerald-500 to-emerald-600"
              bg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              icon={Wifi}
              label="Remote Jobs"
              value={
                insights.locationTypeBreakdown.find((t: any) => t.type === "remote")
                  ?.count ?? 0
              }
              gradient="from-violet-500 to-violet-600"
              bg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <StatCard
              icon={Clock}
              label="Top Category"
              value={insights.salaryByCategory[0]?.category ?? "N/A"}
              gradient="from-amber-500 to-amber-600"
              bg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary by Category */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600" />
                <h2 className="font-semibold text-foreground text-sm">
                  Avg Salary by Category
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {insights.salaryByCategory.map((cat: any) => {
                  const maxMin = Math.max(
                    ...insights.salaryByCategory.map(
                      (c: any) => c.avgMin ?? 0,
                    ),
                    1,
                  );
                  const barW = ((cat.avgMin ?? 0) / maxMin) * 100;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground capitalize">
                          {cat.category.replace("_", " ")}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {cat.avgMin != null
                            ? `$${(cat.avgMin / 1000).toFixed(0)}k`
                            : "—"}{" "}
                          –{" "}
                          {cat.avgMax != null
                            ? `$${(cat.avgMax / 1000).toFixed(0)}k`
                            : "—"}
                          <span className="ml-1.5 text-[11px]">
                            ({cat.count})
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <TrendingUp className="size-4 text-blue-600" />
                <h2 className="font-semibold text-foreground text-sm">
                  Most In-Demand Skills
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {insights.topSkills.map((s: any, i: number) => {
                  const maxCount = insights.topSkills[0]?.count ?? 1;
                  const barW = (s.count / maxCount) * 100;
                  return (
                    <div key={s.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-5 text-right tabular-nums">
                            {i + 1}
                          </span>
                          <span className="text-sm text-foreground">
                            {s.skill}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {s.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {insights.topSkills.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No skill data available.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Locations */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <MapPin className="size-4 text-red-500" />
                <h2 className="font-semibold text-foreground text-sm">
                  Top Locations
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {insights.topLocations.map((loc: any) => {
                  const maxLoc = insights.topLocations[0]?.count ?? 1;
                  const barW = (loc.count / maxLoc) * 100;
                  return (
                    <div key={loc.location}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground truncate mr-2">
                          {loc.location}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {loc.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employment Type */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Briefcase className="size-4 text-indigo-600" />
                <h2 className="font-semibold text-foreground text-sm">
                  Employment Type
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {insights.employmentTypeBreakdown.map((e: any) => {
                  const maxEmp = insights.employmentTypeBreakdown[0]?.count ?? 1;
                  const barW = (e.count / maxEmp) * 100;
                  return (
                    <div key={e.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground capitalize">
                          {e.type.replace("-", " ")}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {e.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Type */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Building2 className="size-4 text-cyan-600" />
                <h2 className="font-semibold text-foreground text-sm">
                  Work Model
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {insights.locationTypeBreakdown.map((lt: any) => {
                  const maxLt =
                    insights.locationTypeBreakdown[0]?.count ?? 1;
                  const barW = (lt.count / maxLt) * 100;
                  return (
                    <div key={lt.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground capitalize">
                          {lt.type.replace("-", " ")}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {lt.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  bg,
  iconColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  gradient: string;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`size-10 rounded-xl ${bg} flex items-center justify-center`}
        >
          <Icon className={`size-5 ${iconColor}`} />
        </div>
        <div
          className={`h-1 w-12 rounded-full bg-gradient-to-r ${gradient} opacity-60`}
        />
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight truncate">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

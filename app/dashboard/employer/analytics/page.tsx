"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Briefcase,
  FileText,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  Hourglass,
  UserCheck,
  XCircle,
  CheckCircle,
} from "lucide-react";

export default function EmployerAnalytics() {
  const company = useQuery(api.companies.getMyCompany);

  if (!company) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Application Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insights and metrics for {company.name}.
        </p>
      </div>
      <CompanyAnalytics companyId={company._id as any} />
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof BarChart3; color: string; bar: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-50", bar: "bg-amber-500" },
  reviewing: { label: "Reviewing", icon: Hourglass, color: "text-blue-600 bg-blue-50", bar: "bg-blue-500" },
  shortlisted: { label: "Shortlisted", icon: UserCheck, color: "text-purple-600 bg-purple-50", bar: "bg-purple-500" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-50", bar: "bg-red-500" },
  hired: { label: "Hired", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50", bar: "bg-emerald-500" },
};

function CompanyAnalytics({ companyId }: { companyId: any }) {
  const jobs = useQuery(api.jobs.getJobsByCompany, { companyId });
  const analytics = useQuery(api.applications.getCompanyAnalytics);

  const allJobs = jobs ?? [];
  const activeJobs = allJobs.filter((j: any) => j.status === "active");
  const closedJobs = allJobs.filter((j: any) => j.status === "closed");
  const totalApps = allJobs.reduce(
    (sum: number, j: any) => sum + (j.applicationCount ?? 0),
    0,
  );
  const avgAppsPerJob = allJobs.length
    ? (totalApps / allJobs.length).toFixed(1)
    : "0";

  const statCards = [
    {
      label: "Active Jobs",
      value: activeJobs.length,
      icon: Briefcase,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Applications",
      value: analytics?.totalApplications ?? totalApps,
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Closed Jobs",
      value: closedJobs.length,
      icon: FileText,
      gradient: "from-slate-500 to-slate-600",
      bg: "bg-slate-50",
      iconColor: "text-slate-600",
    },
    {
      label: "Avg Apps / Job",
      value: avgAppsPerJob,
      icon: TrendingUp,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  const breakdown = analytics?.statusBreakdown;
  const maxStatus = breakdown
    ? Math.max(...Object.values(breakdown), 1)
    : 1;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`size-10 rounded-xl ${card.bg} flex items-center justify-center`}
                >
                  <Icon className={`size-5 ${card.iconColor}`} />
                </div>
                <div
                  className={`h-1 w-12 rounded-full bg-gradient-to-r ${card.gradient} opacity-60`}
                />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {card.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {breakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-600" />
              <h2 className="font-semibold text-foreground text-sm">
                Application Status
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = breakdown[key] ?? 0;
                const pct = maxStatus > 0 ? (count / maxStatus) * 100 : 0;
                const Icon = config.icon;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-md ${config.color} flex items-center justify-center`}>
                          <Icon className="size-3.5" />
                        </div>
                        <span className="text-sm text-foreground">{config.label}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications Over Time */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-600" />
              <h2 className="font-semibold text-foreground text-sm">
                Applications (Last 30 Days)
              </h2>
            </div>
            <div className="p-6">
              {analytics.timeSeries && analytics.timeSeries.length > 0 ? (
                <div className="space-y-1">
                  {analytics.timeSeries.map((point: { date: string; count: number }) => {
                    const maxCount = Math.max(...analytics.timeSeries.map((p: { count: number }) => p.count), 1);
                    const barH = (point.count / maxCount) * 160;
                    const dayLabel = new Date(point.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div key={point.date} className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground w-16 shrink-0 text-right">
                          {dayLabel}
                        </span>
                        <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden relative">
                          <div
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm transition-all duration-500"
                            style={{ height: `${barH}px`, maxHeight: "100%" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium tabular-nums w-6 text-right">
                          {point.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No applications in the last 30 days.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {allJobs.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 className="size-4 text-blue-600" />
            <h2 className="font-semibold text-foreground text-sm">
              Jobs Breakdown
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {allJobs.map((j: any, i: number) => {
              const appCount = j.applicationCount ?? 0;
              const maxApps = Math.max(
                ...allJobs.map((j2: any) => j2.applicationCount ?? 0),
                1,
              );
              const barWidth = (appCount / maxApps) * 100;

              return (
                <div
                  key={j._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {j.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                          j.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : j.status === "draft"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {j.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-32 sm:w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium tabular-nums w-8 text-right">
                        {appCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

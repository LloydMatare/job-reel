"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import {
  Briefcase,
  FileText,
  Users,
  Zap,
  ArrowRight,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";

export default function EmployerOverviewPage() {
  const { orgSlug } = useAuth();
  const router = useRouter();
  const currentUser = useQuery(api.users.getMe);
  const company = useQuery(api.companies.getMyCompany);
  const jobs = useQuery(api.jobs.getEmployerJobs);

  if (company === undefined || jobs === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="size-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
          <Building2 className="size-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No Company Set Up
        </h1>
        <p className="text-muted-foreground mb-8 max-w-sm text-center">
          Create your company profile to start posting jobs and receiving applications.
        </p>
        <Link
          href="/company/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          Create Company Profile
        </Link>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "active");
  const draftJobs = jobs.filter((j) => j.status === "draft");
  const closedJobs = jobs.filter((j) => j.status === "closed");
  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicationCount ?? 0),
    0,
  );

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
      label: "Total Applicants",
      value: totalApplicants,
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Drafts",
      value: draftJobs.length,
      icon: FileText,
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Closed",
      value: closedJobs.length,
      icon: XCircle,
      gradient: "from-slate-500 to-slate-600",
      bg: "bg-slate-50",
      iconColor: "text-slate-600",
    },
  ];

  return (
    <div className="space-y-8">
      {currentUser && !currentUser.onboarded && (
        <OnboardingBanner type="employer" />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {company.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your jobs today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            Post a Job
          </Link>
          {orgSlug && (
            <Link
              href={`/orgs/${orgSlug}/dashboard`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hidden sm:flex items-center gap-1"
            >
              Full Dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`size-10 rounded-xl ${card.bg} flex items-center justify-center`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-blue-600" />
              <h2 className="font-semibold text-foreground text-sm">Your Jobs</h2>
            </div>
            <Link
              href="/jobs/new"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Plus className="size-3" />
              New Job
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Briefcase className="size-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                No jobs yet. Post your first job to get started.
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="size-3.5" />
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {jobs.slice(0, 5).map((job) => {
                const isActive = job.status === "active";
                const isDraft = job.status === "draft";
                const statusColor = isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isDraft
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-600 border-slate-200";
                const StatusIcon = isActive ? CheckCircle2 : isDraft ? Clock : XCircle;

                return (
                  <Link
                    key={job._id}
                    href={`/jobs/${job._id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group/item"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground group-hover/item:text-blue-600 transition-colors truncate">
                        {job.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="size-3" />
                          {job.applicationCount ?? 0} applicants
                        </span>
                        {job.location && (
                          <span className="text-xs text-muted-foreground">{job.location}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusColor}`}>
                        <StatusIcon className="size-3" />
                        {job.status}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-all -translate-x-1 group-hover/item:translate-x-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {jobs.length > 5 && (
            <div className="px-6 py-3 border-t border-border bg-muted/30">
              <Link
                href={orgSlug ? `/orgs/${orgSlug}/dashboard` : "#"}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all {jobs.length} jobs
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <h2 className="font-semibold text-foreground text-sm">Quick Stats</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Plan
              </p>
              <p className="text-lg font-bold text-foreground mt-1 capitalize">
                {company.plan}
              </p>
            </div>
            <div className="border-t border-border pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Posting Rate
              </p>
              <p className="text-lg font-bold text-foreground mt-1">
                {activeJobs.length > 0
                  ? `${((activeJobs.length / jobs.length) * 100).toFixed(0)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeJobs.length} of {jobs.length} jobs active
              </p>
            </div>
            <div className="border-t border-border pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Avg Applicants / Job
              </p>
              <p className="text-lg font-bold text-foreground mt-1">
                {jobs.length > 0
                  ? (totalApplicants / jobs.length).toFixed(1)
                  : "0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Building2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

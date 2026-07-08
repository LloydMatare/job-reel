"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowUpRight,
  ExternalLink,
  Trash2,
  RotateCcw,
  Lock,
  Edit,
} from "lucide-react";

export default function OrgDashboardPage() {
  const params = useParams();
  const { organization } = useOrganization();
  const company = useQuery(api.companies.getMyCompany);
  const jobs = useQuery(api.jobs.getEmployerJobs);
  const closeJob = useMutation(api.jobs.closeJob);
  const reopenJob = useMutation(api.jobs.reopenJob);
  const deleteJob = useMutation(api.jobs.deleteJob);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (company === undefined || jobs === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
          You need to create a company profile before posting jobs.
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
  const memberCount = organization?.membersCount ?? 0;
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
      label: "Team Members",
      value: memberCount,
      icon: Users,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      label: "Drafts",
      value: draftJobs.length,
      icon: FileText,
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your job listings and team.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          Post a Job
        </Link>
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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-blue-600" />
            <h2 className="font-semibold text-foreground text-sm">
              Job Listings
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="size-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              No job listings yet.
            </p>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="size-3.5" />
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {jobs.map((job) => {
              const isActive = job.status === "active";
              const isDraft = job.status === "draft";
              const isClosed = job.status === "closed";
              const StatusIcon = isActive
                ? CheckCircle2
                : isDraft
                  ? Clock
                  : XCircle;
              const statusColor = isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isDraft
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-50 text-slate-600 border-slate-200";

              return (
                <div
                  key={job._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors gap-3 animate-slide-up"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="text-sm font-medium text-foreground hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                    >
                      {job.title}
                      <ExternalLink className="size-3 text-muted-foreground/50" />
                    </Link>
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="size-3" />
                        {job.applicationCount ?? 0} applicants
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(job._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusColor}`}
                    >
                      <StatusIcon className="size-3" />
                      {job.status}
                    </span>

                    <Link
                      href={`/jobs/${job._id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="size-3" />
                      Edit
                    </Link>

                    {isActive && (
                      <button
                        onClick={() =>
                          closeJob({ jobId: job._id })
                        }
                        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded-md hover:bg-amber-50 transition-colors"
                      >
                        <Lock className="size-3" />
                        Close
                      </button>
                    )}
                    {isClosed && (
                      <button
                        onClick={() =>
                          reopenJob({ jobId: job._id })
                        }
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        <RotateCcw className="size-3" />
                        Reopen
                      </button>
                    )}
                    {confirmDelete === job._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteJob({ jobId: job._id });
                            setConfirmDelete(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(job._id)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

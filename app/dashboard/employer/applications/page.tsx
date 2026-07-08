"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplicationCard } from "@/components/ApplicationCard";
import {
  FileText,
  Filter,
  ChevronDown,
  Briefcase,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const STATUS_FILTERS = [
  "all",
  "pending",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
] as const;

export default function EmployerApplicationsPage() {
  const { orgSlug } = useAuth();
  const router = useRouter();
  const jobs = useQuery(api.jobs.getEmployerJobs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("all");

  const applications = useQuery(
    api.applications.getJobApplications,
    selectedJobId ? { jobId: selectedJobId as any } : "skip",
  );

  useEffect(() => {
    if (!selectedJobId && jobs && jobs.length > 0) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  if (jobs === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">
          No Applications Yet
        </h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-sm text-center">
          Create a job posting to start receiving applications from candidates.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/jobs/new")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-all hover:shadow-lg"
          >
            <Briefcase className="size-4" />
            Post a Job
          </button>
        </div>
      </div>
    );
  }

  const filtered =
    applications?.filter(
      (app) => statusFilter === "all" || app.status === statusFilter,
    ) ?? [];

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage applications for your job listings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={selectedJobId ?? ""}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring min-w-[220px] cursor-pointer"
          >
            <option value="" disabled>
              Select a job
            </option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.applicationCount ?? 0})
              </option>
            ))}
          </select>
          <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} application{filtered.length !== 1 ? "s" : ""}
          {statusFilter !== "all" && ` (${statusFilter})`}
        </span>
      </div>

      {selectedJob && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-sm">
          <Briefcase className="size-4 text-blue-600" />
          <span className="text-foreground font-medium">{selectedJob.title}</span>
          <span className="text-muted-foreground"> — </span>
          <span className="text-muted-foreground">
            {selectedJob.applicationCount ?? 0} total applicants
          </span>
        </div>
      )}

      {applications === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-xl">
          <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Filter className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            No applications match the current filter.
          </p>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((app, i) => (
            <div key={app._id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <ApplicationCard
                applicationId={app._id}
                applicantName={app.applicant?.name ?? "Unknown"}
                applicantEmail={app.applicant?.email ?? ""}
                status={app.status}
                createdAt={app._creationTime}
                coverLetter={app.coverLetter}
                avatarUrl={app.applicant?.avatarUrl}
                onClick={() =>
                  router.push(`/dashboard/employer/applications/${app._id}`)
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

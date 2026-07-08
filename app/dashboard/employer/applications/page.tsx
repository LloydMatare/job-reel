"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplicationCard } from "@/components/ApplicationCard";

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

  if (jobs === undefined) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="mb-2">No jobs yet.</p>
        <button
          onClick={() => router.push(orgSlug ? `/orgs/${orgSlug}/dashboard` : "/jobs/new")}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Create a job posting
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  const filtered =
    applications?.filter(
      (app) => statusFilter === "all" || app.status === statusFilter,
    ) ?? [];

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applications</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={selectedJobId ?? ""}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} ({job.applicationCount ?? 0})
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {applications === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500">No applications match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard
              key={app._id}
              applicationId={app._id}
              applicantName={app.applicant?.name ?? "Unknown"}
              applicantEmail={app.applicant?.email ?? ""}
              status={app.status}
              createdAt={app._creationTime}
              coverLetter={app.coverLetter}
              avatarUrl={app.applicant?.avatarUrl}
              onClick={() =>
                router.push(
                  `/dashboard/employer/applications/${app._id}`,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

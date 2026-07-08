"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployerOverviewPage() {
  const { orgSlug } = useAuth();
  const router = useRouter();
  const company = useQuery(api.companies.getMyCompany);
  const jobs = useQuery(api.jobs.getEmployerJobs);

  if (company === undefined || jobs === undefined) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Company Set Up
        </h1>
        <p className="text-gray-600 mb-6">
          Create your company profile to start posting jobs.
        </p>
        <Link
          href="/company/new"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium inline-block"
        >
          Create Company Profile
        </Link>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "active");
  const draftJobs = jobs.filter((j) => j.status === "draft");
  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicationCount ?? 0),
    0,
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {company.name}
        </h1>
        {orgSlug && (
          <Link
            href={`/orgs/${orgSlug}/dashboard`}
            className="text-sm text-blue-600 hover:underline"
          >
            Full Dashboard &rarr;
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Active Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{activeJobs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Drafts</p>
          <p className="text-3xl font-bold text-gray-900">{draftJobs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Total Applicants</p>
          <p className="text-3xl font-bold text-gray-900">{totalApplicants}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Plan</p>
          <p className="text-3xl font-bold text-gray-900 capitalize">
            {company.plan}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Your Jobs</h2>
          <Link
            href="/jobs/new"
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Post a Job
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No jobs yet.</p>
            <Link
              href="/jobs/new"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between px-5 py-3"
              >
                <Link
                  href={`/jobs/${job._id}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {job.title}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {job.applicationCount ?? 0} applicants
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : job.status === "draft"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {jobs.length > 5 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <Link
              href={orgSlug ? `/orgs/${orgSlug}/dashboard` : "#"}
              className="text-sm text-blue-600 hover:underline"
            >
              View all {jobs.length} jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

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
      <div className="space-y-6 animate-pulse">
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
          You need to create a company profile before posting jobs.
        </p>
        <Link
          href="/company/new"
          className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
        >
          Create Company Profile
        </Link>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === "active");
  const memberCount = organization?.membersCount ?? 0;
  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicationCount ?? 0),
    0,
  );

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      closed: "bg-red-100 text-red-700",
      draft: "bg-gray-100 text-gray-600",
    };
    return styles[status] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/jobs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Active Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{activeJobs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Total Applicants</p>
          <p className="text-3xl font-bold text-gray-900">{totalApplicants}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Team Members</p>
          <p className="text-3xl font-bold text-gray-900">{memberCount}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Job Listings
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No job listings yet.</p>
            <Link
              href="/jobs/new"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Applicants</th>
                  <th className="text-left px-5 py-3 font-medium">Posted</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/jobs/${job._id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/orgs/${params.slug}/jobs/${job._id}/applications`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        {job.applicationCount ?? 0}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(job._creationTime).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/jobs/${job._id}/edit`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        {job.status === "active" && (
                          <button
                            onClick={() =>
                              closeJob({ jobId: job._id })
                            }
                            className="text-orange-600 hover:text-orange-800 text-xs font-medium"
                          >
                            Close
                          </button>
                        )}
                        {job.status === "closed" && (
                          <button
                            onClick={() =>
                              reopenJob({ jobId: job._id })
                            }
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
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
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(job._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

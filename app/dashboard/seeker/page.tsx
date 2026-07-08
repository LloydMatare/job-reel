"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SeekerOverviewPage() {
  const router = useRouter();
  const applications = useQuery(api.applications.getMyApplications);
  const savedJobs = useQuery(api.saved_jobs.getSavedJobs);
  const currentUser = useQuery(api.users.getMe);

  const appCount = applications?.length ?? 0;
  const savedCount = savedJobs?.length ?? 0;
  const activeApps =
    applications?.filter(
      (a: any) => a.status === "pending" || a.status === "reviewing",
    ).length ?? 0;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Applications</p>
          <p className="text-3xl font-bold text-gray-900">{appCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-3xl font-bold text-gray-900">{activeApps}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Saved Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{savedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">
            Recent Applications
          </h2>
          {applications && applications.length > 0 ? (
            <div className="space-y-2">
              {applications.slice(0, 5).map((app: any) => (
                <button
                  key={app._id}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/seeker/applications/${app._id}`,
                    )
                  }
                  className="w-full text-left flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {app.job?.title}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      app.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : app.status === "reviewing"
                          ? "bg-blue-100 text-blue-700"
                          : app.status === "shortlisted"
                            ? "bg-purple-100 text-purple-700"
                            : app.status === "hired"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">
              No applications yet.
            </p>
          )}
          <Link
            href="/dashboard/seeker/applications"
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            View all applications
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/jobs"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Browse Jobs
              </span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Update Profile
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

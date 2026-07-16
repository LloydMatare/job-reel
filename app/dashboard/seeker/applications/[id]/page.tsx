"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertTriangle, XCircle } from "lucide-react";

export default function SeekerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [withdrawing, setWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const withdraw = useMutation(api.applications.withdrawApplication);

  const data = useQuery(api.applications.getApplication, {
    applicationId: applicationId as any,
  });

  if (data === undefined) {
    return (
      <div className="max-w-3xl mx-auto p-8 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-gray-500">Application not found.</p>
        <button
          onClick={() => router.push("/dashboard/seeker/applications")}
          className="text-blue-600 hover:underline text-sm mt-2"
        >
          Back to my applications
        </button>
      </div>
    );
  }

  const { applicant, job, ...app } = data;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button
        onClick={() => router.push("/dashboard/seeker/applications")}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to My Applications
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {job?.title ?? "Unknown Job"}
            </h1>
            <p className="text-gray-600">{job?.company?.name}</p>
            {job?.company?.location && (
              <p className="text-sm text-gray-500">{job.company.location}</p>
            )}
          </div>
          <StatusBadge status={app.status} />
        </div>

        {(app.status === "pending" || app.status === "reviewing") && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={withdrawing}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
            >
              <XCircle className="size-4" />
              {withdrawing ? "Withdrawing..." : "Withdraw Application"}
            </button>
          </div>
        )}

        {job && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Location</span>
              <span className="text-gray-900">{job.location}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className="text-gray-900 capitalize">
                {job.employmentType}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Location Type</span>
              <span className="text-gray-900 capitalize">
                {job.locationType}
              </span>
            </div>
            {job.salaryMin != null && job.salaryMax != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Salary</span>
                <span className="text-gray-900">
                  {job.salaryCurrency ?? "$"}
                  {job.salaryMin.toLocaleString()} -{" "}
                  {job.salaryCurrency ?? "$"}
                  {job.salaryMax.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {app.resumeStorageId && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              Resume
            </h2>
            <a
              href={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${app.resumeStorageId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Resume
            </a>
          </div>
        )}

        {app.coverLetter && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              Your Cover Letter
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {app.coverLetter}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Application Timeline
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Application Submitted
                </p>
                <p className="text-gray-500">
                  {new Date(app._creationTime).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Current Status</p>
                <span>
                  <StatusBadge status={app.status} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {job?.company && (
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              About {job.company.name}
            </h2>
            {job.company.description && (
              <p className="text-sm text-gray-600 mb-2">
                {job.company.description}
              </p>
            )}
            <div className="text-sm text-gray-500 space-y-1">
              {job.company.industry && <p>Industry: {job.company.industry}</p>}
              {job.company.size && <p>Size: {job.company.size} employees</p>}
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-block"
                >
                  Visit website
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Withdraw Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Withdraw Application?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setWithdrawing(true);
                  setShowConfirm(false);
                  try {
                    await withdraw({ applicationId: applicationId as any });
                    router.push("/dashboard/seeker/applications");
                  } finally {
                    setWithdrawing(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

export default function SeekerApplicationsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const applications = useQuery(api.applications.getMyApplications);
  const withdraw = useMutation(api.applications.withdrawApplication);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  if (!isSignedIn) {
    router.push("/");
    return null;
  }

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    try {
      await withdraw({ applicationId: applicationId as any });
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Applications
      </h1>

      {applications === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-2">
            You haven&apos;t applied to any jobs yet.
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Browse jobs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => {
            const job = app.job;
            return (
              <div
                key={app._id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/seeker/applications/${app._id}`,
                      )
                    }
                    className="flex-1 min-w-0 text-left"
                  >
                    <h2 className="font-semibold text-gray-900 hover:text-blue-600 mb-1">
                      {job.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {job.company?.name ?? "Unknown Company"} &middot;{" "}
                      {job.location}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">
                        Applied{" "}
                        {new Date(app._creationTime).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {job.employmentType}
                      </span>
                    </div>
                  </button>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={app.status} />
                    {app.status === "pending" && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawingId === app._id}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                      >
                        {withdrawingId === app._id
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  FileText,
  Send,
  XCircle,
  Search,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function SeekerApplicationsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const applications = useQuery(api.applications.getMyApplications);
  const withdraw = useMutation(api.applications.withdrawApplication);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage your job applications.
        </p>
      </div>

      {applications === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-border rounded-xl">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Send className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            No Applications Yet
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm text-center">
            You haven&apos;t applied to any jobs yet. Start exploring
            opportunities!
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-all hover:shadow-lg"
          >
            <Search className="size-4" />
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {applications.map((app: any, i: number) => {
            const job = app.job;
            return (
              <div
                key={app._id}
                className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/seeker/applications/${app._id}`,
                      )
                    }
                    className="flex-1 min-w-0 text-left group"
                  >
                    <h2 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors mb-1">
                      {job?.title ?? "Unknown Position"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      {job?.company?.name ?? "Unknown Company"} &middot;{" "}
                      {job?.location ?? "Remote"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Send className="size-3" />
                        Applied{" "}
                        {new Date(app._creationTime).toLocaleDateString()}
                      </span>
                      {job?.employmentType && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                          {job.employmentType}
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <StatusBadge status={app.status} />
                    {(app.status === "pending" || app.status === "reviewing") && (
                      <button
                        onClick={() => setConfirmWithdraw(app._id)}
                        disabled={withdrawingId === app._id}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="size-3" />
                        {withdrawingId === app._id
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </button>
                    )}
                    <ArrowRight className="size-4 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Withdraw Modal */}
      {confirmWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Withdraw Application?
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setConfirmWithdraw(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleWithdraw(confirmWithdraw);
                  setConfirmWithdraw(null);
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

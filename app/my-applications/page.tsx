"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";

const STATUS_STYLES: Record<string, string> = {
  pending: "info",
  reviewing: "info",
  shortlisted: "success",
  rejected: "danger",
  hired: "success",
};

export default function MyApplicationsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const applications = useQuery(api.applications.getMyApplications);

  if (!isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Link
                href="/jobs"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Browse jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => {
                const job = app.job;
                return (
                  <Link
                    key={app._id}
                    href={`/jobs/${job._id}`}
                    className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 mb-1">
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
                      </div>
                      <Badge
                        variant={STATUS_STYLES[app.status] as any}
                      >
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

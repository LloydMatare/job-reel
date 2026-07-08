"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const jobId = params.id as string;

  const job = useQuery(api.jobs.getJob, { jobId: jobId as any });
  const isSaved = useQuery(api.saved_jobs.isJobSaved, { jobId: jobId as any });
  const saveJob = useMutation(api.saved_jobs.saveJob);
  const unsaveJob = useMutation(api.saved_jobs.unsaveJob);

  if (job === undefined) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This job listing may have been removed or is no longer available.
          </p>
          <Button onClick={() => router.push("/jobs")}>
            Browse Jobs
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const hasSalary = job.salaryMin != null && job.salaryMax != null;
  const salary =
    hasSalary
      ? `${job.salaryCurrency ?? "$"}${job.salaryMin!.toLocaleString()} - ${job.salaryCurrency ?? "$"}${job.salaryMax!.toLocaleString()}`
      : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {job.title}
                    </h1>
                    <p className="text-gray-600">
                      {job.company?.name ?? "Unknown Company"}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                    {job.company?.name?.charAt(0) ?? "?"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="info">{job.locationType}</Badge>
                  <Badge>{job.employmentType}</Badge>
                  {job.category && <Badge>{job.category}</Badge>}
                  {job.status === "active" && (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>

                <div className="text-sm text-gray-500 space-y-1 mb-6">
                  <p>{job.location}</p>
                  {salary && <p className="font-medium text-gray-900">{salary}</p>}
                  <p className="text-gray-400">{job.applicationCount ?? 0} applicant{(job.applicationCount ?? 0) !== 1 ? "s" : ""}</p>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h2>
                    <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {job.description}
                    </div>
                  </div>

                  {job.requirements && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Requirements
                      </h2>
                      <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {job.requirements}
                      </div>
                    </div>
                  )}

                  {job.responsibilities && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Responsibilities
                      </h2>
                      <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {job.responsibilities}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (!isSignedIn) {
                        router.push("/role-select");
                        return;
                      }
                      router.push(`/jobs/${jobId}/apply`);
                    }}
                  >
                    Apply Now
                  </Button>

                  {isSignedIn && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (isSaved) {
                          unsaveJob({ jobId: jobId as any });
                        } else {
                          saveJob({ jobId: jobId as any });
                        }
                      }}
                    >
                      {isSaved ? "Saved" : "Save Job"}
                    </Button>
                  )}
                </div>
                {!isSignedIn && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Sign in to save jobs and apply.
                  </p>
                )}
              </div>

              {job.company && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    About the Company
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      {job.company.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {job.company.name}
                      </p>
                      {job.company.website && (
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {job.company.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  {job.company.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {job.company.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    {job.company.location && <p>{job.company.location}</p>}
                    {job.company.industry && <p>{job.company.industry}</p>}
                    {job.company.size && <p>{job.company.size} employees</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

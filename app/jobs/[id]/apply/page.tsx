"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const jobId = params.id as string;

  const job = useQuery(api.jobs.getJob, { jobId: jobId as any });
  const currentUser = useQuery(api.users.getMe);
  const applyToJob = useMutation(api.applications.applyToJob);
  const sendNotification = useAction(api.notifications.sendApplicationNotification);
  const ensureUser = useMutation(api.users.ensureUser);
  const generateUploadUrl = useMutation(api.applications.generateUploadUrl);

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSignedIn) {
    router.push("/");
    return null;
  }

  if (job === undefined || currentUser === undefined) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
        </main>
        <Footer />
      </>
    );
  }

  if (!job || job.status !== "active") {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            This job is no longer accepting applications.
          </p>
          <button
            onClick={() => router.push("/jobs")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Browse Jobs
          </button>
        </main>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your application for <strong>{job.title}</strong> has been received.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/seeker/applications")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              View My Applications
            </button>
            <button
              onClick={() => router.push("/jobs")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Browse More Jobs
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await ensureUser();

      let resumeStorageId = currentUser?.resumeStorageId;

      if (resumeFile) {
        setUploading(true);
        const uploadUrl = await generateUploadUrl();
        const formData = new FormData();
        formData.append("file", resumeFile);
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to upload resume");
        const { storageId } = (await response.json()) as { storageId: string };
        resumeStorageId = storageId as any;
        setUploading(false);
      }

      const result = await applyToJob({
        jobId: jobId as any,
        coverLetter: coverLetter.trim() || undefined,
        resumeStorageId,
      });

      if (result?.employerEmail) {
        sendNotification({
          employerEmail: result.employerEmail,
          jobTitle: result.jobTitle ?? job.title,
          applicantName: currentUser?.name ?? "Someone",
          jobUrl: `${window.location.origin}/dashboard/employer/applications`,
        });
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit application",
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Applying for</p>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">{job.company?.name}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-5"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={currentUser?.name ?? ""}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={currentUser?.email ?? ""}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume
              </label>
              {currentUser?.resumeStorageId ? (
                <div className="text-sm text-green-600 mb-2">
                  Resume on file.{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:underline"
                  >
                    Upload a different one?
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">
                  Upload your resume (optional).
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setResumeFile(e.target.files?.[0] ?? null)
                }
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                placeholder="Tell the employer why you're a great fit for this role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-3">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {uploading
                  ? "Uploading resume..."
                  : submitting
                    ? "Submitting..."
                    : "Submit Application"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const STATUS_OPTIONS = [
  "pending",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  shortlisted: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-green-100 text-green-700",
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const job = useQuery(api.jobs.getJob, { jobId: jobId as any });
  const applications = useQuery(api.applications.getJobApplications, {
    jobId: jobId as any,
  });
  const updateStatus = useMutation(api.applications.updateApplicationStatus);
  const addNotes = useMutation(api.applications.addEmployerNotes);

  const [notesInput, setNotesInput] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  if (job === undefined || applications === undefined) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  if (!job) {
    router.push("/orgs");
    return null;
  }

  const handleStatusChange = async (
    applicationId: string,
    status: (typeof STATUS_OPTIONS)[number],
  ) => {
    await updateStatus({
      applicationId: applicationId as any,
      status,
    });
  };

  const handleSaveNotes = async (applicationId: string) => {
    const notes = notesInput[applicationId];
    if (notes === undefined) return;
    setSavingNotes((prev) => ({ ...prev, [applicationId]: true }));
    await addNotes({
      applicationId: applicationId as any,
      notes,
    });
    setSavingNotes((prev) => ({ ...prev, [applicationId]: false }));
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link
          href="/orgs"
          className="hover:text-gray-700"
        >
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{job.title}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Applications ({applications.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">{job.title}</p>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No applications received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => {
              const applicant = app.applicant;
              const initials = applicant?.name?.charAt(0) ?? "?";

              return (
                <div key={app._id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {applicant?.name ?? "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {applicant?.email ?? ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(
                            app._id,
                            e.target.value as (typeof STATUS_OPTIONS)[number],
                          )
                        }
                        className={`text-xs rounded-lg px-2 py-1 border border-gray-200 font-medium ${STATUS_STYLES[app.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Cover Letter
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {applicant?.skills && applicant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Employer Notes
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={notesInput[app._id] ?? app.employerNotes ?? ""}
                        onChange={(e) =>
                          setNotesInput((prev) => ({
                            ...prev,
                            [app._id]: e.target.value,
                          }))
                        }
                        rows={2}
                        placeholder="Add private notes..."
                        className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSaveNotes(app._id)}
                        disabled={savingNotes[app._id]}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                      >
                        {savingNotes[app._id] ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

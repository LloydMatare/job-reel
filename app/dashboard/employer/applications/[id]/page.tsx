"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

const STATUS_ACTIONS = [
  { label: "Reviewing", value: "reviewing", color: "bg-blue-600" },
  { label: "Shortlist", value: "shortlisted", color: "bg-purple-600" },
  { label: "Reject", value: "rejected", color: "bg-red-600" },
  { label: "Hire", value: "hired", color: "bg-green-600" },
] as const;

export default function EmployerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const data = useQuery(api.applications.getApplication, {
    applicationId: applicationId as any,
  });
  const updateStatus = useMutation(api.applications.updateApplicationStatus);
  const addNotes = useMutation(api.applications.addEmployerNotes);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

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
          onClick={() => router.push("/dashboard/employer/applications")}
          className="text-blue-600 hover:underline text-sm mt-2"
        >
          Back to applications
        </button>
      </div>
    );
  }

  const { applicant, job, ...app } = data;
  const hasInitialNotes = app.employerNotes && !notes;

  if (hasInitialNotes && notes === "") {
    setNotes(app.employerNotes ?? "");
  }

  const handleStatusChange = async (
    status: "reviewing" | "shortlisted" | "rejected" | "hired",
  ) => {
    await updateStatus({ applicationId: applicationId as any, status });
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await addNotes({ applicationId: applicationId as any, notes });
    setSavingNotes(false);
  };

  const jobTitle = job?.title ?? "Unknown Job";

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button
        onClick={() => router.push("/dashboard/employer/applications")}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Applications
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {applicant?.name ?? "Unknown"}
            </h1>
            <p className="text-gray-600">{applicant?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Applied for <strong>{jobTitle}</strong>
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        {applicant?.bio && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Bio</h2>
            <p className="text-sm text-gray-600">{applicant.bio}</p>
          </div>
        )}

        {applicant?.skills && applicant.skills.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
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
              Download Resume
            </a>
          </div>
        )}

        {app.coverLetter && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              Cover Letter
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {app.coverLetter}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Update Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.map((action) => (
              <button
                key={action.value}
                onClick={() =>
                  handleStatusChange(action.value as typeof action.value)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${action.color} hover:opacity-90 transition-opacity`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Private Notes
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add private notes about this candidate..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Timeline
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              <span>
                Applied{" "}
                {new Date(app._creationTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span>
                Status: <StatusBadge status={app.status} />
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            About {jobTitle}
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{job?.location}</p>
            <p className="capitalize">{job?.employmentType}</p>
            <p className="capitalize">{job?.locationType}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

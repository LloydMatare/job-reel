"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { JobCard } from "@/components/JobCard";

export default function SavedJobsPage() {
  const savedJobs = useQuery(api.saved_jobs.getSavedJobs);
  const unsaveJob = useMutation(api.saved_jobs.unsaveJob);

  if (!savedJobs) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
      {savedJobs.length === 0 ? (
        <p className="text-gray-500">No saved jobs yet. Browse jobs and save the ones you like.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job: any) => (
            <div key={job._id} className="relative">
              <JobCard job={job} />
              <button
                onClick={() => unsaveJob({ jobId: job._id })}
                className="absolute top-2 right-2 text-xs text-red-600 hover:underline bg-white px-2 py-1 rounded border border-gray-200"
              >
                Unsave
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

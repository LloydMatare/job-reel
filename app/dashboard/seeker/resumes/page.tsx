"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function ResumesPage() {
  const resumes = useQuery(api.resumes.getMyResumes);
  const deleteResume = useMutation(api.resumes.deleteResume);

  if (!resumes) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
        <Link
          href="/dashboard/seeker/resumes/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          Create New Resume
        </Link>
      </div>
      {resumes.length === 0 ? (
        <p className="text-gray-500">No resumes yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resumes.map((r) => (
            <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-5">
              <Link href={`/dashboard/seeker/resumes/${r._id}`} className="block">
                <h2 className="font-semibold text-gray-900">{r.title}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {r.sections.experience.length} experiences &middot; {r.sections.education.length} education entries &middot; {r.sections.skills.length} skills
                </p>
              </Link>
              <button
                onClick={() => deleteResume({ resumeId: r._id })}
                className="text-xs text-red-600 hover:underline mt-3"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function CoverLettersPage() {
  const coverLetters = useQuery(api.cover_letters.getMyCoverLetters);
  const deleteCoverLetter = useMutation(api.cover_letters.deleteCoverLetter);

  if (!coverLetters) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cover Letters</h1>
        <Link
          href="/dashboard/seeker/cover-letters/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          New Cover Letter
        </Link>
      </div>
      {coverLetters.length === 0 ? (
        <p className="text-gray-500">No cover letters yet. Create one with AI.</p>
      ) : (
        <div className="space-y-3">
          {coverLetters.map((cl: any) => (
            <div key={cl._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {cl.jobTitle ?? "Cover Letter"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(cl._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteCoverLetter({ coverLetterId: cl._id })}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{cl.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

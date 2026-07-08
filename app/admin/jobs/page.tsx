"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminJobs() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const allCompanies = useQuery(api.admin.getAllCompanies);
  const deleteJob = useMutation(api.admin.deleteJob);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== "admin") {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  // Build a flat job list from companies
  const jobs = allCompanies
    ? allCompanies.flatMap((c) =>
        (c as any).jobs?.map((j: any) => ({
          ...j,
          companyName: (c as any).name,
        })) ?? [],
      )
    : [];

  if (!isLoaded || !allCompanies) return <div className="p-8">Loading...</div>;

  const filtered = jobs.filter(
    (j) =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.companyName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-indigo-600 hover:underline">&larr; Back to Dashboard</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Jobs</h1>
      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg mb-6 text-sm"
      />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j._id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{j.title}</td>
                <td className="px-4 py-3 text-gray-500">{j.companyName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    j.status === "active" ? "bg-green-100 text-green-700" :
                    j.status === "closed" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {j.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteJob({ jobId: j._id })}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

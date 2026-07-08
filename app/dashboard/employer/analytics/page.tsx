"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EmployerAnalytics() {
  const company = useQuery(api.companies.getMyCompany);

  if (!company) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Application Analytics</h1>
        <CompanyAnalytics companyId={company._id as any} companyName={company.name} />
    </div>
  );
}

function CompanyAnalytics({ companyId, companyName }: { companyId: any; companyName: string }) {
  const jobs = useQuery(api.jobs.getJobsByCompany, { companyId });
  const allJobs = jobs ?? [];
  const activeJobs = allJobs.filter((j: any) => j.status === "active");
  const closedJobs = allJobs.filter((j: any) => j.status === "closed");
  const totalApps = allJobs.reduce((sum: number, j: any) => sum + (j.applicationCount ?? 0), 0);
  const avgAppsPerJob = allJobs.length ? (totalApps / allJobs.length).toFixed(1) : "0";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-4">{companyName}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Active Jobs</p>
          <p className="text-xl font-bold text-gray-900">{activeJobs.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Total Applications</p>
          <p className="text-xl font-bold text-gray-900">{totalApps}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Closed Jobs</p>
          <p className="text-xl font-bold text-gray-900">{closedJobs.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Avg Apps/Job</p>
          <p className="text-xl font-bold text-gray-900">{avgAppsPerJob}</p>
        </div>
      </div>
      {allJobs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Jobs Breakdown</h3>
          <div className="space-y-2">
            {allJobs.map((j: any) => (
              <div key={j._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{j.title}</span>
                <span className="text-gray-500">{j.applicationCount ?? 0} applications</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

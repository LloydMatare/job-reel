"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const siteStats = useQuery(api.admin.getSiteStats);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== "admin") {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !siteStats) return <div className="p-8">Loading...</div>;

  const stats = [
    { label: "Total Users", value: siteStats.totalUsers, href: "/admin/users" },
    { label: "Active Jobs", value: siteStats.activeJobs, href: "/admin/jobs" },
    { label: "Total Companies", value: siteStats.totalCompanies },
    { label: "Total Applications", value: siteStats.totalApplications },
    { label: "Seekers", value: siteStats.seekers },
    { label: "Employers", value: siteStats.employers },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            {s.href ? (
              <Link href={s.href} className="block">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </Link>
            ) : (
              <>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

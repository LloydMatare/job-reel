"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  UserCheck,
  UserCog,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const siteStats = useQuery(api.admin.getSiteStats);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== "admin") {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !siteStats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: siteStats.totalUsers, href: "/admin/users", icon: Users, gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Active Jobs", value: siteStats.activeJobs, href: "/admin/jobs", icon: Briefcase, gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Companies", value: siteStats.totalCompanies, href: "/admin/companies", icon: Building2, gradient: "from-violet-500 to-violet-600", bg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Applications", value: siteStats.totalApplications, icon: FileText, gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Seekers", value: siteStats.seekers, icon: UserCheck, gradient: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", iconColor: "text-cyan-600" },
    { label: "Employers", value: siteStats.employers, icon: UserCog, gradient: "from-rose-500 to-rose-600", bg: "bg-rose-50", iconColor: "text-rose-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-8 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-white/60 mt-0.5">Site overview and management</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href ?? "#"}
            className={`group block bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 ${!s.href ? "cursor-default" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
            {s.href && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                View details <span className="text-xs">→</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

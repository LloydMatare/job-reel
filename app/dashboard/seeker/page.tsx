"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Bookmark,
  Briefcase,
  ArrowRight,
  Search,
  User,
  Star,
  Send,
  File,
  MessageSquare,
} from "lucide-react";

export default function SeekerOverviewPage() {
  const router = useRouter();
  const applications = useQuery(api.applications.getMyApplications);
  const savedJobs = useQuery(api.saved_jobs.getSavedJobs);
  const currentUser = useQuery(api.users.getMe);

  const appCount = applications?.length ?? 0;
  const savedCount = savedJobs?.length ?? 0;
  const activeApps =
    applications?.filter(
      (a: any) => a.status === "pending" || a.status === "reviewing",
    ).length ?? 0;

  const statCards = [
    {
      label: "Applications",
      value: appCount,
      icon: Send,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active",
      value: activeApps,
      icon: Star,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Saved Jobs",
      value: savedCount,
      icon: Bookmark,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  const quickActions = [
    {
      label: "Browse Jobs",
      href: "/jobs",
      icon: Search,
      desc: "Find your next opportunity",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Update Profile",
      href: "/profile",
      icon: User,
      desc: "Enhance your profile",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Build Resume",
      href: "/dashboard/seeker/resumes",
      icon: File,
      desc: "Create a standout resume",
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Career Chat",
      href: "/dashboard/seeker/career-guidance",
      icon: MessageSquare,
      desc: "Get AI career advice",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Welcome back{currentUser?.name ? `, ${currentUser.name}` : ""}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of your job search.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`size-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`size-5 ${card.iconColor}`} />
                </div>
                <div
                  className={`h-1 w-12 rounded-full bg-gradient-to-r ${card.gradient} opacity-60`}
                />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {card.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-blue-600" />
              <h2 className="font-semibold text-foreground text-sm">
                Recent Applications
              </h2>
            </div>
            <Link
              href="/dashboard/seeker/applications"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>

          {applications && applications.length > 0 ? (
            <div className="divide-y divide-border/50">
              {applications.slice(0, 5).map((app: any, i: number) => (
                <button
                  key={app._id}
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/seeker/applications/${app._id}`)
                  }
                  className="w-full text-left flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group/item animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground group-hover/item:text-blue-600 transition-colors truncate">
                      {app.job?.title ?? "Unknown Position"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.job?.company?.name ?? "Unknown Company"} &middot;{" "}
                      {new Date(app._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      app.status === "pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : app.status === "reviewing"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : app.status === "shortlisted"
                            ? "bg-violet-50 text-violet-700 border border-violet-200"
                            : app.status === "hired"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {app.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Send className="size-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                No applications yet.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Search className="size-3.5" />
                Browse Jobs
              </Link>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <h2 className="font-semibold text-foreground text-sm">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-border hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className={`size-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {savedJobs && savedJobs.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="size-4 text-violet-600" />
              <h2 className="font-semibold text-foreground text-sm">Saved Jobs</h2>
            </div>
            <Link
              href="/dashboard/seeker/saved"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {savedJobs.slice(0, 3).map((saved: any) => (
              <Link
                key={saved._id}
                href={`/jobs/${saved.job?._id ?? saved.jobId}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors group/item"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground group-hover/item:text-blue-600 transition-colors truncate">
                    {saved.job?.title ?? "Unknown Position"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {saved.job?.company?.name ?? "Unknown Company"}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-all -translate-x-1 group-hover/item:translate-x-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SIDEBAR_ICONS } from "@/components/Sidebar";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/dashboard/seeker", label: "Overview", icon: SIDEBAR_ICONS.dashboard },
  {
    href: "/dashboard/seeker/applications",
    label: "My Applications",
    icon: SIDEBAR_ICONS.applications,
  },
  { href: "/dashboard/seeker/saved", label: "Saved Jobs", icon: SIDEBAR_ICONS.saved },
  { href: "/dashboard/seeker/resumes", label: "Resumes", icon: SIDEBAR_ICONS.document },
  { href: "/dashboard/seeker/cover-letters", label: "Cover Letters", icon: SIDEBAR_ICONS.document },
  { href: "/dashboard/seeker/alerts", label: "Job Alerts", icon: SIDEBAR_ICONS.bell },
  { href: "/dashboard/seeker/career-guidance", label: "Career Guidance", icon: SIDEBAR_ICONS.chat },
  { href: "/profile", label: "Profile", icon: SIDEBAR_ICONS.profile },
];

export default function SeekerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Job Reels
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/jobs"
                className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
              >
                Browse Jobs
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden md:block w-56 shrink-0">
            <Sidebar items={NAV_ITEMS} />
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                isActive
                  ? "text-blue-700 border-t-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

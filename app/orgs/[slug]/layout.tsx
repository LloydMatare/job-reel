"use client";

import { OrganizationSwitcher, useOrganization, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function OrgLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { orgSlug, isLoaded } = useAuth();
  const { organization } = useOrganization();
  const company = useQuery(api.companies.getMyCompany);

  useEffect(() => {
    if (isLoaded && orgSlug && orgSlug !== params.slug) {
      router.replace(`/orgs/${orgSlug}/dashboard`);
    }
  }, [isLoaded, orgSlug, params.slug, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const slug = params.slug as string;
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const navItems = [
    { href: `/orgs/${slug}/dashboard`, label: "Dashboard" },
    { href: `/orgs/${slug}/members`, label: "Members" },
    { href: `/orgs/${slug}/settings`, label: "Settings" },
    { href: `/orgs/${slug}/billing`, label: "Billing" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Job Reels
            </Link>
            <div className="flex items-center gap-4">
              {company && (
                <span className="text-sm text-gray-600 hidden sm:block">
                  {company.name}
                </span>
              )}
              <OrganizationSwitcher
                hidePersonal
                afterCreateOrganizationUrl="/orgs/:slug/dashboard"
                afterSelectOrganizationUrl="/orgs/:slug/dashboard"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <nav className="hidden md:flex flex-col w-56 shrink-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <main className="flex-1 min-w-0">{children}</main>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center px-2 py-3 text-xs font-medium ${
                isActive(item.href)
                  ? "text-blue-700 border-t-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

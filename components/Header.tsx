"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const { orgSlug } = useAuth();
  const currentUser = useQuery(api.users.getMe);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/jobs", label: "Find Jobs", show: true },
    {
      href: "/dashboard/seeker/applications",
      label: "My Applications",
      show: currentUser?.role === "seeker",
    },
    {
      href: "/profile",
      label: "Profile",
      show: currentUser?.role === "seeker" || (currentUser?.role === "employer" && !orgSlug),
    },
    {
      href: `/orgs/${orgSlug}/dashboard`,
      label: "Dashboard",
      show: currentUser?.role === "employer" && !!orgSlug,
    },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Job Reels
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Authenticated>
                <UserButton afterSignOutUrl="/" />
              </Authenticated>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </Unauthenticated>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            <Authenticated>
              <div className="px-3 py-2 text-sm text-gray-500">
                <UserButton afterSignOutUrl="/" showName />
              </div>
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </Unauthenticated>
          </div>
        </div>
      )}
    </header>
  );
}

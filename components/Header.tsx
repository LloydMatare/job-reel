"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export function Header() {
  const { orgSlug } = useAuth();
  const currentUser = useQuery(api.users.getMe);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Job Reels
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/jobs"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Find Jobs
              </Link>
              {currentUser?.role === "employer" && orgSlug && (
                <Link
                  href={`/orgs/${orgSlug}/dashboard`}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              {currentUser?.role === "seeker" && (
                <>
                  <Link
                    href="/my-applications"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    My Applications
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}

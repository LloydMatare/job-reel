"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleSelectPage() {
  const { user } = useUser();
  const { orgSlug } = useAuth();
  const router = useRouter();
  const onboardUser = useMutation(api.users.onboardUser);
  const ensureUser = useMutation(api.users.ensureUser);
  const currentUser = useQuery(api.users.getMe);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.onboarded) {
      if (currentUser.role === "employer") {
        if (orgSlug) {
          router.push(`/orgs/${orgSlug}/dashboard`);
        } else {
          router.push("/company/new");
        }
      } else {
        router.push("/");
      }
    }
  }, [currentUser, router, orgSlug]);

  if (!user || currentUser?.onboarded) return null;

  const handleRoleSelect = async (role: "seeker" | "employer") => {
    setSubmitting(true);
    try {
      await ensureUser();
      await onboardUser({
        role,
        name: user.fullName ?? "",
      });
      if (role === "employer") {
        router.push("/company/new");
      } else {
        router.push("/");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Job Reels
          </h1>
          <p className="text-lg text-gray-600">
            How would you like to use our platform?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleRoleSelect("seeker")}
            disabled={submitting}
            className="bg-white rounded-xl border-2 border-gray-200 p-8 text-left hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <div className="mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              I&apos;m Looking for a Job
            </h2>
            <p className="text-gray-600">
              Browse thousands of listings, apply with your profile, and track
              your applications.
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect("employer")}
            disabled={submitting}
            className="bg-white rounded-xl border-2 border-gray-200 p-8 text-left hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <div className="mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              I&apos;m Hiring
            </h2>
            <p className="text-gray-600">
              Post jobs, find great candidates, and manage applications all in
              one place.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

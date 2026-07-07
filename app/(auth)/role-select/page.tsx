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
            <div className="text-4xl mb-4">🔍</div>
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
            <div className="text-4xl mb-4">🏢</div>
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

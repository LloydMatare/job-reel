"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";

type Plan = "free" | "pro" | "enterprise";

const PLAN_LIMITS: Record<Plan, { activeJobs: number; teamSeats: number; featuredJobs: boolean; analytics: boolean }> = {
  free: { activeJobs: 1, teamSeats: 2, featuredJobs: false, analytics: false },
  pro: { activeJobs: 10, teamSeats: 10, featuredJobs: true, analytics: true },
  enterprise: { activeJobs: 999, teamSeats: 999, featuredJobs: true, analytics: true },
};

const PLAN_PRICES: Record<Plan, string> = {
  free: "$0",
  pro: "$29/mo",
  enterprise: "Custom",
};

export default function BillingPage() {
  const { organization, membership } = useOrganization();
  const planInfo = useQuery(api.billing.getOrgPlan);

  const isAdmin =
    membership &&
    (membership.role === "org:admin" || membership.role === "org:owner");

  const plans: { key: Plan; name: string; description: string }[] = [
    {
      key: "free",
      name: "Free",
      description: "For small teams getting started",
    },
    {
      key: "pro",
      name: "Pro",
      description: "For growing companies",
    },
    {
      key: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
    },
  ];

  if (planInfo === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const currentPlan = planInfo?.plan ?? "free";
  const limits = planInfo?.limits ?? PLAN_LIMITS.free;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and usage limits.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Current Plan:{" "}
          <span className="text-blue-600 capitalize">{currentPlan}</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {PLAN_PRICES[currentPlan as Plan] ?? "$0"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Active Jobs</p>
            <p className="text-lg font-semibold text-gray-900">
              {limits.activeJobs === 999 ? "Unlimited" : limits.activeJobs}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Team Seats</p>
            <p className="text-lg font-semibold text-gray-900">
              {limits.teamSeats === 999 ? "Unlimited" : `${limits.teamSeats}`}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Featured Jobs</p>
            <p className="text-lg font-semibold text-gray-900">
              {limits.featuredJobs ? "Included" : "Not included"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Analytics</p>
            <p className="text-lg font-semibold text-gray-900">
              {limits.analytics ? "Included" : "Not included"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const planLimits = PLAN_LIMITS[plan.key];
            const isCurrent = currentPlan === plan.key;

            return (
              <div
                key={plan.key}
                className={`bg-white border rounded-xl p-6 ${
                  plan.key === "pro"
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-gray-200"
                } ${isCurrent ? "opacity-80" : ""}`}
              >
                <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  {PLAN_PRICES[plan.key]}
                </p>

                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2">
                    <span
                      className={
                        planLimits.activeJobs === 999
                          ? "text-blue-600"
                          : "text-gray-700"
                      }
                    >
                      {planLimits.activeJobs === 999
                        ? "Unlimited"
                        : planLimits.activeJobs}{" "}
                      active jobs
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={
                        planLimits.teamSeats === 999
                          ? "text-blue-600"
                          : "text-gray-700"
                      }
                    >
                      {planLimits.teamSeats === 999
                        ? "Unlimited"
                        : planLimits.teamSeats}{" "}
                      team seats
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={
                        planLimits.featuredJobs
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    >
                      {planLimits.featuredJobs
                        ? "Featured jobs"
                        : "No featured jobs"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={
                        planLimits.analytics
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    >
                      {planLimits.analytics
                        ? "Analytics included"
                        : "No analytics"}
                    </span>
                  </li>
                </ul>

                {isCurrent ? (
                  <span className="block w-full text-center py-2 px-4 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">
                    Current Plan
                  </span>
                ) : (
                  <a
                    href="https://clerk.com/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-2 px-4 rounded-lg text-sm font-medium ${
                      isAdmin
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!isAdmin) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {isAdmin ? "Upgrade" : "Contact Admin"}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

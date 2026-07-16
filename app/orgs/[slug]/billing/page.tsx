"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Briefcase,
  Users,
  Star,
  BarChart3,
  Check,
  Minus,
  CreditCard,
} from "lucide-react";

type Plan = "free" | "pro" | "enterprise";

const PLAN_LIMITS: Record<
  Plan,
  {
    activeJobs: number;
    teamSeats: number;
    featuredJobs: boolean;
    analytics: boolean;
  }
> = {
  free: { activeJobs: 1, teamSeats: 2, featuredJobs: false, analytics: false },
  pro: {
    activeJobs: 10,
    teamSeats: 10,
    featuredJobs: true,
    analytics: true,
  },
  enterprise: {
    activeJobs: 999,
    teamSeats: 999,
    featuredJobs: true,
    analytics: true,
  },
};

const PLAN_PRICES: Record<Plan, string> = {
  free: "$0",
  pro: "$29/mo",
  enterprise: "Custom",
};


export default function BillingPage() {
  const planInfo = useQuery(api.billing.getOrgPlan);
  const myRole = useQuery(api.permissions.getMyCompanyRole);

  if (planInfo === undefined || myRole === undefined) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (myRole !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Billing</h1>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">Only admins can access billing. Contact your organization admin.</p>
        </div>
      </div>
    );
  }

  const currentPlan = planInfo?.plan ?? "free";
  const limits = planInfo?.limits ?? PLAN_LIMITS.free;

  const currentPlanLimits = [
    {
      label: "Active Jobs",
      value:
        limits.activeJobs === 999 ? "Unlimited" : `${limits.activeJobs}`,
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Team Seats",
      value:
        limits.teamSeats === 999 ? "Unlimited" : `${limits.teamSeats}`,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Featured Jobs",
      value: limits.featuredJobs ? "Included" : "Not included",
      icon: Star,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Analytics",
      value: limits.analytics ? "Included" : "Not included",
      icon: BarChart3,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  const plans: {
    key: Plan;
    name: string;
    description: string;
    highlighted: boolean;
  }[] = [
    {
      key: "free",
      name: "Free",
      description: "For small teams getting started",
      highlighted: false,
    },
    {
      key: "pro",
      name: "Pro",
      description: "For growing companies",
      highlighted: true,
    },
    {
      key: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      highlighted: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and usage limits.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">
                Current Plan
              </h2>
              <p className="text-2xl font-bold text-blue-600 capitalize mt-0.5">
                {currentPlan}
              </p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {PLAN_PRICES[currentPlan as Plan]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {currentPlanLimits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`${item.color} rounded-xl p-4`}
              >
                <Icon className="size-4 mb-2" />
                <p className="text-xs opacity-70">{item.label}</p>
                <p className="text-lg font-bold mt-0.5">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-foreground mb-4">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const planLimits = PLAN_LIMITS[plan.key];
            const isCurrent = currentPlan === plan.key;

            const featureList = [
              {
                label: `${planLimits.activeJobs === 999 ? "Unlimited" : planLimits.activeJobs} active jobs`,
                included: true,
              },
              {
                label: `${planLimits.teamSeats === 999 ? "Unlimited" : planLimits.teamSeats} team seats`,
                included: true,
              },
              {
                label: "Featured jobs",
                included: planLimits.featuredJobs,
              },
              {
                label: "Analytics",
                included: planLimits.analytics,
              },
            ];

            return (
              <div
                key={plan.key}
                className={`relative bg-card border rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? "border-blue-500 ring-1 ring-blue-500/20"
                    : "border-border"
                } ${isCurrent ? "opacity-90" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center ${
                      plan.highlighted
                        ? "bg-blue-100 text-blue-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <p className="text-2xl font-bold text-foreground mb-5">
                  {PLAN_PRICES[plan.key]}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.key !== "enterprise" ? "" : ""}
                  </span>
                </p>

                <ul className="space-y-3 mb-6">
                  {featureList.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-2.5 text-sm">
                      {feature.included ? (
                        <div className="size-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <Check className="size-3 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="size-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Minus className="size-3 text-muted-foreground" />
                        </div>
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <span className="block w-full text-center py-2.5 px-4 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
                    Current Plan
                  </span>
                ) : (
                  <a
                    href="https://clerk.com/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                      plan.key === "pro"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {plan.key === "pro" ? "Upgrade to Pro" : "Contact Sales"}
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

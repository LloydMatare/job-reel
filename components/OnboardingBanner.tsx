"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight, User } from "lucide-react";

export function OnboardingBanner({ type }: { type: "seeker" | "employer" }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const href = type === "seeker" ? "/profile" : "/company/edit";
  const message =
    type === "seeker"
      ? "Complete your profile to stand out to employers"
      : "Complete your company profile to attract candidates";

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-200/50 dark:border-amber-800/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="relative px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <User className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Complete Now
            <ArrowRight className="size-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="size-7 flex items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-500 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

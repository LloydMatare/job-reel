"use client";

import { OrganizationProfile } from "@clerk/nextjs";

export default function OrgSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your organization settings and preferences.
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 rounded-xl",
              navbar: "block",
              pageScrollBox: "p-6",
            },
          }}
        />
      </div>
    </div>
  );
}

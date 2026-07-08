"use client";

import { OrganizationProfile } from "@clerk/nextjs";

export default function OrgMembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Members
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization members and roles.
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 rounded-xl",
              navbar: "hidden",
              pageScrollBox: "p-6",
            },
          }}
        />
      </div>
    </div>
  );
}

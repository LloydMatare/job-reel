"use client";

import { OrganizationProfile } from "@clerk/nextjs";

export default function OrgMembersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Members</h1>
      <OrganizationProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border border-gray-200 rounded-xl",
          },
        }}
      />
    </div>
  );
}

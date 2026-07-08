"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganizationList, useOrganization, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewCompanyPage() {
  const router = useRouter();
  const { createOrganization, setActive } = useOrganizationList();
  const { organization } = useOrganization();
  const { orgSlug, getToken } = useAuth();
  const createOrgCompany = useMutation(api.companies.createOrgCompany);
  const ensureUser = useMutation(api.users.ensureUser);
  const company = useQuery(api.companies.getMyCompany);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [industry, setIndustry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{
    clerkOrgId: string;
    orgSlug: string;
    name: string;
    description: string;
    website?: string;
    location?: string;
    size?: string;
    industry?: string;
  } | null>(null);

  useEffect(() => {
    if (company) {
      router.push(orgSlug ? `/orgs/${orgSlug}/dashboard` : "/profile");
    }
  }, [company, router, orgSlug]);

  useEffect(() => {
    if (!pending) return;
    // Wait until Clerk reports the target org as active. That change is what
    // makes ConvexProviderWithClerk re-mint the Convex token with the org claim.
    if (organization?.id !== pending.clerkOrgId) return;

    let cancelled = false;
    (async () => {
      try {
        // Force a fresh "convex" token so the active-org claim is present before
        // the mutation is sent.
        const token = await getToken({ template: "convex", skipCache: true });
        // TEMP debug: confirm the org is active and inspect the claims the
        // "convex" JWT template actually emits. Remove once verified.
        try {
          const claims = token
            ? (JSON.parse(
                atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
              ) as Record<string, unknown>)
            : null;
          console.log(
            "[org-debug] activeOrg =",
            organization?.id,
            "| target =",
            pending.clerkOrgId,
            "| claimKeys =",
            claims ? Object.keys(claims) : null,
            "| org =",
            { orgId: claims?.orgId, org_id: claims?.org_id, o: claims?.o },
          );
        } catch (decodeErr) {
          console.log("[org-debug] token decode failed", decodeErr);
        }
        await createOrgCompany({
          clerkOrgId: pending.clerkOrgId,
          name: pending.name,
          description: pending.description,
          website: pending.website,
          location: pending.location,
          size: pending.size,
          industry: pending.industry,
        });
        if (!cancelled) router.push(`/orgs/${pending.orgSlug}/dashboard`);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setSubmitting(false);
          setPending(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pending, organization?.id, getToken, createOrgCompany, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("Company name and description are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await ensureUser();

      let clerkOrgId: string;
      let targetSlug: string;

      if (organization) {
        clerkOrgId = organization.id;
        targetSlug = organization.slug ?? organization.id;
      } else if (createOrganization && setActive) {
        const org = await createOrganization({ name: name.trim() });
        clerkOrgId = org.id;
        targetSlug = org.slug ?? org.id;
        // Make the new org active so Clerk mints a session token that carries it.
        await setActive({ organization: org.id });
      } else {
        throw new Error("Unable to create organization");
      }

      // Defer the mutation: Convex must re-mint its token with the active-org
      // claim first. The effect above runs it once the active org is reflected.
      setPending({
        clerkOrgId,
        orgSlug: targetSlug,
        name: name.trim(),
        description: description.trim(),
        website: website.trim() || undefined,
        location: location.trim() || undefined,
        size: size || undefined,
        industry: industry || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Create Your Company
      </h1>
      <p className="text-gray-600 mb-8">
        Set up your company profile to start posting jobs.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1001+">1001+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Company"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
